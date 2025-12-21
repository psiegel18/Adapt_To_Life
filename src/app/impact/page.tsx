import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impact | AdaptToLife",
  description: "Proof, not promises. See the measurable impact of our work and our commitment to radical transparency.",
};

export default function ImpactPage() {
  return (
    <div>
      {/* Hero */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-black">
            Proof, Not Promises.
          </h1>
        </div>
      </section>

      {/* Section 5.1: Impact Dashboard */}
      <section className="py-16 md:py-24 bg-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 text-center">
            <div>
              <div className="text-7xl md:text-8xl font-bold text-[#FF6B35] mb-4">
                50+
              </div>
              <p className="text-2xl text-white font-medium">
                Athletes Funded
              </p>
            </div>
            <div>
              <div className="text-7xl md:text-8xl font-bold text-[#FF6B35] mb-4">
                $50K+
              </div>
              <p className="text-2xl text-white font-medium">
                Deployed to Athletes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5.2: Stories from the Field */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-16 text-center">
            Stories from the Field
          </h2>
          <div className="space-y-12">
            {/* Testimonial 1 */}
            <div className="border-l-4 border-[#FF6B35] pl-8">
              <p className="text-lg md:text-xl text-black leading-relaxed mb-4">
                &quot;Before AdaptToLife, I didn&apos;t know where to start. Now I&apos;m playing wheelchair basketball twice a week. The grant covered my first sports chair—something I never could have afforded on my own.&quot;
              </p>
              <p className="text-black font-medium">
                — Marcus T., Grant Recipient
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="border-l-4 border-[#FF6B35] pl-8">
              <p className="text-lg md:text-xl text-black leading-relaxed mb-4">
                &quot;As a CTRS, I&apos;ve struggled to find resources for my patients. AdaptToLife&apos;s guides and program directory have become essential tools in my practice.&quot;
              </p>
              <p className="text-black font-medium">
                — Dr. Sarah L., Certified Therapeutic Recreation Specialist
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="border-l-4 border-[#FF6B35] pl-8">
              <p className="text-lg md:text-xl text-black leading-relaxed mb-4">
                &quot;My daughter was injured last year. I spent months trying to find programs for her. With AdaptToLife, we found three programs within 30 miles of our home in a single search.&quot;
              </p>
              <p className="text-black font-medium">
                — Jennifer M., Parent
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5.3: Our Financials */}
      <section className="py-16 md:py-24 bg-white border-t border-[#E5E5E5]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            Radical Transparency
          </h2>
          <p className="text-lg md:text-xl text-black mb-10">
            Trust is earned. We are an open book. We invite you to review our financial documents and see exactly how we put our mission into action.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#"
              className="inline-block border-2 border-black text-black px-8 py-3 rounded-full font-semibold hover:bg-black hover:text-white transition-colors"
            >
              View Form 990
            </a>
            <a
              href="#"
              className="inline-block border-2 border-black text-black px-8 py-3 rounded-full font-semibold hover:bg-black hover:text-white transition-colors"
            >
              Annual Report
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-black">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Help Us Grow Our Impact
          </h2>
          <p className="text-lg text-white mb-8">
            Every dollar goes further here. Join us in building the pathway.
          </p>
          <Link
            href="/donate"
            className="inline-block bg-[#FF6B35] text-white px-10 py-4 rounded-full font-semibold text-lg hover:bg-[#e55a2a] transition-colors"
          >
            Donate Today
          </Link>
        </div>
      </section>
    </div>
  );
}
