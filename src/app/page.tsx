import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      {/* Section 1.1: Hero */}
      <section className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          {/* Logo with animation */}
          <div className="mb-8 animate-fade-in">
            <Image
              src="/AdaptToLife_dark.png"
              alt="AdaptToLife"
              width={280}
              height={280}
              className="mx-auto drop-shadow-sm"
              priority
            />
          </div>

          {/* Accent line */}
          <div className="w-16 h-1 bg-[#FF6B35] mx-auto mb-8" />

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-black mb-6 tracking-tight">
            The Path to Play.
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-700 max-w-2xl mx-auto mb-10 leading-relaxed">
            For 15 million Americans with physical disabilities, the journey from diagnosis to sport is a broken system. We fix it.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/solution"
              className="inline-block bg-black text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-800 transition-all duration-300"
            >
              Learn How
            </Link>
            <Link
              href="/donate"
              className="inline-block bg-[#FF6B35] text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#e55a2a] transition-all duration-300"
            >
              Donate Now
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Section 1.2: The Story (Miniature) */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xl md:text-2xl text-black leading-relaxed text-center font-light">
            It&apos;s 11 PM. A mother sits at her kitchen table, lost in a maze of broken links and outdated websites for her newly-injured son. She closes the laptop, defeated. He stays on the sidelines.
          </p>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed text-center mt-8">
            This story is the silent, frustrating reality for millions. It&apos;s a crisis of access, not desire.
          </p>
        </div>
      </section>

      {/* Section 1.3: Why It Matters */}
      <section className="py-20 md:py-32 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-10 tracking-tight">
            This is More Than a Game.
          </h2>
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
            Research confirms that adaptive sports are a catalyst for transformation. Participants experience profound improvements in quality of life, employment, and health. This isn&apos;t just about playing; it&apos;s about building a life of independence, confidence, and community.
          </p>
        </div>
      </section>

      {/* Section 1.4: The Fix */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-16 text-center">
            How We Fix It
          </h2>
          <div className="space-y-16">
            {/* Item 1 */}
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex-shrink-0">
                <span className="text-6xl md:text-7xl font-bold text-[#FF6B35]">01</span>
              </div>
              <div className="border-l-2 border-[#E5E5E5] pl-6 md:pl-8">
                <h3 className="text-2xl md:text-3xl font-bold text-black mb-3">
                  We Built the Front Door
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Our free platform, AdaptiveSportsNearMe.com, is the nation&apos;s most comprehensive tool for discovering local programs.
                </p>
              </div>
            </div>

            {/* Item 2 */}
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex-shrink-0">
                <span className="text-6xl md:text-7xl font-bold text-[#FF6B35]">02</span>
              </div>
              <div className="border-l-2 border-[#E5E5E5] pl-6 md:pl-8">
                <h3 className="text-2xl md:text-3xl font-bold text-black mb-3">
                  We Wrote the Rulebook
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  As the Khan Academy for Adaptive Sports, we create simple guides, videos, and tools that teach beginners the game.
                </p>
              </div>
            </div>

            {/* Item 3 */}
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex-shrink-0">
                <span className="text-6xl md:text-7xl font-bold text-[#FF6B35]">03</span>
              </div>
              <div className="border-l-2 border-[#E5E5E5] pl-6 md:pl-8">
                <h3 className="text-2xl md:text-3xl font-bold text-black mb-3">
                  We Bridge the Gap
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Our Athlete Deployment Fund provides direct grants for the equipment and fees that keep new athletes on the sidelines.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1.5: The Final Ask */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-black mb-8 tracking-tight">
            Help Us Build the Pathway.
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-12 leading-relaxed">
            Every person deserves the chance to play. Your support funds athletes directly and helps us guide the next family from the clinic to the court.
          </p>
          <Link
            href="/donate"
            className="inline-block bg-[#FF6B35] text-white px-12 py-5 rounded-full font-semibold text-lg hover:bg-[#e55a2a] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Donate Today
          </Link>
        </div>
      </section>
    </div>
  );
}
