"use client";

import { useState, useEffect } from "react";
import { FormField } from "@/lib/db";

interface EventData {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  registration_fields?: FormField[];
  max_registrations?: number;
}

interface EventRegistrationModalProps {
  event: EventData;
  isOpen: boolean;
  onClose: () => void;
  currentRegistrations?: number;
}

// Validation helpers
const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePhone = (phone: string): boolean => {
  return /^[\d\s\-\+\(\)\.]{7,20}$/.test(phone.replace(/\s/g, ""));
};

const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
};

// Default registration fields
const defaultFields: FormField[] = [
  { id: "name", type: "text", label: "Full Name", placeholder: "Your name", required: true },
  { id: "email", type: "email", label: "Email Address", placeholder: "your@email.com", required: true },
  { id: "phone", type: "phone", label: "Phone Number", placeholder: "(555) 123-4567", required: false },
];

export default function EventRegistrationModal({
  event,
  isOpen,
  onClose,
  currentRegistrations = 0,
}: EventRegistrationModalProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [honeypot, setHoneypot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error";
    message: string;
    registrationId?: number;
  } | null>(null);

  const fields = event.registration_fields?.length ? event.registration_fields : defaultFields;
  const spotsRemaining = event.max_registrations ? event.max_registrations - currentRegistrations : null;

  useEffect(() => {
    if (isOpen) {
      setSubmitStatus(null);
      setFieldErrors({});
      // Initialize form data with empty values
      const initialData: Record<string, string> = {};
      fields.forEach((field) => {
        initialData[field.id] = "";
      });
      setFormData(initialData);
    }
  }, [isOpen, fields]);

  const handleInputChange = (fieldId: string, value: string, fieldType?: string) => {
    if (fieldType === "phone") {
      value = formatPhone(value);
    }
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    if (fieldErrors[fieldId]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const validateField = (field: FormField, value: string): string | null => {
    if (field.required && !value.trim()) {
      return `${field.label} is required`;
    }
    if (value && field.type === "email" && !validateEmail(value)) {
      return "Please enter a valid email address";
    }
    if (value && field.type === "phone" && !validatePhone(value)) {
      return "Please enter a valid phone number";
    }
    return null;
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    fields.forEach((field) => {
      const error = validateField(field, formData[field.id] || "");
      if (error) {
        errors[field.id] = error;
      }
    });
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const res = await fetch("/api/event-registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: event.id,
          data: formData,
          _honeypot: honeypot,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        setSubmitStatus({
          type: "success",
          message: result.message,
          registrationId: result.registration?.id,
        });
      } else {
        setSubmitStatus({ type: "error", message: result.error });
      }
    } catch {
      setSubmitStatus({ type: "error", message: "Failed to register" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setFormData({});
      setFieldErrors({});
      setSubmitStatus(null);
      setHoneypot("");
    }, 300);
  };

  const renderField = (field: FormField) => {
    const hasError = !!fieldErrors[field.id];
    const baseInputClasses = `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] transition-colors ${
      hasError ? "border-red-500 bg-red-50" : "border-gray-300"
    }`;

    switch (field.type) {
      case "textarea":
        return (
          <textarea
            id={field.id}
            value={formData[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className={baseInputClasses}
          />
        );

      case "select":
        return (
          <select
            id={field.id}
            value={formData[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={baseInputClasses}
          >
            <option value="">Select an option...</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case "multiselect":
        const selectedValues = formData[field.id] ? formData[field.id].split(",").filter(Boolean) : [];
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...selectedValues, option]
                      : selectedValues.filter((v) => v !== option);
                    handleInputChange(field.id, newValues.join(","));
                  }}
                  className="w-5 h-5 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case "checkbox":
        // If options are provided, render as multiple checkboxes
        if (field.options && field.options.length > 0) {
          const checkedOptions = formData[field.id] ? formData[field.id].split(",").filter(Boolean) : [];
          return (
            <div className="space-y-2">
              {field.options.map((option) => (
                <label key={option} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedOptions.includes(option)}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...checkedOptions, option]
                        : checkedOptions.filter((v) => v !== option);
                      handleInputChange(field.id, newValues.join(","));
                    }}
                    className="w-5 h-5 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          );
        }
        // Single checkbox (no options)
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              id={field.id}
              checked={formData[field.id] === "true"}
              onChange={(e) =>
                handleInputChange(field.id, e.target.checked.toString())
              }
              className="w-5 h-5 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]"
            />
            <span className="text-gray-700">{field.label}</span>
          </label>
        );

      case "number":
        return (
          <input
            type="number"
            id={field.id}
            value={formData[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={baseInputClasses}
          />
        );

      case "date":
        return (
          <input
            type="date"
            id={field.id}
            value={formData[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={baseInputClasses}
          />
        );

      default:
        return (
          <input
            type={field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text"}
            id={field.id}
            value={formData[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value, field.type)}
            placeholder={field.placeholder}
            className={baseInputClasses}
          />
        );
    }
  };

  if (!isOpen) return null;

  const eventDate = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900">Register for Event</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitStatus?.type === "success" ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">You&apos;re Registered!</h3>
              <p className="text-gray-600 mb-4">{submitStatus.message}</p>
              {submitStatus.registrationId && submitStatus.registrationId > 0 && (
                <p className="text-sm text-gray-500 bg-gray-100 inline-block px-4 py-2 rounded-full">
                  Confirmation #: <span className="font-mono font-semibold">{submitStatus.registrationId}</span>
                </p>
              )}
              <button
                onClick={handleClose}
                className="mt-6 text-[#FF6B35] font-medium hover:text-[#e55a2a] transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {/* Event Info */}
              <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#FF6B35]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {eventDate} at {event.time}
                  </p>
                  <p className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#FF6B35]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {event.location}
                  </p>
                  {spotsRemaining !== null && (
                    <p className="flex items-center gap-2 font-medium text-[#FF6B35]">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {spotsRemaining} {spotsRemaining === 1 ? "spot" : "spots"} remaining
                    </p>
                  )}
                </div>
              </div>

              {submitStatus?.type === "error" && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{submitStatus.message}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Honeypot field */}
                <div className="absolute -left-[9999px]" aria-hidden="true">
                  <label htmlFor="_website">Website</label>
                  <input
                    type="text"
                    id="_website"
                    name="_website"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                {fields.map((field) => (
                  <div key={field.id}>
                    {field.type !== "checkbox" && (
                      <label
                        htmlFor={field.id}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                    )}
                    {renderField(field)}
                    {fieldErrors[field.id] && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {fieldErrors[field.id]}
                      </p>
                    )}
                    {field.helpText && !fieldErrors[field.id] && (
                      <p className="mt-1 text-sm text-gray-500">{field.helpText}</p>
                    )}
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={isSubmitting || (spotsRemaining !== null && spotsRemaining <= 0)}
                  className="w-full bg-[#FF6B35] text-white px-6 py-3 rounded-full font-semibold text-lg hover:bg-[#e55a2a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-6"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Registering...
                    </span>
                  ) : spotsRemaining !== null && spotsRemaining <= 0 ? (
                    "Event Full"
                  ) : (
                    "Register Now"
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
