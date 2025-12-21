import { Metadata } from "next";
import { getSetting } from "@/lib/db";

export const metadata: Metadata = {
  title: "Donate | AdaptToLife",
  description:
    "Support AdaptToLife with a tax-deductible donation. 100% of donations to our Athlete Deployment Fund go directly to athletes.",
};

// Revalidate every 60 seconds
export const revalidate = 60;

async function getDonationUrl(): Promise<string> {
  try {
    const url = await getSetting("donation_url");
    if (url) return url;
  } catch (error) {
    console.error("Error fetching donation URL:", error);
  }
  // Default fallback
  return "https://www.zeffy.com/donation-form/adapt-to-life";
}

export default async function DonatePage() {
  const donationUrl = await getDonationUrl();

  return (
    <div>
      {/* Hero */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-black mb-8">
            Fund the Pathway.
          </h1>
          <p className="text-xl md:text-2xl text-black max-w-3xl mx-auto">
            Every dollar you give brings another athlete from the sidelines to the game.
          </p>
        </div>
      </section>

      {/* 100% Promise */}
      <section className="py-16 md:py-24 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">
            Our 100% to Athletes Promise
          </h2>
          <p className="text-lg md:text-xl text-white leading-relaxed mb-10">
            One hundred percent of all public donations designated for our Athlete Deployment Fund go directly to athlete support. No overhead. No exceptions.
          </p>
          <a
            href={donationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#FF6B35] text-white px-12 py-4 rounded-full font-semibold text-lg hover:bg-[#e55a2a] transition-colors"
          >
            Donate Now
          </a>
          <p className="text-sm text-gray-400 mt-4">
            You will be redirected to our secure donation form on Zeffy (0% fees).
          </p>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-black text-center mb-16">
            Your Impact
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center border border-[#E5E5E5] rounded-lg p-8">
              <div className="text-5xl font-bold text-[#FF6B35] mb-4">$100</div>
              <p className="text-black">
                Covers registration fees for a new athlete&apos;s first season
              </p>
            </div>
            <div className="text-center border border-[#E5E5E5] rounded-lg p-8">
              <div className="text-5xl font-bold text-[#FF6B35] mb-4">$500</div>
              <p className="text-black">
                Funds travel expenses for a rural athlete to reach programs
              </p>
            </div>
            <div className="text-center border border-[#E5E5E5] rounded-lg p-8">
              <div className="text-5xl font-bold text-[#FF6B35] mb-4">$2,500</div>
              <p className="text-black">
                Provides a sport wheelchair for an athlete in need
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Where Your Money Goes */}
      <section className="py-16 md:py-24 bg-white border-t border-[#E5E5E5]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-black text-center mb-16">
            Where Your Donation Goes
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-bold text-black mb-4">
                Athlete Deployment Fund
              </h3>
              <p className="text-black">
                Direct grants to athletes for equipment, program fees, and travel expenses. This is the final bridge from the sidelines to the game.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-black mb-4">
                Education & Discovery
              </h3>
              <p className="text-black">
                Building and maintaining our free educational resources and the AdaptiveSportsNearMe.com directory that connects families to programs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tax Info */}
      <section className="py-12 bg-white border-t border-[#E5E5E5]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-black">
            <strong>AdaptToLife</strong> is a registered 501(c)(3) non-profit organization. All donations are tax-deductible to the extent allowed by law. You will receive a receipt for your records.
          </p>
        </div>
      </section>

      {/* Other Ways to Help */}
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
              <a
                href="mailto:volunteer@adapttolife.org"
                className="text-black font-medium hover:text-[#FF6B35] underline underline-offset-4"
              >
                Get Involved →
              </a>
            </div>
            <div>
              <h3 className="font-bold text-black mb-2">
                Corporate Sponsorship
              </h3>
              <p className="text-black text-sm mb-4">
                Partner with us to make a bigger impact in the community.
              </p>
              <a
                href="mailto:partnerships@adapttolife.org"
                className="text-black font-medium hover:text-[#FF6B35] underline underline-offset-4"
              >
                Partner With Us →
              </a>
            </div>
            <div>
              <h3 className="font-bold text-black mb-2">
                Equipment Donation
              </h3>
              <p className="text-black text-sm mb-4">
                Donate sport wheelchairs or other adaptive equipment.
              </p>
              <a
                href="mailto:equipment@adapttolife.org"
                className="text-black font-medium hover:text-[#FF6B35] underline underline-offset-4"
              >
                Learn More →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24 bg-black">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-lg text-white mb-8">
            Your support changes lives. Help us get the next athlete in the game.
          </p>
          <a
            href={donationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#FF6B35] text-white px-12 py-4 rounded-full font-semibold text-lg hover:bg-[#e55a2a] transition-colors"
          >
            Donate Today
          </a>
        </div>
      </section>
    </div>
  );
}
