import { useState } from "react";

const features = [
  "Get up to 40 minutes and 100 participants per meeting",
  "Share up to 10 docs",
  "Get 3 editable whiteboards",
  "Unlimited instant messaging",
  "Create up to 5 two-minute video messages",
];

const socialButtons = [
  { label: "SSO", icon: "🔐" },
  { label: "Apple", icon: "🍎" },
  { label: "Google", icon: "G" },
  { label: "Facebook", icon: "f" },
  { label: "Microsoft", icon: "⊞" },
];

function CheckIcon() {
  return (
    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
      <svg className="w-3 h-3 stroke-green-700" viewBox="0 0 12 12" fill="none" strokeWidth="2.5">
        <polyline points="2,6 5,9 10,3" />
      </svg>
    </span>
  );
}

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 md:px-10 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#2D8CFF] rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z"/>
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900">Meet<span className="text-[#2D8CFF]">Up</span></span>
        </div>
        <nav className="flex items-center gap-4 md:gap-6">
          <span className="text-sm text-gray-500 hidden md:block">
            Already have an account?{" "}
            <a href="#" className="text-[#2D8CFF] font-medium hover:underline">Sign In</a>
          </span>
          <a href="#" className="text-sm text-gray-600 hover:text-[#2D8CFF] font-medium">Support</a>
          <select className="text-sm border border-gray-300 rounded-md px-2 py-1 text-gray-600 outline-none focus:border-[#2D8CFF]">
            <option>English</option>
            <option>Hindi</option>
            <option>Spanish</option>
          </select>
        </nav>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="flex flex-col md:flex-row gap-10 w-full max-w-4xl items-center">

          {/* Left */}
          <div className="flex-1 flex flex-col gap-5">
            {/* Illustration */}
            <div className="bg-gray-100 rounded-2xl p-8 flex items-center justify-center min-h-48">
              <div className="flex flex-col items-center gap-4">
                {/* Envelope illustration */}
                <div className="relative">
                  <div className="w-24 h-16 bg-[#2D8CFF] rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0l-9.75 6.75L2.25 6.75" />
                    </svg>
                  </div>
                  {/* Person */}
                  <div className="absolute -right-8 -bottom-4 flex flex-col items-center">
                    <div className="w-8 h-8 bg-orange-300 rounded-full border-2 border-white" />
                    <div className="w-6 h-10 bg-blue-400 rounded-t-lg mt-0.5" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-6">Sign up with your work email</p>
              </div>
            </div>

            {/* Feature card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Create your free Basic account</h3>
              <ul className="space-y-3">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-gray-600">
                    <CheckIcon />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right */}
          <div className="w-full md:w-96 bg-white rounded-2xl p-8 shadow-md border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Let's get started</h2>

            <div className="flex flex-col gap-3 mb-4">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#2D8CFF] focus:ring-2 focus:ring-blue-100 transition-all placeholder-gray-400"
              />
              <button
                disabled={!isValid}
                className="w-full py-3 rounded-lg text-sm font-semibold text-white bg-[#2D8CFF] transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:bg-blue-600"
              >
                Continue
              </button>
            </div>

            <p className="text-xs text-gray-400 text-center mb-5 leading-relaxed">
              By proceeding, I agree to MeetUp's{" "}
              <a href="#" className="text-[#2D8CFF] hover:underline">Privacy Statement</a>{" "}
              and{" "}
              <a href="#" className="text-[#2D8CFF] hover:underline">Terms of Service</a>.
            </p>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">Or sign up with</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Social buttons */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {socialButtons.map((s) => (
                <button
                  key={s.label}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all font-medium"
                >
                  <span className="text-base">{s.icon}</span>
                  <span className="text-xs">{s.label}</span>
                </button>
              ))}
            </div>

            <p className="text-xs text-gray-400 text-center leading-relaxed">
              MeetUp is protected by reCAPTCHA and the Google{" "}
              <a href="#" className="text-[#2D8CFF] hover:underline">Privacy Policy</a>{" "}
              and{" "}
              <a href="#" className="text-[#2D8CFF] hover:underline">Terms of Service</a> apply.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
