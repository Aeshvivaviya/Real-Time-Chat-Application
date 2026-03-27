import { useState } from "react";

const ExternalIcon = () => (
  <svg className="w-3 h-3 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

const ChevronRight = () => (
  <svg className="w-3 h-3 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const Badge = ({ text }) => (
  <span className="text-[10px] bg-blue-100 text-[#2D8CFF] px-1.5 py-0.5 rounded font-semibold shrink-0">{text}</span>
);

const sections = [
  {
    title: "My Products",
    items: [
      { label: "AI Companion", badge: "New", external: true, link: "https://ai.zoom.us/?from=web_portal" },
      { label: "Meetings" },
      { label: "Recordings" },
      { label: "Summaries" },
      { label: "Hub", badge: "New", external: true },
      { label: "Whiteboards", external: true },
      { label: "Notes" },
      { label: "Clips", external: true },
      { label: "AI Docs", external: true },
      { label: "Tasks" },
      { label: "Discover More Products" },
    ],
  },
  {
    title: "My Account",
    collapsible: true,
    items: [
      { label: "Profile" },
      { label: "Settings" },
      { label: "Personal Devices" },
      { label: "Personal Contacts" },
      { label: "Data & Privacy" },
    ],
  },
  {
    title: "Admin",
    collapsible: true,
    items: [
      { label: "Plans and Billing" },
      { label: "User Management" },
      { label: "Account Management" },
      { label: "Advanced" },
    ],
  },
  {
    title: "Support",
    collapsible: true,
    items: [
      { label: "Zoom Learning Center", external: true },
      { label: "Video Tutorials" },
      { label: "Knowledge Base" },
    ],
  },
];

export default function Sidebar() {
  const [active, setActive] = useState("Meetings");
  const [collapsed, setCollapsed] = useState({ "My Account": true, Admin: true, Support: true });

  const toggleSection = (title) => {
    setCollapsed((p) => ({ ...p, [title]: !p[title] }));
  };

  return (
    <div className="w-[250px] shrink-0 bg-[#F7F8FA] border-r border-gray-200 flex flex-col h-full overflow-y-auto">
      <div className="px-3 py-3">

        {/* Home */}
        <button
          onClick={() => setActive("Home")}
          className={`w-full text-left text-sm px-3 py-2 rounded-lg mb-2 font-medium transition-colors ${active === "Home" ? "bg-blue-50 text-[#2D8CFF]" : "text-gray-700 hover:bg-gray-200"}`}
        >
          Home
        </button>

        {sections.map(({ title, items, collapsible }) => (
          <div key={title} className="mb-2">
            {/* Section title */}
            {collapsible ? (
              <button
                onClick={() => toggleSection(title)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
              >
                <span>{title}</span>
                <svg className={`w-3 h-3 transition-transform ${collapsed[title] ? "" : "rotate-90"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <p className="text-xs font-semibold text-gray-500 px-3 py-1.5">{title}</p>
            )}

            {/* Items */}
            {(!collapsible || !collapsed[title]) && items.map(({ label, badge, external, link }) => (
              <button
                key={label}
                onClick={() => {
                  setActive(label);
                  if (link) window.open(link, '_blank');
                }}
                className={`w-full text-left text-sm px-3 py-1.5 rounded-lg flex items-center justify-between gap-1 transition-colors ${active === label ? "bg-blue-50 text-[#2D8CFF] font-medium" : "text-gray-600 hover:bg-gray-200"}`}
              >
                <span className="truncate">{label}</span>
                <span className="flex items-center gap-1 shrink-0">
                  {badge && <Badge text={badge} />}
                  {external && <ExternalIcon />}
                </span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
