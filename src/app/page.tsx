import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      {/* Section 1.1: Hero */}
      <section className="min-h-[80vh] flex items-center justify-center bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="mb-12">
            <Image
              src="/AdaptToLife_dark.png"
              alt="AdaptToLife Logo"
              width={200}
              height={200}
              className="mx-auto"
              priority
            />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-black mb-8">
            The Path to Play.
          </h1>
          <p className="text-xl md:text-2xl text-black max-w-3xl mx-auto">
            For 15 million Americans with physical disabilities, the journey from diagnosis to sport is a broken system. We fix it.
          </p>
        </div>
      </section>

      {/* Section 1.2: The Story (Miniature) */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-lg md:text-xl text-black leading-relaxed text-center">
            It&apos;s 11 PM. A mother sits at her kitchen table, lost in a maze of broken links and outdated websites for her newly-injured son. She closes the laptop, defeated. He stays on the sidelines. This story is the silent, frustrating reality for millions. It&apos;s a crisis of access, not desire.
          </p>
        </div>
      </section>

      {/* Section 1.3: Why It Matters */}
      <section className="py-16 md:py-24 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">
            This is More Than a Game.
          </h2>
          <p className="text-lg md:text-xl text-white leading-relaxed">
            Research confirms that adaptive sports are a catalyst for transformation. Participants experience profound improvements in quality of life, employment, and health. This isn&apos;t just about playing; it&apos;s about building a life of independence, confidence, and community.
          </p>
        </div>
      </section>

      {/* Section 1.4: The Fix */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {/* Item 1 */}
            <div className="border-b border-[#E5E5E5] pb-12">
              <h3 className="text-2xl md:text-3xl font-bold text-black mb-4">
                01. We Built the Front Door
              </h3>
              <p className="text-lg text-black">
                Our free platform, AdaptiveSportsNearMe.com, is the nation&apos;s most comprehensive tool for discovering local programs.
              </p>
            </div>

            {/* Item 2 */}
            <div className="border-b border-[#E5E5E5] pb-12">
              <h3 className="text-2xl md:text-3xl font-bold text-black mb-4">
                02. We Wrote the Rulebook
              </h3>
              <p className="text-lg text-black">
                As the Khan Academy for Adaptive Sports, we create simple guides, videos, and tools that teach beginners the game.
              </p>
            </div>

            {/* Item 3 */}
            <div className="pb-12">
              <h3 className="text-2xl md:text-3xl font-bold text-black mb-4">
                03. We Bridge the Gap
              </h3>
              <p className="text-lg text-black">
                Our Athlete Deployment Fund provides direct grants for the equipment and fees that keep new athletes on the sidelines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1.5: The Final Ask */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-black mb-8">
            Help Us Build the Pathway.
          </h2>
          <p className="text-lg md:text-xl text-black mb-10">
            Every person deserves the chance to play. Your support funds athletes directly and helps us guide the next family from the clinic to the court.
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
