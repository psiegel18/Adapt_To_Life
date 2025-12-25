"use client";

import { useState, useEffect } from "react";
import EventRegistrationModal from "@/components/EventRegistrationModal";
import { formatDate, getCategoryColor, getCategoryLabel } from "@/data/events";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    description: string;
    category: "basketball" | "swimming" | "fitness" | "social" | "other";
    imageUrl?: string;
    registrationUrl?: string;
    registrationType?: "none" | "external" | "internal";
    registrationFields?: Array<{
      id: string;
      type: "text" | "email" | "phone" | "textarea" | "select" | "checkbox";
      label: string;
      placeholder?: string;
      required: boolean;
      options?: string[];
      helpText?: string;
    }>;
    maxRegistrations?: number;
  };
}

export default function EventCard({ event }: EventCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [registrationCount, setRegistrationCount] = useState(0);

  useEffect(() => {
    // Fetch registration count for internal registration events
    if (event.registrationType === "internal") {
      fetch(`/api/event-registrations?event_id=${event.id}&count_only=true`)
        .then((res) => res.json())
        .then((data) => setRegistrationCount(data.count || 0))
        .catch(() => setRegistrationCount(0));
    }
  }, [event.id, event.registrationType]);

  const handleRegisterClick = () => {
    if (event.registrationType === "internal") {
      setIsModalOpen(true);
    }
  };

  const renderRegistrationButton = () => {
    const registrationType = event.registrationType || "none";

    if (registrationType === "external" && event.registrationUrl) {
      return (
        <a
          href={event.registrationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 w-full block text-center bg-[#FF6B35] text-white py-3 rounded-lg font-semibold hover:bg-[#e55a2a] transition-colors"
        >
          Register
        </a>
      );
    }

    if (registrationType === "internal") {
      const isFull = event.maxRegistrations ? registrationCount >= event.maxRegistrations : false;
      return (
        <button
          onClick={handleRegisterClick}
          disabled={isFull}
          className="mt-6 w-full bg-[#FF6B35] text-white py-3 rounded-lg font-semibold hover:bg-[#e55a2a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isFull ? "Event Full" : "Register"}
        </button>
      );
    }

    // No registration or just info
    return (
      <button className="mt-6 w-full bg-[#FF6B35] text-white py-3 rounded-lg font-semibold hover:bg-[#e55a2a] transition-colors">
        Learn More
      </button>
    );
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="p-6">
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${getCategoryColor(event.category)}`}
          >
            {getCategoryLabel(event.category)}
          </span>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            {event.title}
          </h2>
          <p className="text-gray-600 mb-4">{event.description}</p>

          <div className="space-y-3 text-sm text-gray-500 border-t pt-4">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-[#FF6B35] flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <div>
                <p className="font-medium text-gray-900">{formatDate(event.date)}</p>
                <p>{event.time}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-[#FF6B35] flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p>{event.location}</p>
            </div>
            {event.registrationType === "internal" && event.maxRegistrations && (
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-[#FF6B35] flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <p>
                  {registrationCount} / {event.maxRegistrations} registered
                </p>
              </div>
            )}
          </div>

          {renderRegistrationButton()}
        </div>
      </div>

      {event.registrationType === "internal" && (
        <EventRegistrationModal
          event={{
            id: parseInt(event.id, 10),
            title: event.title,
            date: event.date,
            time: event.time,
            location: event.location,
            registration_fields: event.registrationFields,
            max_registrations: event.maxRegistrations,
          }}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          currentRegistrations={registrationCount}
        />
      )}
    </>
  );
}
