import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Plus, Mic, Settings } from "lucide-react";

const suggestions = [
  { title: "Post Meeting Follow Up", desc: "Identify task and owners, suggest and complete next steps." },
  { title: "Daily Reflection", desc: "Reflects on your selected day's meetings (wins, challenges, lessons)." },
  { title: "Cross Meeting Analyst", desc: "Identify recurring topics, evolving decisions, or unresolved issues across meetings." },
  { title: "Top 5 Things", desc: "Distills weekly meetings into Top 5 Things and a polished team email." },
  { title: "Daily Report", desc: "Creates a daily status report by summarizing meetings, tasks, and updates." },
  { title: "Summarizer", desc: "Creates a high-level summary of a meeting or document." },
];

export default function AiCompanion() {
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState("Suggested");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#111] flex">
      {/* Sidebar */}
      <div className="w-56 bg-[#1a1a1a] border-r border-white/10 flex flex-col py-4 px-3 gap-1 shrink-0">
        <button className="flex items-center gap-2 text-white text-sm px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
          <Plus size={16} /> New chat
        </button>
        <button className="flex items-center gap-2 text-gray-400 text-sm px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
          <Mic size={16} /> In-person transcription
        </button>
        <button className="flex items-center gap-2 text-gray-400 text-sm px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
          ✏️ Help me write
        </button>
        <button className="flex items-center gap-2 text-gray-400 text-sm px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
          🗓️ Meetings
        </button>
        <button className="flex items-center gap-2 text-gray-400 text-sm px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
          ⚡ Workflows
          <span className="ml-auto text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-semibold">NEW</span>
        </button>
        <div className="mt-auto">
          <button className="flex items-center gap-2 text-gray-400 text-sm px-3 py-2 rounded-lg hover:bg-white/10 transition-colors w-full">
            <Settings size={16} /> Settings
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col items-center justify-between py-10 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">
            <span className="text-[#2D8CFF]">MeetUp</span> AI Companion
          </h1>
        </div>

        {/* Input */}
        <div className="w-full max-w-2xl bg-[#1e1e1e] border border-white/10 rounded-2xl px-4 py-3 mb-6">
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Write a message"
            rows={2}
            className="w-full bg-transparent text-white text-sm resize-none outline-none placeholder-gray-500"
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-3">
              <button className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Plus size={14} className="text-white" />
              </button>
              <button className="text-gray-400 text-xs hover:text-white transition-colors flex items-center gap-1">
                🔍 All sources
              </button>
              <button className="text-gray-400 text-xs hover:text-white transition-colors flex items-center gap-1">
                ⚙️ Mode
              </button>
            </div>
            <button
              disabled={!message.trim()}
              className="w-8 h-8 rounded-full bg-[#2D8CFF] flex items-center justify-center disabled:opacity-30 hover:bg-blue-500 transition-colors"
            >
              <Send size={14} className="text-white" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="w-full max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-4">
              {["Suggested", "Meeting", "Coaching"].map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`text-sm pb-1 border-b-2 transition-colors ${tab === t ? "text-[#2D8CFF] border-[#2D8CFF]" : "text-gray-400 border-transparent hover:text-white"}`}
                >
                  {t}
                </button>
              ))}
            </div>
            <button className="text-sm text-[#2D8CFF] hover:underline">View all</button>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {suggestions.map(({ title, desc }) => (
              <button
                key={title}
                onClick={() => setMessage(title)}
                className="text-left bg-[#1e1e1e] border border-white/10 rounded-xl p-4 hover:border-blue-500/50 hover:bg-[#252525] transition-all"
              >
                <p className="text-white text-sm font-medium mb-1">{title}</p>
                <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Back */}
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-8 text-gray-500 text-xs hover:text-gray-300 transition-colors"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}
