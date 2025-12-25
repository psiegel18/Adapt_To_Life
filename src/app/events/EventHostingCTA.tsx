"use client";

import { useState } from "react";
import DynamicFormModal from "@/components/DynamicFormModal";

export default function EventHostingCTA() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Want to Host an Event?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            We&apos;re always looking for partners and venues to expand our
            programs. If you&apos;re interested in hosting an adaptive sports
            event, we&apos;d love to hear from you.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-block bg-[#FF6B35] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#e55a2a] transition-colors"
          >
            Contact Us
          </button>
        </div>
      </section>

      <DynamicFormModal
        formType="event_hosting"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
