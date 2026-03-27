import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ProfileHeader from "../components/ProfileHeader";
import Slider from "../components/Slider";
import RecentActivity from "../components/RecentActivity";
import RightPanel from "../components/RightPanel";
import MeetingsCard from "../components/MeetingsCard";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar onMenuClick={() => setSidebarOpen(p => !p)} />

      <div className="flex flex-1 relative">

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed left-0 top-0 h-full z-40 pt-[110px]
          lg:sticky lg:top-0 lg:h-screen lg:pt-0 lg:z-auto
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-5 min-w-0">
          <div className="max-w-5xl mx-auto flex flex-col xl:flex-row gap-4">

            {/* Center */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">
              <ProfileHeader />
              <Slider />
              <RecentActivity />
            </div>

            {/* Right panel */}
            <div className="flex flex-col sm:flex-row xl:flex-col gap-4 xl:w-64 shrink-0">
              <div className="flex-1 xl:flex-none"><RightPanel /></div>
              <div className="flex-1 xl:flex-none"><MeetingsCard /></div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
