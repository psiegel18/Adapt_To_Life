"use client";

import { useState } from "react";
import DynamicFormModal from "@/components/DynamicFormModal";

export default function StoryContactCTA() {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <>
      <section className="py-16 md:py-24 bg-black">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Join Our Mission
          </h2>
          <p className="text-lg text-white mb-8">
            Whether you&apos;re an athlete, a healthcare professional, or someone who believes in the power of sport—there&apos;s a place for you here.
          </p>
          <button
            onClick={() => setIsContactOpen(true)}
            className="inline-block bg-[#FF6B35] text-white px-10 py-4 rounded-full font-semibold text-lg hover:bg-[#e55a2a] transition-colors"
          >
            Get in Touch
          </button>
        </div>
      </section>

      <DynamicFormModal
        formType="contact"
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </>
  );
}
