import { Metadata } from "next";
import StoryContactCTA from "./StoryContactCTA";

export const metadata: Metadata = {
  title: "Our Story | AdaptToLife",
  description: "We've lived this. Learn about the founder's journey and the team behind AdaptToLife.",
};

export default function StoryPage() {
  return (
    <div>
      {/* Hero */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-black">
            We&apos;ve Lived This.
          </h1>
        </div>
      </section>

      {/* Section 4.1: The Founder's Story */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-l-4 border-[#FF6B35] pl-8">
            <p className="text-lg md:text-xl text-black leading-relaxed mb-8">
              Seventeen years of my life were defined by one word: athlete. Then, a single moment on a wrestling mat changed my reality. After my spinal cord injury, I wasn&apos;t just learning to live again; I was trying to find the person I was.
            </p>
            <p className="text-lg md:text-xl text-black leading-relaxed mb-8">
              I eventually found my way back to sport, but the journey was a brutal maze of dead ends and frustration. I saw how many people were being locked out.
            </p>
            <p className="text-lg md:text-xl text-black leading-relaxed mb-8">
              Adapt To Life was born from a simple, furious conviction: a person&apos;s access to the joy and power of sport should never depend on luck. We&apos;re building the pathway I wish I had.
            </p>
            <p className="text-lg text-black italic">
              — Alec Tranel, Founder
            </p>
          </div>
        </div>
      </section>

      {/* Section 4.2: Our Team */}
      <section className="py-16 md:py-24 bg-white border-t border-[#E5E5E5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-16 text-center">
            Our Team
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            {/* Team Member 1 */}
            <div className="text-center">
              <div className="w-32 h-32 bg-black rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-white text-4xl font-bold">AT</span>
              </div>
              <h3 className="text-xl font-bold text-black mb-2">
                Alec Tranel
              </h3>
              <p className="text-[#FF6B35] font-medium mb-4">
                Founder & Executive Director
              </p>
              <p className="text-black">
                Former competitive wrestler turned adaptive sports advocate. Dedicated to removing barriers between athletes and their potential.
              </p>
            </div>

            {/* Team Member 2 */}
            <div className="text-center">
              <div className="w-32 h-32 bg-black rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-white text-4xl font-bold">AB</span>
              </div>
              <h3 className="text-xl font-bold text-black mb-2">
                Advisory Board
              </h3>
              <p className="text-[#FF6B35] font-medium mb-4">
                Expert Guidance
              </p>
              <p className="text-black">
                Our advisory board includes Certified Therapeutic Recreation Specialists, Paralympic athletes, and healthcare professionals.
              </p>
            </div>

            {/* Team Member 3 */}
            <div className="text-center">
              <div className="w-32 h-32 bg-black rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-white text-4xl font-bold">V</span>
              </div>
              <h3 className="text-xl font-bold text-black mb-2">
                Our Volunteers
              </h3>
              <p className="text-[#FF6B35] font-medium mb-4">
                The Heart of Our Mission
              </p>
              <p className="text-black">
                Athletes, families, and community members who give their time to help others find their path to play.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <StoryContactCTA />
    </div>
  );
}
