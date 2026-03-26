import { useState } from "react";

const features = [
  "Get up to 40 minutes and 100 participants per meeting",
  "Share up to 10 docs",
  "Get 3 editable whiteboards",
  "Unlimited instant messaging",
  "Create up to 5 two-minute video messages",
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
            <div className="mb-6">
              <button className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all font-medium">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
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
