import { useState, useEffect } from "react";

const slides = [
  {
    tag: "Limited time offer!",
    title: "Take an additional 15% off when you upgrade to MeetUp Workplace Pro annual!",
    button: "Get offer",
    terms: true,
  },
  {
    tag: "New Feature!",
    title: "Try MeetUp AI Companion — your intelligent meeting assistant, included free.",
    button: "Learn more",
    terms: false,
  },
];

function PersonIllustration() {
  return (
    <svg viewBox="0 0 120 180" className="w-28 h-40" fill="none">
      {/* Head */}
      <circle cx="60" cy="35" r="18" fill="#F4A261" />
      {/* Hair */}
      <ellipse cx="60" cy="20" rx="18" ry="10" fill="#3D2B1F" />
      {/* Body */}
      <rect x="38" y="55" width="44" height="55" rx="8" fill="#4CAF82" />
      {/* Left arm */}
      <rect x="18" y="58" width="22" height="10" rx="5" fill="#4CAF82" transform="rotate(-20 18 58)" />
      {/* Right arm raised */}
      <rect x="78" y="40" width="22" height="10" rx="5" fill="#4CAF82" transform="rotate(-50 78 40)" />
      {/* Pants */}
      <rect x="38" y="105" width="20" height="45" rx="5" fill="#2C2C2C" />
      <rect x="62" y="105" width="20" height="45" rx="5" fill="#2C2C2C" />
      {/* Shoes */}
      <ellipse cx="48" cy="150" rx="12" ry="6" fill="#1a1a1a" />
      <ellipse cx="72" cy="150" rx="12" ry="6" fill="#1a1a1a" />
    </svg>
  );
}

export default function Slider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((p) => (p + 1) % slides.length), 4000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[current];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden relative">
      <div className="flex items-center justify-between px-8 py-6 relative min-h-[180px]">
        {/* Purple circle bg */}
        <div className="absolute right-24 top-1/2 -translate-y-1/2 w-44 h-44 bg-purple-100 rounded-full opacity-60" />

        {/* Content */}
        <div className="relative z-10 max-w-xs">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{slide.tag}</h2>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">{slide.title}</p>
          <button className="px-5 py-2 text-sm font-semibold text-white bg-[#2D8CFF] rounded-lg hover:bg-blue-600 transition-colors">
            {slide.button}
          </button>
          {slide.terms && <p className="text-xs text-gray-400 mt-3">Terms apply</p>}
        </div>

        {/* Illustration */}
        <div className="relative z-10 shrink-0">
          <PersonIllustration />
        </div>

        {/* Right arrow */}
        <button
          onClick={() => setCurrent((p) => (p + 1) % slides.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 z-10"
        >
          <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 pb-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "w-5 bg-[#2D8CFF]" : "w-1.5 bg-gray-300"}`}
          />
        ))}
      </div>
    </div>
  );
}
