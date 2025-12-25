"use client";

import { useState } from "react";
import DynamicFormModal from "@/components/DynamicFormModal";

export default function OtherWaysToSupport() {
  const [activeForm, setActiveForm] = useState<string | null>(null);

  return (
    <>
      <section className="py-16 md:py-24 bg-white border-t border-[#E5E5E5]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-12">
            Other Ways to Support
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-black mb-2">Volunteer</h3>
              <p className="text-black text-sm mb-4">
                Help at events, contribute expertise, or assist with outreach.
              </p>
              <button
                onClick={() => setActiveForm("volunteer")}
                className="text-black font-medium hover:text-[#FF6B35] underline underline-offset-4 transition-colors"
              >
                Get Involved →
              </button>
            </div>
            <div>
              <h3 className="font-bold text-black mb-2">
                Corporate Sponsorship
              </h3>
              <p className="text-black text-sm mb-4">
                Partner with us to make a bigger impact in the community.
              </p>
              <button
                onClick={() => setActiveForm("corporate_sponsorship")}
                className="text-black font-medium hover:text-[#FF6B35] underline underline-offset-4 transition-colors"
              >
                Partner With Us →
              </button>
            </div>
            <div>
              <h3 className="font-bold text-black mb-2">
                Equipment Donation
              </h3>
              <p className="text-black text-sm mb-4">
                Donate sport wheelchairs or other adaptive equipment.
              </p>
              <button
                onClick={() => setActiveForm("equipment_donation")}
                className="text-black font-medium hover:text-[#FF6B35] underline underline-offset-4 transition-colors"
              >
                Learn More →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Form Modals */}
      <DynamicFormModal
        formType="volunteer"
        isOpen={activeForm === "volunteer"}
        onClose={() => setActiveForm(null)}
      />
      <DynamicFormModal
        formType="corporate_sponsorship"
        isOpen={activeForm === "corporate_sponsorship"}
        onClose={() => setActiveForm(null)}
      />
      <DynamicFormModal
        formType="equipment_donation"
        isOpen={activeForm === "equipment_donation"}
        onClose={() => setActiveForm(null)}
      />
    </>
  );
}
