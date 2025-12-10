import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Donate | AdaptToLife",
  description:
    "Support AdaptToLife with a tax-deductible donation. Help us provide adaptive sports programs and equipment for individuals with physical disabilities.",
};

export default function DonatePage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Support Our Mission
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Your donation helps individuals with physical disabilities
            participate in adaptive sports and live active, fulfilling lives.
          </p>
        </div>
      </section>

      {/* Donation Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-8 md:p-12">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Make a Donation
                </h2>
                <p className="text-gray-600">
                  100% of your donation goes directly to our programs. We use
                  Zeffy, a platform that charges non-profits zero fees.
                </p>
              </div>

              {/* Zeffy Donation Button/Link */}
              {/*
                To set up Zeffy:
                1. Create a free account at zeffy.com
                2. Set up your organization profile
                3. Create a donation form
                4. Replace the href below with your Zeffy donation form URL
              */}
              <div className="text-center">
                <a
                  href="https://www.zeffy.com/donation-form/adapt-to-life"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-orange-500 text-white px-12 py-4 rounded-full font-semibold text-lg hover:bg-orange-600 transition-colors shadow-lg hover:shadow-xl"
                >
                  Donate Now
                </a>
                <p className="text-sm text-gray-500 mt-4">
                  You will be redirected to our secure donation form on Zeffy.
                </p>
              </div>

              {/* Alternative: Embed Zeffy Form */}
              {/*
                You can also embed the Zeffy form directly:
                <iframe
                  src="https://www.zeffy.com/embed/donation-form/YOUR-FORM-ID"
                  style={{ width: '100%', height: '600px', border: 'none' }}
                  title="Donation form"
                />
              */}
            </div>
          </div>

          {/* Impact Section */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 text-center shadow-md">
              <div className="text-3xl font-bold text-blue-600 mb-2">$25</div>
              <p className="text-gray-600">
                Provides basketball equipment for one practice session
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-md">
              <div className="text-3xl font-bold text-blue-600 mb-2">$100</div>
              <p className="text-gray-600">
                Sponsors a participant for one month of programs
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-md">
              <div className="text-3xl font-bold text-blue-600 mb-2">$500</div>
              <p className="text-gray-600">
                Helps purchase a sport wheelchair for our lending program
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Donate Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Where Your Donation Goes
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-orange-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Equipment</h3>
              <p className="text-gray-600 text-sm">
                Sport wheelchairs, basketballs, and adaptive fitness equipment
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Coaching</h3>
              <p className="text-gray-600 text-sm">
                Professional coaches and trainers for all our programs
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Facilities</h3>
              <p className="text-gray-600 text-sm">
                Accessible venue rentals for practices and events
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Scholarships</h3>
              <p className="text-gray-600 text-sm">
                Financial assistance for participants who need support
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tax Info */}
      <section className="py-12 bg-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600">
            <strong>AdaptToLife</strong> is a registered 501(c)(3) non-profit
            organization. All donations are tax-deductible to the extent allowed
            by law. You will receive a receipt for your records.
          </p>
        </div>
      </section>

      {/* Other Ways to Help */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Other Ways to Support
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Volunteer</h3>
              <p className="text-gray-600 text-sm mb-4">
                Help at events, coach, or assist with administrative tasks.
              </p>
              <Link
                href="/about#volunteer"
                className="text-blue-600 font-medium hover:text-blue-700"
              >
                Learn More &rarr;
              </Link>
            </div>
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Corporate Sponsorship
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Partner with us to make a bigger impact in the community.
              </p>
              <a
                href="mailto:info@adapttolife.org"
                className="text-blue-600 font-medium hover:text-blue-700"
              >
                Contact Us &rarr;
              </a>
            </div>
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Equipment Donation
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Donate sport wheelchairs or adaptive equipment.
              </p>
              <a
                href="mailto:info@adapttolife.org"
                className="text-blue-600 font-medium hover:text-blue-700"
              >
                Get in Touch &rarr;
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
