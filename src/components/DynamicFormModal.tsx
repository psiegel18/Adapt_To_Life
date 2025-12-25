"use client";

import { useState, useEffect } from "react";
import { FormConfig, FormField } from "@/lib/db";

interface DynamicFormModalProps {
  formType: string;
  isOpen: boolean;
  onClose: () => void;
  triggerButtonText?: string;
}

export default function DynamicFormModal({
  formType,
  isOpen,
  onClose,
}: DynamicFormModalProps) {
  const [config, setConfig] = useState<FormConfig | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && formType) {
      setIsLoading(true);
      fetch(`/api/form-configs?form_type=${formType}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setSubmitStatus({ type: "error", message: data.error });
          } else {
            setConfig(data);
            // Initialize form data with empty values
            const initialData: Record<string, string> = {};
            data.fields?.forEach((field: FormField) => {
              initialData[field.id] = "";
            });
            setFormData(initialData);
          }
        })
        .catch(() => {
          setSubmitStatus({ type: "error", message: "Failed to load form" });
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, formType]);

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const res = await fetch("/api/form-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form_type: formType,
          data: formData,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        setSubmitStatus({ type: "success", message: result.message });
        // Reset form after success
        setTimeout(() => {
          onClose();
          setFormData({});
          setSubmitStatus(null);
        }, 3000);
      } else {
        setSubmitStatus({ type: "error", message: result.error });
      }
    } catch {
      setSubmitStatus({ type: "error", message: "Failed to submit form" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const baseInputClasses =
      "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] transition-colors";

    switch (field.type) {
      case "textarea":
        return (
          <textarea
            id={field.id}
            value={formData[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
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
            required={field.required}
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

      case "checkbox":
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              id={field.id}
              checked={formData[field.id] === "true"}
              onChange={(e) =>
                handleInputChange(field.id, e.target.checked.toString())
              }
              required={field.required}
              className="w-5 h-5 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]"
            />
            <span className="text-gray-700">{field.label}</span>
          </label>
        );

      default:
        return (
          <input
            type={field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text"}
            id={field.id}
            value={formData[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className={baseInputClasses}
          />
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900">
            {config?.title || "Loading..."}
          </h2>
          <button
            onClick={onClose}
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
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-[#FF6B35] border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Loading form...</p>
            </div>
          ) : submitStatus?.type === "success" ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-700 text-lg">{submitStatus.message}</p>
            </div>
          ) : (
            <>
              {config?.description && (
                <p className="text-gray-600 mb-6">{config.description}</p>
              )}

              {submitStatus?.type === "error" && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {submitStatus.message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {config?.fields?.map((field) => (
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
                    {field.helpText && (
                      <p className="mt-1 text-sm text-gray-500">{field.helpText}</p>
                    )}
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#FF6B35] text-white px-6 py-3 rounded-full font-semibold text-lg hover:bg-[#e55a2a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-6"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    config?.submit_button_text || "Submit"
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
