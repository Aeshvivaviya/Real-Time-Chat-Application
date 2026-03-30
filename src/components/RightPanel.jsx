import { useState } from "react";
import { useNavigate } from "react-router-dom";
import HostPopup from "./child/HostPopup";

export default function RightPanel() {
  const [copied, setCopied] = useState(false);
  const [showHostPopup, setShowHostPopup] = useState(false);
  const navigate = useNavigate();
  const meetingId = "233 165 8987";

  const handleCopy = () => {
    navigator.clipboard.writeText(meetingId.replace(/\s/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      {/* Action buttons */}
      <div className="flex justify-around mb-5">
        {[
          {
            label: "Chat", color: "bg-blue-500", isChat: true,
            icon: <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
          },
          {
            label: "Join", color: "bg-blue-400",
            icon: <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          },
          {
            label: "Host", color: "bg-red-500", isHost: true,
            icon: <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0013.5 5.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z" /></svg>
          },
        ].map(({ label, color, icon, isHost, isChat }) => (
          <button key={label} onClick={isHost ? () => setShowHostPopup(true) : isChat ? () => navigate("/chat") : undefined} className="flex flex-col items-center gap-1.5 group">
            <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center shadow-sm group-hover:opacity-90 transition-opacity`}>
              {icon}
            </div>
            <span className="text-xs text-gray-600">{label}</span>
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 mb-4" />

      {/* Personal Meeting ID */}
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-800 mb-1">Personal Meeting ID</p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-gray-600 tracking-wide">{meetingId}</span>
          <button onClick={handleCopy} className="text-gray-400 hover:text-[#2D8CFF] transition-colors" title="Copy">
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

      {showHostPopup && <HostPopup onClose={() => setShowHostPopup(false)} />}
    </div>
  );
}
