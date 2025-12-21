import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Solution | AdaptToLife",
  description: "A pathway, not a patchwork. Learn how we serve the absolute beginner and create the essential on-ramp to adaptive sports.",
};

export default function SolutionPage() {
  return (
    <div>
      {/* Hero */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-black">
            A Pathway, Not a Patchwork.
          </h1>
        </div>
      </section>

      {/* Section 3.1: Our Strategic Position */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-8">
            We Serve the Absolute Beginner.
          </h2>
          <p className="text-lg md:text-xl text-black leading-relaxed">
            Where other great organizations serve athletes already in the system, we serve the parent searching late at night for answers. We are the essential on-ramp for the newcomer, ensuring a steady stream of new, educated, and funded participants enters the adaptive sports ecosystem.
          </p>
        </div>
      </section>

      {/* Section 3.2: The Three Pillars */}
      <section className="py-16 md:py-24 bg-white border-t border-[#E5E5E5]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-24">
            {/* Pillar 1 */}
            <div>
              <p className="text-[#FF6B35] font-semibold text-lg mb-2">Part 1</p>
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
                Education & Empowerment
              </h2>
              <p className="text-lg md:text-xl text-black leading-relaxed">
                We are the &quot;Khan Academy for Adaptive Sports.&quot; Our core mission is to empower beginners with free, world-class educational resources. Co-designed by athletes and Certified Therapeutic Recreation Specialists (CTRS), our guides, videos, and interactive tools demystify the complex world of adaptive sports.
              </p>
            </div>

            {/* Pillar 2 */}
            <div>
              <p className="text-[#FF6B35] font-semibold text-lg mb-2">Part 2</p>
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
                Discovery & Access
              </h2>
              <p className="text-lg md:text-xl text-black leading-relaxed">
                Our platform, AdaptiveSportsNearMe.com, is the most comprehensive and accessible directory of adaptive sports programs in the nation. It&apos;s a free, mobile-first tool that provides instant answers.
              </p>
            </div>

            {/* Pillar 3 */}
            <div>
              <p className="text-[#FF6B35] font-semibold text-lg mb-2">Part 3</p>
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
                Direct Funding
              </h2>
              <p className="text-lg md:text-xl text-black leading-relaxed">
                The Athlete Deployment Fund provides direct-to-athlete grants for equipment, fees, and travel. It is the final bridge from the sidelines to the game.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3.3: The 100% Promise */}
      <section className="py-16 md:py-24 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">
            Our 100% to Athletes Promise
          </h2>
          <p className="text-lg md:text-xl text-white leading-relaxed">
            One hundred percent of all public donations designated for our Athlete Deployment Fund go directly to athlete support. No overhead. No exceptions. When you give to get an athlete in the game, you get an athlete in the game.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            Support the Pathway
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/donate"
              className="inline-block bg-[#FF6B35] text-white px-10 py-4 rounded-full font-semibold text-lg hover:bg-[#e55a2a] transition-colors"
            >
              Donate Today
            </Link>
            <Link
              href="/get-help"
              className="inline-block bg-black text-white px-10 py-4 rounded-full font-semibold text-lg hover:bg-gray-800 transition-colors"
            >
              Apply for a Grant
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
