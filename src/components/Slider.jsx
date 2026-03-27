import { useState, useEffect } from "react";

const slides = [
  {
    tag: "Limited time offer!",
    title: "Take an additional 15% off when you upgrade to MeetUp Workplace Pro annual!",
    button: "Get offer",
    bg: "from-purple-50 to-blue-50",
    accent: "bg-purple-100",
  },
  {
    tag: "New Feature!",
    title: "Try MeetUp AI Companion — your intelligent meeting assistant, included free.",
    button: "Learn more",
    bg: "from-blue-50 to-cyan-50",
    accent: "bg-blue-100",
  },
  {
    tag: "Upgrade today!",
    title: "Get unlimited meeting duration and advanced admin controls with Pro plan.",
    button: "Upgrade now",
    bg: "from-green-50 to-teal-50",
    accent: "bg-green-100",
  },
];

export default function Slider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((p) => (p + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[current];

  return (
    <div className={`bg-gradient-to-r ${slide.bg} rounded-2xl p-6 relative overflow-hidden transition-all duration-500`}>
      {/* Background shape */}
      <div className={`absolute right-0 top-0 w-48 h-48 ${slide.accent} rounded-full opacity-40 translate-x-16 -translate-y-10`} />
      <div className={`absolute right-10 bottom-0 w-32 h-32 ${slide.accent} rounded-full opacity-30 translate-y-10`} />

      <div className="relative z-10 max-w-lg">
        <span className="inline-block text-xs font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full mb-3">
          {slide.tag}
        </span>
        <p className="text-gray-800 font-medium text-sm leading-relaxed mb-4">{slide.title}</p>
        <button className="px-5 py-2 text-sm font-semibold text-white bg-[#2D8CFF] rounded-lg hover:bg-blue-600 transition-colors">
          {slide.button}
        </button>
      </div>

      {/* Dots */}
      <div className="flex gap-1.5 mt-5 relative z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "w-6 bg-[#2D8CFF]" : "w-1.5 bg-gray-300"}`}
          />
        ))}
      </div>
    </div>
  );
}
