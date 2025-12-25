"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";
import { DbEvent, GrantApplication, Referral, FormSubmission, FormConfig, FormField } from "@/lib/db";

type EventFormData = Omit<DbEvent, "id" | "created_at" | "updated_at">;

const emptyEvent: EventFormData = {
  title: "",
  date: "",
  time: "",
  location: "",
  description: "",
  category: "basketball",
  image_url: "",
  registration_url: "",
  registration_type: "none",
  registration_fields: [],
  max_registrations: undefined,
};

type MainTab = "submissions" | "events" | "settings";
type SubmissionTab = "messages" | "applications" | "referrals";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [events, setEvents] = useState<DbEvent[]>([]);
  const [applications, setApplications] = useState<GrantApplication[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [formSubmissions, setFormSubmissions] = useState<FormSubmission[]>([]);
  const [formConfigs, setFormConfigs] = useState<FormConfig[]>([]);
  const [donationUrl, setDonationUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Event form state
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<DbEvent | null>(null);
  const [eventForm, setEventForm] = useState<EventFormData>(emptyEvent);

  // Tab state
  const [mainTab, setMainTab] = useState<MainTab>("submissions");
  const [submissionTab, setSubmissionTab] = useState<SubmissionTab>("messages");

  // Form config editing state
  const [editingFormConfig, setEditingFormConfig] = useState<FormConfig | null>(null);
  const [showFormEditor, setShowFormEditor] = useState(false);

  // Filter state for messages
  const [messageFilters, setMessageFilters] = useState({
    formType: "all",
    status: "all",
    search: "",
  });

  // Notes editing state
  const [editingNotes, setEditingNotes] = useState<{ id: number; notes: string; type: "submission" | "application" | "referral" } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [eventsRes, settingsRes, applicationsRes, referralsRes, submissionsRes, configsRes] = await Promise.all([
        fetch("/api/events"),
        fetch("/api/settings?key=donation_url"),
        fetch("/api/applications"),
        fetch("/api/referrals"),
        fetch("/api/form-submissions"),
        fetch("/api/form-configs"),
      ]);

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData);
      }

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setDonationUrl(settingsData.value || "");
      }

      if (applicationsRes.ok) {
        const applicationsData = await applicationsRes.json();
        setApplications(applicationsData);
      }

      if (referralsRes.ok) {
        const referralsData = await referralsRes.json();
        setReferrals(referralsData);
      }

      if (submissionsRes.ok) {
        const submissionsData = await submissionsRes.json();
        setFormSubmissions(submissionsData);
      }

      if (configsRes.ok) {
        const configsData = await configsRes.json();
        setFormConfigs(configsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessage({ type: "error", text: "Failed to load data" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    } else if (status === "authenticated") {
      fetchData();
    }
  }, [status, router, fetchData]);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    return formSubmissions.filter((s) => {
      if (messageFilters.formType !== "all" && s.form_type !== messageFilters.formType) return false;
      if (messageFilters.status !== "all" && s.status !== messageFilters.status) return false;
      if (messageFilters.search) {
        const searchLower = messageFilters.search.toLowerCase();
        const data = s.data as Record<string, string>;
        const matchesSearch = Object.values(data).some(
          (v) => typeof v === "string" && v.toLowerCase().includes(searchLower)
        );
        if (!matchesSearch) return false;
      }
      return true;
    });
  }, [formSubmissions, messageFilters]);

  // CSV Export function
  const exportToCSV = (dataType: "messages" | "applications" | "referrals") => {
    let csvContent = "";
    let filename = "";

    if (dataType === "messages") {
      const data = filteredSubmissions;
      if (data.length === 0) return;

      // Get all unique field keys from all submissions
      const allKeys = new Set<string>();
      data.forEach((s) => {
        Object.keys(s.data as Record<string, unknown>).forEach((k) => allKeys.add(k));
      });
      const fieldKeys = Array.from(allKeys);

      // CSV header
      csvContent = ["ID", "Form Type", "Status", "Date", ...fieldKeys, "Notes"].join(",") + "\n";

      // CSV rows
      data.forEach((s) => {
        const rowData = s.data as Record<string, string>;
        const row = [
          s.id,
          s.form_type,
          s.status,
          new Date(s.created_at).toLocaleDateString(),
          ...fieldKeys.map((k) => `"${(rowData[k] || "").replace(/"/g, '""')}"`),
          `"${(s.notes || "").replace(/"/g, '""')}"`,
        ];
        csvContent += row.join(",") + "\n";
      });

      filename = `form-submissions-${new Date().toISOString().split("T")[0]}.csv`;
    } else if (dataType === "applications") {
      if (applications.length === 0) return;

      csvContent = ["ID", "Name", "Email", "Phone", "Sport", "Need", "Story", "Status", "Notes", "Date"].join(",") + "\n";

      applications.forEach((a) => {
        const row = [
          a.id,
          `"${a.name}"`,
          `"${a.email}"`,
          `"${a.phone || ""}"`,
          `"${a.sport}"`,
          `"${a.need.replace(/"/g, '""')}"`,
          `"${(a.story || "").replace(/"/g, '""')}"`,
          a.status,
          `"${(a.notes || "").replace(/"/g, '""')}"`,
          new Date(a.created_at).toLocaleDateString(),
        ];
        csvContent += row.join(",") + "\n";
      });

      filename = `grant-applications-${new Date().toISOString().split("T")[0]}.csv`;
    } else if (dataType === "referrals") {
      if (referrals.length === 0) return;

      csvContent = [
        "ID", "Patient Name", "Patient Email", "Patient Phone",
        "Referrer Name", "Referrer Email", "Referrer Org", "Referrer Role",
        "Patient Needs", "Additional Info", "Status", "Notes", "Date"
      ].join(",") + "\n";

      referrals.forEach((r) => {
        const row = [
          r.id,
          `"${r.patient_name}"`,
          `"${r.patient_email || ""}"`,
          `"${r.patient_phone || ""}"`,
          `"${r.referrer_name}"`,
          `"${r.referrer_email}"`,
          `"${r.referrer_organization || ""}"`,
          `"${r.referrer_role || ""}"`,
          `"${r.patient_needs.replace(/"/g, '""')}"`,
          `"${(r.additional_info || "").replace(/"/g, '""')}"`,
          r.status,
          `"${(r.notes || "").replace(/"/g, '""')}"`,
          new Date(r.created_at).toLocaleDateString(),
        ];
        csvContent += row.join(",") + "\n";
      });

      filename = `patient-referrals-${new Date().toISOString().split("T")[0]}.csv`;
    }

    // Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  // Save notes
  const saveNotes = async () => {
    if (!editingNotes) return;

    try {
      let url = "";
      if (editingNotes.type === "submission") {
        url = `/api/form-submissions/${editingNotes.id}`;
      } else if (editingNotes.type === "application") {
        url = `/api/applications/${editingNotes.id}`;
      } else {
        url = `/api/referrals/${editingNotes.id}`;
      }

      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: editingNotes.notes }),
      });

      if (res.ok) {
        showMessage("success", "Notes saved!");
        setEditingNotes(null);
        fetchData();
      } else {
        showMessage("error", "Failed to save notes");
      }
    } catch {
      showMessage("error", "Failed to save notes");
    }
  };

  // Generate mailto link for reply
  const getReplyMailto = (email: string, name: string, subject: string) => {
    const body = `Hi ${name},\n\nThank you for reaching out to AdaptToLife.\n\n`;
    return `mailto:${email}?subject=Re: ${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const initializeDb = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/init", { method: "POST" });
      if (res.ok) {
        showMessage("success", "Database initialized successfully!");
        fetchData();
      } else {
        showMessage("error", "Failed to initialize database");
      }
    } catch {
      showMessage("error", "Failed to initialize database");
    } finally {
      setIsSaving(false);
    }
  };

  const saveDonationUrl = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "donation_url", value: donationUrl }),
      });
      if (res.ok) {
        showMessage("success", "Donation URL updated!");
      } else {
        showMessage("error", "Failed to update donation URL");
      }
    } catch {
      showMessage("error", "Failed to update donation URL");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const url = editingEvent
        ? `/api/events/${editingEvent.id}`
        : "/api/events";
      const method = editingEvent ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventForm),
      });

      if (res.ok) {
        showMessage(
          "success",
          editingEvent ? "Event updated!" : "Event created!"
        );
        setShowEventForm(false);
        setEditingEvent(null);
        setEventForm(emptyEvent);
        fetchData();
      } else {
        showMessage("error", "Failed to save event");
      }
    } catch {
      showMessage("error", "Failed to save event");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEvent = async (id: number) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (res.ok) {
        showMessage("success", "Event deleted!");
        fetchData();
      } else {
        showMessage("error", "Failed to delete event");
      }
    } catch {
      showMessage("error", "Failed to delete event");
    }
  };

  const editEvent = (event: DbEvent) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      description: event.description,
      category: event.category,
      image_url: event.image_url || "",
      registration_url: event.registration_url || "",
      registration_type: event.registration_type || "none",
      registration_fields: event.registration_fields || [],
      max_registrations: event.max_registrations,
    });
    setShowEventForm(true);
  };

  const updateApplicationStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showMessage("success", "Application status updated!");
        fetchData();
      } else {
        showMessage("error", "Failed to update application");
      }
    } catch {
      showMessage("error", "Failed to update application");
    }
  };

  const deleteApplication = async (id: number) => {
    if (!confirm("Are you sure you want to delete this application?")) return;

    try {
      const res = await fetch(`/api/applications/${id}`, { method: "DELETE" });
      if (res.ok) {
        showMessage("success", "Application deleted!");
        fetchData();
      } else {
        showMessage("error", "Failed to delete application");
      }
    } catch {
      showMessage("error", "Failed to delete application");
    }
  };

  const updateReferralStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/referrals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showMessage("success", "Referral status updated!");
        fetchData();
      } else {
        showMessage("error", "Failed to update referral");
      }
    } catch {
      showMessage("error", "Failed to update referral");
    }
  };

  const deleteReferral = async (id: number) => {
    if (!confirm("Are you sure you want to delete this referral?")) return;

    try {
      const res = await fetch(`/api/referrals/${id}`, { method: "DELETE" });
      if (res.ok) {
        showMessage("success", "Referral deleted!");
        fetchData();
      } else {
        showMessage("error", "Failed to delete referral");
      }
    } catch {
      showMessage("error", "Failed to delete referral");
    }
  };

  const updateSubmissionStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/form-submissions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showMessage("success", "Message status updated!");
        fetchData();
      } else {
        showMessage("error", "Failed to update message");
      }
    } catch {
      showMessage("error", "Failed to update message");
    }
  };

  const deleteSubmission = async (id: number) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    try {
      const res = await fetch(`/api/form-submissions/${id}`, { method: "DELETE" });
      if (res.ok) {
        showMessage("success", "Message deleted!");
        fetchData();
      } else {
        showMessage("error", "Failed to delete message");
      }
    } catch {
      showMessage("error", "Failed to delete message");
    }
  };

  const saveFormConfig = async (config: FormConfig) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/form-configs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form_type: config.form_type,
          title: config.title,
          description: config.description,
          fields: config.fields,
          submit_button_text: config.submit_button_text,
          success_message: config.success_message,
          enabled: config.enabled,
        }),
      });
      if (res.ok) {
        showMessage("success", "Form configuration saved!");
        setShowFormEditor(false);
        setEditingFormConfig(null);
        fetchData();
      } else {
        showMessage("error", "Failed to save form configuration");
      }
    } catch {
      showMessage("error", "Failed to save form configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
      case "new":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
      case "enrolled":
      case "replied":
        return "bg-green-100 text-green-800";
      case "denied":
      case "closed":
      case "archived":
        return "bg-red-100 text-red-800";
      case "in_review":
      case "contacted":
      case "read":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getFormTypeLabel = (formType: string) => {
    const labels: Record<string, string> = {
      contact: "Contact",
      volunteer: "Volunteer",
      corporate_sponsorship: "Corporate Sponsorship",
      equipment_donation: "Equipment Donation",
    };
    return labels[formType] || formType;
  };

  const newMessageCount = formSubmissions.filter(s => s.status === "new").length;

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{session.user?.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Message Toast */}
      {message && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
            message.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {message.text}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Email Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="font-semibold text-amber-800">Email Notifications</h3>
              <p className="text-sm text-amber-700 mt-1">
                Email notifications will be sent automatically when configured. Add <code className="bg-amber-100 px-1 rounded">RESEND_API_KEY</code> and <code className="bg-amber-100 px-1 rounded">ADMIN_NOTIFICATION_EMAILS</code> environment variables to enable.
              </p>
            </div>
          </div>
        </div>

        {/* Main Navigation Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMainTab("submissions")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              mainTab === "submissions"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Submissions
            {newMessageCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {newMessageCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setMainTab("events")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              mainTab === "events"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Events
          </button>
          <button
            onClick={() => setMainTab("settings")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              mainTab === "settings"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Settings
          </button>
        </div>

        {/* Submissions Tab */}
        {mainTab === "submissions" && (
          <section className="bg-white rounded-xl shadow-md p-6">
            <div className="flex gap-4 border-b border-gray-200 mb-6">
              <button
                onClick={() => setSubmissionTab("messages")}
                className={`pb-3 px-1 font-medium flex items-center gap-2 ${
                  submissionTab === "messages"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Messages
                {newMessageCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {newMessageCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setSubmissionTab("applications")}
                className={`pb-3 px-1 font-medium ${
                  submissionTab === "applications"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Grant Applications ({applications.length})
              </button>
              <button
                onClick={() => setSubmissionTab("referrals")}
                className={`pb-3 px-1 font-medium ${
                  submissionTab === "referrals"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Patient Referrals ({referrals.length})
              </button>
            </div>

            {/* Messages Tab */}
            {submissionTab === "messages" && (
              <div>
                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b border-gray-100">
                  <div className="flex-1 min-w-[200px]">
                    <input
                      type="text"
                      placeholder="Search messages..."
                      value={messageFilters.search}
                      onChange={(e) => setMessageFilters({ ...messageFilters, search: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <select
                    value={messageFilters.formType}
                    onChange={(e) => setMessageFilters({ ...messageFilters, formType: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="contact">Contact</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="corporate_sponsorship">Corporate Sponsorship</option>
                    <option value="equipment_donation">Equipment Donation</option>
                  </select>
                  <select
                    value={messageFilters.status}
                    onChange={(e) => setMessageFilters({ ...messageFilters, status: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="all">All Statuses</option>
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                    <option value="archived">Archived</option>
                  </select>
                  <button
                    onClick={() => exportToCSV("messages")}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export CSV
                  </button>
                </div>

                {filteredSubmissions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    {formSubmissions.length === 0 ? "No messages yet." : "No messages match your filters."}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {filteredSubmissions.map((submission) => {
                      const data = submission.data as Record<string, string>;
                      const email = data.email || "";
                      const name = data.name || data.contact_name || "Unknown";
                      const subject = data.subject || getFormTypeLabel(submission.form_type);

                      return (
                        <div
                          key={submission.id}
                          className={`border rounded-lg p-4 ${
                            submission.status === "new" ? "border-blue-300 bg-blue-50" : "border-gray-200"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-900">
                                  {getFormTypeLabel(submission.form_type)}
                                </span>
                                <span className="text-gray-400">#{submission.id}</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(submission.status)}`}>
                                  {submission.status}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500">
                                {new Date(submission.created_at).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {email && (
                                <a
                                  href={getReplyMailto(email, name, subject)}
                                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-1"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                  Reply
                                </a>
                              )}
                              <select
                                value={submission.status}
                                onChange={(e) => updateSubmissionStatus(submission.id, e.target.value)}
                                className="text-sm border border-gray-300 rounded px-2 py-1"
                              >
                                <option value="new">New</option>
                                <option value="read">Read</option>
                                <option value="replied">Replied</option>
                                <option value="archived">Archived</option>
                              </select>
                              <button
                                onClick={() => setEditingNotes({ id: submission.id, notes: submission.notes || "", type: "submission" })}
                                className="text-gray-600 hover:text-gray-700 text-sm"
                                title="Add notes"
                              >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => deleteSubmission(submission.id)}
                                className="text-red-600 hover:text-red-700 text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            {Object.entries(data).map(([key, value]) => (
                              <div key={key} className={key === "message" || key === "description" || key === "experience" ? "md:col-span-2" : ""}>
                                <span className="font-medium text-gray-700 capitalize">
                                  {key.replace(/_/g, " ")}:
                                </span>{" "}
                                <span className="text-gray-600 whitespace-pre-wrap">{value}</span>
                              </div>
                            ))}
                          </div>
                          {submission.notes && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Notes:</span> {submission.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Applications Tab */}
            {submissionTab === "applications" && (
              <div>
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => exportToCSV("applications")}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export CSV
                  </button>
                </div>
                {applications.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No grant applications yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div
                        key={app.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900">{app.name}</h3>
                              <span className="text-gray-400">#{app.id}</span>
                            </div>
                            <p className="text-sm text-gray-600">{app.email}</p>
                            {app.phone && <p className="text-sm text-gray-500">{app.phone}</p>}
                          </div>
                          <div className="flex items-center gap-2">
                            <a
                              href={getReplyMailto(app.email, app.name, "Your AdaptToLife Grant Application")}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              Reply
                            </a>
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(app.status)}`}>
                              {app.status}
                            </span>
                            <select
                              value={app.status}
                              onChange={(e) => updateApplicationStatus(app.id, e.target.value)}
                              className="text-sm border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="pending">Pending</option>
                              <option value="in_review">In Review</option>
                              <option value="approved">Approved</option>
                              <option value="denied">Denied</option>
                            </select>
                            <button
                              onClick={() => setEditingNotes({ id: app.id, notes: app.notes || "", type: "application" })}
                              className="text-gray-600 hover:text-gray-700"
                              title="Add notes"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => deleteApplication(app.id)}
                              className="text-red-600 hover:text-red-700 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Sport:</span>{" "}
                            <span className="text-gray-600">{app.sport}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Submitted:</span>{" "}
                            <span className="text-gray-600">{new Date(app.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700">Support Needed:</p>
                          <p className="text-sm text-gray-600 mt-1">{app.need}</p>
                        </div>
                        {app.story && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700">Their Story:</p>
                            <p className="text-sm text-gray-600 mt-1">{app.story}</p>
                          </div>
                        )}
                        {app.notes && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Notes:</span> {app.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Referrals Tab */}
            {submissionTab === "referrals" && (
              <div>
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => exportToCSV("referrals")}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export CSV
                  </button>
                </div>
                {referrals.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No patient referrals yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {referrals.map((ref) => (
                      <div
                        key={ref.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900">Patient: {ref.patient_name}</h3>
                              <span className="text-gray-400">#{ref.id}</span>
                            </div>
                            <p className="text-sm text-gray-600">
                              Referred by: {ref.referrer_name} ({ref.referrer_email})
                            </p>
                            {ref.referrer_organization && (
                              <p className="text-sm text-gray-500">
                                {ref.referrer_organization} {ref.referrer_role && `- ${ref.referrer_role}`}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <a
                              href={getReplyMailto(ref.referrer_email, ref.referrer_name, `Patient Referral: ${ref.patient_name}`)}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              Reply
                            </a>
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(ref.status)}`}>
                              {ref.status}
                            </span>
                            <select
                              value={ref.status}
                              onChange={(e) => updateReferralStatus(ref.id, e.target.value)}
                              className="text-sm border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="pending">Pending</option>
                              <option value="contacted">Contacted</option>
                              <option value="enrolled">Enrolled</option>
                              <option value="closed">Closed</option>
                            </select>
                            <button
                              onClick={() => setEditingNotes({ id: ref.id, notes: ref.notes || "", type: "referral" })}
                              className="text-gray-600 hover:text-gray-700"
                              title="Add notes"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => deleteReferral(ref.id)}
                              className="text-red-600 hover:text-red-700 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {ref.patient_email && (
                            <div>
                              <span className="font-medium text-gray-700">Patient Email:</span>{" "}
                              <span className="text-gray-600">{ref.patient_email}</span>
                            </div>
                          )}
                          {ref.patient_phone && (
                            <div>
                              <span className="font-medium text-gray-700">Patient Phone:</span>{" "}
                              <span className="text-gray-600">{ref.patient_phone}</span>
                            </div>
                          )}
                          <div>
                            <span className="font-medium text-gray-700">Submitted:</span>{" "}
                            <span className="text-gray-600">{new Date(ref.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700">Patient Needs:</p>
                          <p className="text-sm text-gray-600 mt-1">{ref.patient_needs}</p>
                        </div>
                        {ref.additional_info && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700">Additional Info:</p>
                            <p className="text-sm text-gray-600 mt-1">{ref.additional_info}</p>
                          </div>
                        )}
                        {ref.notes && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Notes:</span> {ref.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* Events Tab */}
        {mainTab === "events" && (
          <section className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Events</h2>
              <button
                onClick={() => {
                  setEditingEvent(null);
                  setEventForm(emptyEvent);
                  setShowEventForm(true);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                + Add Event
              </button>
            </div>

            {/* Event Form Modal */}
            {showEventForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">
                      {editingEvent ? "Edit Event" : "Add New Event"}
                    </h3>
                    <form onSubmit={handleEventSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                        <input
                          type="text"
                          required
                          value={eventForm.title}
                          onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                          <input
                            type="date"
                            required
                            value={eventForm.date}
                            onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                          <input
                            type="text"
                            required
                            placeholder="6:00 PM - 8:00 PM"
                            value={eventForm.time}
                            onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                        <input
                          type="text"
                          required
                          value={eventForm.location}
                          onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                        <select
                          required
                          value={eventForm.category}
                          onChange={(e) => setEventForm({ ...eventForm, category: e.target.value as EventFormData["category"] })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="basketball">Basketball</option>
                          <option value="swimming">Swimming</option>
                          <option value="fitness">Fitness</option>
                          <option value="social">Social</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                        <textarea
                          required
                          rows={3}
                          value={eventForm.description}
                          onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Registration Settings */}
                      <div className="border-t pt-4 mt-4">
                        <h4 className="font-medium text-gray-900 mb-3">Registration Settings</h4>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Registration Type</label>
                          <select
                            value={eventForm.registration_type}
                            onChange={(e) => setEventForm({ ...eventForm, registration_type: e.target.value as "none" | "external" | "internal" })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="none">No Registration</option>
                            <option value="external">External Link</option>
                            <option value="internal">Internal Form (Saved to Database)</option>
                          </select>
                        </div>

                        {eventForm.registration_type === "external" && (
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Registration URL</label>
                            <input
                              type="url"
                              value={eventForm.registration_url}
                              onChange={(e) => setEventForm({ ...eventForm, registration_url: e.target.value })}
                              placeholder="https://example.com/register"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        )}

                        {eventForm.registration_type === "internal" && (
                          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Max Registrations (optional)</label>
                              <input
                                type="number"
                                min="0"
                                value={eventForm.max_registrations || ""}
                                onChange={(e) => setEventForm({ ...eventForm, max_registrations: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                                placeholder="Leave empty for unlimited"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Registration Form Fields</label>
                              <p className="text-xs text-gray-500 mb-2">
                                Default fields: Name, Email, Phone. Add custom fields below.
                              </p>

                              {(eventForm.registration_fields || []).map((field, index) => (
                                <div key={index} className="flex gap-2 mb-2 items-center bg-white p-2 rounded border">
                                  <input
                                    type="text"
                                    value={field.label}
                                    onChange={(e) => {
                                      const newFields = [...(eventForm.registration_fields || [])];
                                      newFields[index] = { ...field, label: e.target.value, id: e.target.value.toLowerCase().replace(/\s+/g, "_") };
                                      setEventForm({ ...eventForm, registration_fields: newFields });
                                    }}
                                    placeholder="Field Label"
                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm"
                                  />
                                  <select
                                    value={field.type}
                                    onChange={(e) => {
                                      const newFields = [...(eventForm.registration_fields || [])];
                                      newFields[index] = { ...field, type: e.target.value as FormField["type"] };
                                      setEventForm({ ...eventForm, registration_fields: newFields });
                                    }}
                                    className="px-3 py-1.5 border border-gray-300 rounded text-sm"
                                  >
                                    <option value="text">Text</option>
                                    <option value="textarea">Text Area</option>
                                    <option value="select">Dropdown</option>
                                    <option value="checkbox">Checkbox</option>
                                  </select>
                                  <label className="flex items-center gap-1 text-sm">
                                    <input
                                      type="checkbox"
                                      checked={field.required}
                                      onChange={(e) => {
                                        const newFields = [...(eventForm.registration_fields || [])];
                                        newFields[index] = { ...field, required: e.target.checked };
                                        setEventForm({ ...eventForm, registration_fields: newFields });
                                      }}
                                    />
                                    Required
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newFields = (eventForm.registration_fields || []).filter((_, i) => i !== index);
                                      setEventForm({ ...eventForm, registration_fields: newFields });
                                    }}
                                    className="text-red-600 hover:text-red-700 px-2"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}

                              <button
                                type="button"
                                onClick={() => {
                                  const newField: FormField = { id: "", type: "text", label: "", required: false };
                                  setEventForm({ ...eventForm, registration_fields: [...(eventForm.registration_fields || []), newField] });
                                }}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                              >
                                + Add Custom Field
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button
                          type="button"
                          onClick={() => { setShowEventForm(false); setEditingEvent(null); }}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isSaving ? "Saving..." : editingEvent ? "Update Event" : "Create Event"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Events List */}
            {events.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No events yet. Click &quot;Add Event&quot; to create one.</p>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{event.title}</h3>
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">{event.category}</span>
                        {event.registration_type === "internal" && (
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Internal Registration</span>
                        )}
                        {event.registration_type === "external" && (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">External Link</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{event.date} | {event.time}</p>
                      <p className="text-sm text-gray-500">{event.location}</p>
                      {event.registration_type === "internal" && event.max_registrations && (
                        <p className="text-xs text-gray-500 mt-1">Max capacity: {event.max_registrations}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => editEvent(event)} className="text-blue-600 hover:text-blue-700 font-medium text-sm">Edit</button>
                      <button onClick={() => deleteEvent(event.id)} className="text-red-600 hover:text-red-700 font-medium text-sm">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Settings Tab */}
        {mainTab === "settings" && (
          <div className="space-y-8">
            {/* Database Setup */}
            <section className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Database Setup</h2>
              <p className="text-gray-600 text-sm mb-4">Click this button to initialize the database tables. Safe to run multiple times.</p>
              <button
                onClick={initializeDb}
                disabled={isSaving}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? "Initializing..." : "Initialize Database"}
              </button>
            </section>

            {/* Donation URL */}
            <section className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Donation Settings</h2>
              <div className="flex gap-4">
                <input
                  type="url"
                  value={donationUrl}
                  onChange={(e) => setDonationUrl(e.target.value)}
                  placeholder="https://www.zeffy.com/donation-form/your-form"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={saveDonationUrl}
                  disabled={isSaving}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </section>

            {/* Form Configuration */}
            <section className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Form Configuration</h2>
              <p className="text-gray-600 text-sm mb-6">Customize the forms used for contact, volunteer, sponsorship, and equipment donation inquiries.</p>
              <div className="space-y-4">
                {formConfigs.map((config) => (
                  <div key={config.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{config.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${config.enabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                          {config.enabled ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{config.fields?.length || 0} fields</p>
                    </div>
                    <button
                      onClick={() => { setEditingFormConfig(config); setShowFormEditor(true); }}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Notes Editor Modal */}
        {editingNotes && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Notes</h3>
                <textarea
                  value={editingNotes.notes}
                  onChange={(e) => setEditingNotes({ ...editingNotes, notes: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Add internal notes here..."
                />
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={() => setEditingNotes(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveNotes}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Editor Modal */}
        {showFormEditor && editingFormConfig && (
          <FormEditorModal
            config={editingFormConfig}
            onSave={saveFormConfig}
            onClose={() => { setShowFormEditor(false); setEditingFormConfig(null); }}
            isSaving={isSaving}
          />
        )}
      </main>
    </div>
  );
}

// Form Editor Modal Component
function FormEditorModal({
  config,
  onSave,
  onClose,
  isSaving,
}: {
  config: FormConfig;
  onSave: (config: FormConfig) => void;
  onClose: () => void;
  isSaving: boolean;
}) {
  const [editedConfig, setEditedConfig] = useState<FormConfig>({
    ...config,
    fields: Array.isArray(config.fields) ? config.fields : [],
  });

  const updateField = (index: number, updates: Partial<FormField>) => {
    const newFields = [...editedConfig.fields];
    newFields[index] = { ...newFields[index], ...updates };
    setEditedConfig({ ...editedConfig, fields: newFields });
  };

  const addField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type: "text",
      label: "New Field",
      placeholder: "",
      required: false,
    };
    setEditedConfig({ ...editedConfig, fields: [...editedConfig.fields, newField] });
  };

  const removeField = (index: number) => {
    const newFields = editedConfig.fields.filter((_, i) => i !== index);
    setEditedConfig({ ...editedConfig, fields: newFields });
  };

  const moveField = (index: number, direction: "up" | "down") => {
    const newFields = [...editedConfig.fields];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newFields.length) return;
    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
    setEditedConfig({ ...editedConfig, fields: newFields });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900">Edit Form: {config.title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Form Title</label>
              <input
                type="text"
                value={editedConfig.title}
                onChange={(e) => setEditedConfig({ ...editedConfig, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Submit Button Text</label>
              <input
                type="text"
                value={editedConfig.submit_button_text}
                onChange={(e) => setEditedConfig({ ...editedConfig, submit_button_text: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={editedConfig.description}
              onChange={(e) => setEditedConfig({ ...editedConfig, description: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Success Message</label>
            <textarea
              value={editedConfig.success_message}
              onChange={(e) => setEditedConfig({ ...editedConfig, success_message: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enabled"
              checked={editedConfig.enabled}
              onChange={(e) => setEditedConfig({ ...editedConfig, enabled: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="enabled" className="text-sm font-medium text-gray-700">Form Enabled</label>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium text-gray-900">Form Fields</h4>
              <button onClick={addField} className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">+ Add Field</button>
            </div>

            <div className="space-y-4">
              {editedConfig.fields.map((field, index) => (
                <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => moveField(index, "up")} disabled={index === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-30">↑</button>
                      <button onClick={() => moveField(index, "down")} disabled={index === editedConfig.fields.length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-30">↓</button>
                      <span className="text-sm text-gray-500">Field {index + 1}</span>
                    </div>
                    <button onClick={() => removeField(index)} className="text-red-600 hover:text-red-700 text-sm">Remove</button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Field ID</label>
                      <input type="text" value={field.id} onChange={(e) => updateField(index, { id: e.target.value })} className="w-full px-2 py-1 text-sm border border-gray-300 rounded" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
                      <input type="text" value={field.label} onChange={(e) => updateField(index, { label: e.target.value })} className="w-full px-2 py-1 text-sm border border-gray-300 rounded" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                      <select value={field.type} onChange={(e) => updateField(index, { type: e.target.value as FormField["type"] })} className="w-full px-2 py-1 text-sm border border-gray-300 rounded">
                        <option value="text">Text</option>
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="textarea">Text Area</option>
                        <option value="select">Dropdown</option>
                        <option value="checkbox">Checkbox</option>
                      </select>
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={field.required} onChange={(e) => updateField(index, { required: e.target.checked })} className="w-4 h-4 text-blue-600 border-gray-300 rounded" />
                        <span className="text-sm text-gray-700">Required</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Placeholder</label>
                      <input type="text" value={field.placeholder || ""} onChange={(e) => updateField(index, { placeholder: e.target.value })} className="w-full px-2 py-1 text-sm border border-gray-300 rounded" />
                    </div>
                    {field.type === "select" && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Options (comma-separated)</label>
                        <input type="text" value={field.options?.join(", ") || ""} onChange={(e) => updateField(index, { options: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} className="w-full px-2 py-1 text-sm border border-gray-300 rounded" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50">Cancel</button>
            <button onClick={() => onSave(editedConfig)} disabled={isSaving} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
