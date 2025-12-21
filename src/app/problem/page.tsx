import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Problem | AdaptToLife",
  description: "Understanding the systemic barriers that keep millions of Americans with disabilities from accessing adaptive sports.",
};

export default function ProblemPage() {
  return (
    <div>
      {/* Hero */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-black">
            A System Designed to Fail.
          </h1>
        </div>
      </section>

      {/* Section 2.1: The Full Story */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg md:text-xl text-black leading-relaxed mb-6">
              It is 11 PM on a Tuesday. Maria sits alone at her kitchen table, the glow of her laptop illuminating the dark room. Her 14-year-old son Leo was injured in a car accident three months ago. The doctors say he&apos;ll never walk again.
            </p>
            <p className="text-lg md:text-xl text-black leading-relaxed mb-6">
              Leo used to live for basketball. It was his identity, his community, his escape. Since the accident, he hasn&apos;t left his room except for physical therapy. The spark in his eyes is gone.
            </p>
            <p className="text-lg md:text-xl text-black leading-relaxed mb-6">
              Maria heard somewhere that wheelchair basketball exists. Tonight, she&apos;s determined to find it for her son. She searches. And searches. She clicks through broken links, outdated websites, and dead email addresses. Phone numbers lead to voicemails that are never returned.
            </p>
            <p className="text-lg md:text-xl text-black leading-relaxed mb-6">
              She finds a program 200 miles away. The registration form asks questions she doesn&apos;t understand—classification levels, equipment requirements, insurance waivers she&apos;s never seen before. She has no idea how to get a sports wheelchair or what one even costs.
            </p>
            <p className="text-lg md:text-xl text-black leading-relaxed">
              At 1 AM, Maria closes her laptop. Leo stays on the sidelines. Another kid who could have been saved by sport slips through the cracks of a broken system.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2.2: The Three Failures */}
      <section className="py-16 md:py-24 bg-white border-t border-[#E5E5E5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            {/* Column 1 */}
            <div>
              <h3 className="text-2xl font-bold text-black mb-4">
                The Discovery Failure
              </h3>
              <p className="text-lg text-black">
                The front door is hidden. Critical information is scattered across outdated, non-mobile-friendly websites, making it impossible for a worried parent to find answers.
              </p>
            </div>

            {/* Column 2 */}
            <div>
              <h3 className="text-2xl font-bold text-black mb-4">
                The Education Failure
              </h3>
              <p className="text-lg text-black">
                The rulebook is written for experts. Beginners are left with fundamental questions about rules, equipment, and classification, creating a massive barrier to entry.
              </p>
            </div>

            {/* Column 3 */}
            <div>
              <h3 className="text-2xl font-bold text-black mb-4">
                The Economic Failure
              </h3>
              <p className="text-lg text-black">
                The price of admission is a five-figure wall. A single piece of equipment can cost more than a car, stopping countless families before they even start.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2.3: The Result */}
      <section className="py-16 md:py-24 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-7xl md:text-9xl font-bold text-white mb-4">
            1.5 Million
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">
            Kids Left on the Sidelines.
          </h2>
          <p className="text-lg md:text-xl text-white">
            This is a solvable crisis of access. We were built to solve it.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            See How We&apos;re Fixing It
          </h2>
          <Link
            href="/solution"
            className="inline-block bg-[#FF6B35] text-white px-10 py-4 rounded-full font-semibold text-lg hover:bg-[#e55a2a] transition-colors"
          >
            Our Solution
          </Link>
        </div>
      </section>
    </div>
  );
}
