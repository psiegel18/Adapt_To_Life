import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Help | AdaptToLife",
  description: "Apply for a grant from our Athlete Deployment Fund or refer a patient to our programs.",
};

export default function GetHelpPage() {
  return (
    <div>
      {/* Hero */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-black">
            Let Us Help.
          </h1>
        </div>
      </section>

      {/* Section 6.1: For Athletes & Families */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            Apply for a Grant
          </h2>
          <p className="text-lg md:text-xl text-black leading-relaxed mb-10">
            Our Athlete Deployment Fund provides direct grants for equipment, fees, and travel. If you are an athlete or family in need of support, we encourage you to apply. The process is simple and confidential.
          </p>
          <a
            href="#application-form"
            className="inline-block bg-[#FF6B35] text-white px-10 py-4 rounded-full font-semibold text-lg hover:bg-[#e55a2a] transition-colors"
          >
            Start Your Application
          </a>
        </div>
      </section>

      {/* Section 6.2: For Healthcare Professionals */}
      <section className="py-16 md:py-24 bg-white border-t border-[#E5E5E5]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            Refer a Patient
          </h2>
          <p className="text-lg md:text-xl text-black leading-relaxed mb-10">
            As a CTRS or other healthcare professional, you are on the front lines. If you have a patient who could benefit from our resources or funding, you can refer them to us directly. We will work with you to ensure they have a clear pathway to participation.
          </p>
          <a
            href="mailto:referrals@adapttolife.org"
            className="inline-block text-black font-semibold text-lg hover:text-[#FF6B35] transition-colors underline underline-offset-4"
          >
            Make a Referral →
          </a>
        </div>
      </section>

      {/* Application Form Placeholder */}
      <section id="application-form" className="py-16 md:py-24 bg-black">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
            Grant Application
          </h2>
          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-white font-medium mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-4 py-3 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-white font-medium mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-4 py-3 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-white font-medium mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="w-full px-4 py-3 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              />
            </div>
            <div>
              <label htmlFor="sport" className="block text-white font-medium mb-2">
                Sport of Interest *
              </label>
              <select
                id="sport"
                name="sport"
                required
                className="w-full px-4 py-3 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              >
                <option value="">Select a sport</option>
                <option value="wheelchair-basketball">Wheelchair Basketball</option>
                <option value="wheelchair-tennis">Wheelchair Tennis</option>
                <option value="adaptive-swimming">Adaptive Swimming</option>
                <option value="sled-hockey">Sled Hockey</option>
                <option value="handcycling">Handcycling</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="need" className="block text-white font-medium mb-2">
                What do you need support with? *
              </label>
              <textarea
                id="need"
                name="need"
                rows={4}
                required
                className="w-full px-4 py-3 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                placeholder="Tell us about your needs—equipment, program fees, travel expenses, etc."
              ></textarea>
            </div>
            <div>
              <label htmlFor="story" className="block text-white font-medium mb-2">
                Your Story (Optional)
              </label>
              <textarea
                id="story"
                name="story"
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                placeholder="Share your journey—we'd love to hear about your goals and what adaptive sports mean to you."
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-[#FF6B35] text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#e55a2a] transition-colors"
            >
              Submit Application
            </button>
            <p className="text-sm text-gray-400 text-center">
              All applications are reviewed within 2 weeks. Your information is kept confidential.
            </p>
          </form>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            Find Programs Near You
          </h2>
          <p className="text-lg md:text-xl text-black mb-10">
            Use our free directory to discover adaptive sports programs in your area.
          </p>
          <a
            href="https://www.adaptivesportsnearme.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border-2 border-black text-black px-10 py-4 rounded-full font-semibold text-lg hover:bg-black hover:text-white transition-colors"
          >
            Visit AdaptiveSportsNearMe.com
          </a>
        </div>
      </section>
    </div>
  );
}
