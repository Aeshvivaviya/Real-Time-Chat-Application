import { useState } from "react";

const features = [
  "Get up to 40 minutes and 100 participants per meeting",
  "Share up to 10 docs",
  "Get 3 editable whiteboards",
  "Unlimited instant messaging",
  "Create up to 5 two-minute video messages",
];

const participants = [
  { name: "Alex", bg: "bg-blue-500", gridBg: "bg-blue-900" },
  { name: "Sara", bg: "bg-red-400", gridBg: "bg-blue-800" },
  { name: "Mike", bg: "bg-green-500", gridBg: "bg-green-900" },
  { name: "Jess", bg: "bg-yellow-400 text-gray-800", gridBg: "bg-purple-900" },
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

export default function ZoomVerify() {
  const [birthYear, setBirthYear] = useState("");

  const currentYear = new Date().getFullYear();
  const year = parseInt(birthYear);
  const isValid = birthYear.length === 4 && year >= 1900 && year <= currentYear;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 h-14 flex items-center justify-between">
        <span className="text-2xl font-bold text-[#2D8CFF] tracking-tight">zoom</span>
        <nav className="flex items-center gap-6">
          <a href="#" className="text-sm text-gray-600 hover:text-[#2D8CFF] font-medium transition-colors">Sign In</a>
          <a href="#" className="text-sm text-gray-600 hover:text-[#2D8CFF] font-medium transition-colors">Support</a>
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

            {/* Video illustration */}
            <div className="bg-gray-900 rounded-2xl p-5">
              <div className="grid grid-cols-2 gap-2 mb-3">
                {participants.map((p) => (
                  <div key={p.name} className={`${p.gridBg} rounded-xl h-28 flex items-center justify-center relative`}>
                    <div className={`w-11 h-11 rounded-full ${p.bg} flex items-center justify-center text-white font-bold text-lg`}>
                      {p.name[0]}
                    </div>
                    <span className="absolute bottom-2 left-2 text-xs text-white bg-black/40 px-2 py-0.5 rounded">
                      {p.name}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-3">
                {["🎤", "📷", "💬", "⋯"].map((icon) => (
                  <button key={icon} className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm hover:bg-gray-600 transition-colors">
                    {icon}
                  </button>
                ))}
                <button className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors">
                  📞
                </button>
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
          <div className="w-full md:w-80 bg-white rounded-2xl p-8 shadow-md border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify your age</h2>
            <p className="text-sm text-gray-500 mb-7 leading-relaxed">
              Please confirm your birth year. This data will not be stored.
            </p>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                maxLength={4}
                placeholder="Birth Year"
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value.replace(/\D/g, ""))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#2D8CFF] transition-colors placeholder-gray-400"
              />
              <button
                disabled={!isValid}
                className="w-full py-3 rounded-lg text-sm font-semibold text-white bg-[#2D8CFF] transition-opacity disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:bg-blue-600"
              >
                Continue
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
