import { useState } from "react";

const actions = [
  {
    label: "Schedule",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  {
    label: "Join",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
  },
  {
    label: "Host",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0013.5 5.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z" />
      </svg>
    ),
  },
];

export default function RightPanel() {
  const [copied, setCopied] = useState(false);
  const meetingId = "233 165 8987";

  const handleCopy = () => {
    navigator.clipboard.writeText(meetingId.replace(/\s/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-5">
      {/* Action buttons */}
      <div className="flex justify-around">
        {actions.map(({ label, icon }) => (
          <button key={label} className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-[#2D8CFF] group-hover:bg-blue-100 transition-colors">
              {icon}
            </div>
            <span className="text-xs font-medium text-gray-600 group-hover:text-[#2D8CFF] transition-colors">{label}</span>
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Personal Meeting ID */}
      <div>
        <p className="text-xs text-gray-500 mb-1">Personal Meeting ID</p>
        <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
          <span className="text-sm font-semibold text-gray-800 tracking-wide">{meetingId}</span>
          <button onClick={handleCopy} className="text-gray-400 hover:text-[#2D8CFF] transition-colors ml-2" title="Copy">
            {copied ? (
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
