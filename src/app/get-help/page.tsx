"use client";

import { useState } from "react";

export default function GetHelpPage() {
  const [activeTab, setActiveTab] = useState<"application" | "referral">("application");
  const [applicationSubmitting, setApplicationSubmitting] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [applicationError, setApplicationError] = useState("");
  const [referralSubmitting, setReferralSubmitting] = useState(false);
  const [referralSuccess, setReferralSuccess] = useState(false);
  const [referralError, setReferralError] = useState("");

  async function handleApplicationSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setApplicationSubmitting(true);
    setApplicationError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      sport: formData.get("sport"),
      need: formData.get("need"),
      story: formData.get("story"),
    };

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to submit application");
      }

      setApplicationSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch {
      setApplicationError("There was an error submitting your application. Please try again.");
    } finally {
      setApplicationSubmitting(false);
    }
  }

  async function handleReferralSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setReferralSubmitting(true);
    setReferralError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      referrer_name: formData.get("referrer_name"),
      referrer_email: formData.get("referrer_email"),
      referrer_organization: formData.get("referrer_organization"),
      referrer_role: formData.get("referrer_role"),
      patient_name: formData.get("patient_name"),
      patient_email: formData.get("patient_email"),
      patient_phone: formData.get("patient_phone"),
      patient_needs: formData.get("patient_needs"),
      additional_info: formData.get("additional_info"),
    };

    try {
      const response = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to submit referral");
      }

      setReferralSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch {
      setReferralError("There was an error submitting your referral. Please try again.");
    } finally {
      setReferralSubmitting(false);
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-black">
            Let Us Help.
          </h1>
        </div>
      </section>

      {/* Tab Selection */}
      <section className="bg-white border-b border-[#E5E5E5]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("application")}
              className={`py-4 text-lg font-medium border-b-2 transition-colors ${
                activeTab === "application"
                  ? "border-[#FF6B35] text-[#FF6B35]"
                  : "border-transparent text-gray-500 hover:text-black"
              }`}
            >
              Apply for a Grant
            </button>
            <button
              onClick={() => setActiveTab("referral")}
              className={`py-4 text-lg font-medium border-b-2 transition-colors ${
                activeTab === "referral"
                  ? "border-[#FF6B35] text-[#FF6B35]"
                  : "border-transparent text-gray-500 hover:text-black"
              }`}
            >
              Refer a Patient
            </button>
          </div>
        </div>
      </section>

      {/* Application Form */}
      {activeTab === "application" && (
        <section className="py-16 md:py-24 bg-black">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Grant Application
              </h2>
              <p className="text-gray-400">
                Our Athlete Deployment Fund provides direct grants for equipment, fees, and travel.
                If you are an athlete or family in need of support, we encourage you to apply.
              </p>
            </div>

            {applicationSuccess ? (
              <div className="bg-green-900/50 border border-green-500 rounded-lg p-6 text-center">
                <h3 className="text-xl font-bold text-green-400 mb-2">Application Submitted!</h3>
                <p className="text-gray-300">
                  Thank you for your application. We will review it and get back to you within 2 weeks.
                </p>
                <button
                  onClick={() => setApplicationSuccess(false)}
                  className="mt-4 text-[#FF6B35] hover:underline"
                >
                  Submit another application
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplicationSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-white font-medium mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-white font-medium mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-white font-medium mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="w-full px-4 py-3 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                  />
                </div>
                <div>
                  <label htmlFor="sport" className="block text-white font-medium mb-2">
                    Sport of Interest *
                  </label>
                  <select
                    id="sport"
                    name="sport"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                  >
                    <option value="">Select a sport</option>
                    <option value="wheelchair-basketball">Wheelchair Basketball</option>
                    <option value="wheelchair-tennis">Wheelchair Tennis</option>
                    <option value="adaptive-swimming">Adaptive Swimming</option>
                    <option value="sled-hockey">Sled Hockey</option>
                    <option value="handcycling">Handcycling</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="need" className="block text-white font-medium mb-2">
                    What do you need support with? *
                  </label>
                  <textarea
                    id="need"
                    name="need"
                    rows={4}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                    placeholder="Tell us about your needs—equipment, program fees, travel expenses, etc."
                  ></textarea>
                </div>
                <div>
                  <label htmlFor="story" className="block text-white font-medium mb-2">
                    Your Story (Optional)
                  </label>
                  <textarea
                    id="story"
                    name="story"
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                    placeholder="Share your journey—we'd love to hear about your goals and what adaptive sports mean to you."
                  ></textarea>
                </div>

                {applicationError && (
                  <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 text-red-300">
                    {applicationError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={applicationSubmitting}
                  className="w-full bg-[#FF6B35] text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#e55a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {applicationSubmitting ? "Submitting..." : "Submit Application"}
                </button>
                <p className="text-sm text-gray-400 text-center">
                  All applications are reviewed within 2 weeks. Your information is kept confidential.
                </p>
              </form>
            )}
          </div>
        </section>
      )}

      {/* Referral Form */}
      {activeTab === "referral" && (
        <section className="py-16 md:py-24 bg-black">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Patient Referral
              </h2>
              <p className="text-gray-400">
                As a CTRS or other healthcare professional, you are on the front lines.
                If you have a patient who could benefit from our resources or funding,
                you can refer them to us directly.
              </p>
            </div>

            {referralSuccess ? (
              <div className="bg-green-900/50 border border-green-500 rounded-lg p-6 text-center">
                <h3 className="text-xl font-bold text-green-400 mb-2">Referral Submitted!</h3>
                <p className="text-gray-300">
                  Thank you for your referral. We will review it and reach out to coordinate next steps.
                </p>
                <button
                  onClick={() => setReferralSuccess(false)}
                  className="mt-4 text-[#FF6B35] hover:underline"
                >
                  Submit another referral
                </button>
              </div>
            ) : (
              <form onSubmit={handleReferralSubmit} className="space-y-8">
                {/* Referrer Information */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2">
                    Your Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="referrer_name" className="block text-white font-medium mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        id="referrer_name"
                        name="referrer_name"
                        required
                        className="w-full px-4 py-3 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                      />
                    </div>
                    <div>
                      <label htmlFor="referrer_email" className="block text-white font-medium mb-2">
                        Your Email *
                      </label>
                      <input
                        type="email"
                        id="referrer_email"
                        name="referrer_email"
                        required
                        className="w-full px-4 py-3 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="referrer_organization" className="block text-white font-medium mb-2">
                          Organization
                        </label>
                        <input
                          type="text"
                          id="referrer_organization"
                          name="referrer_organization"
                          className="w-full px-4 py-3 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                        />
                      </div>
                      <div>
                        <label htmlFor="referrer_role" className="block text-white font-medium mb-2">
                          Your Role
                        </label>
                        <input
                          type="text"
                          id="referrer_role"
                          name="referrer_role"
                          placeholder="e.g., CTRS, PT, OT"
                          className="w-full px-4 py-3 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Patient Information */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2">
                    Patient Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="patient_name" className="block text-white font-medium mb-2">
                        Patient Name *
                      </label>
                      <input
                        type="text"
                        id="patient_name"
                        name="patient_name"
                        required
                        className="w-full px-4 py-3 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="patient_email" className="block text-white font-medium mb-2">
                          Patient Email
                        </label>
                        <input
                          type="email"
                          id="patient_email"
                          name="patient_email"
                          className="w-full px-4 py-3 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                        />
                      </div>
                      <div>
                        <label htmlFor="patient_phone" className="block text-white font-medium mb-2">
                          Patient Phone
                        </label>
                        <input
                          type="tel"
                          id="patient_phone"
                          name="patient_phone"
                          className="w-full px-4 py-3 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="patient_needs" className="block text-white font-medium mb-2">
                        Patient Needs & Goals *
                      </label>
                      <textarea
                        id="patient_needs"
                        name="patient_needs"
                        rows={4}
                        required
                        className="w-full px-4 py-3 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                        placeholder="Describe the patient's condition, interests, and what type of support would be beneficial."
                      ></textarea>
                    </div>
                    <div>
                      <label htmlFor="additional_info" className="block text-white font-medium mb-2">
                        Additional Information
                      </label>
                      <textarea
                        id="additional_info"
                        name="additional_info"
                        rows={3}
                        className="w-full px-4 py-3 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                        placeholder="Any other relevant details that would help us support this patient."
                      ></textarea>
                    </div>
                  </div>
                </div>

                {referralError && (
                  <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 text-red-300">
                    {referralError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={referralSubmitting}
                  className="w-full bg-[#FF6B35] text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#e55a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {referralSubmitting ? "Submitting..." : "Submit Referral"}
                </button>
                <p className="text-sm text-gray-400 text-center">
                  We will coordinate with you to ensure the patient has a clear pathway to participation.
                </p>
              </form>
            )}
          </div>
        </section>
      )}

      {/* Resources Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            Find Programs Near You
          </h2>
          <p className="text-lg md:text-xl text-black mb-10">
            Use our free directory to discover adaptive sports programs in your area.
          </p>
          <a
            href="https://www.adaptivesportsnearme.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border-2 border-black text-black px-10 py-4 rounded-full font-semibold text-lg hover:bg-black hover:text-white transition-colors"
          >
            Visit AdaptiveSportsNearMe.com
          </a>
        </div>
      </section>
    </div>
  );
}
