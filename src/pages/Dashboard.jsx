import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ProfileHeader from "../components/ProfileHeader";
import Slider from "../components/Slider";
import RecentActivity from "../components/RecentActivity";
import RightPanel from "../components/RightPanel";
import MeetingsCard from "../components/MeetingsCard";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-5">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Center — 2 cols */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <ProfileHeader />
              <Slider />
              <RecentActivity />
            </div>
            {/* Right — 1 col */}
            <div className="flex flex-col gap-4">
              <RightPanel />
              <MeetingsCard />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
