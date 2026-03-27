import Navbar from "../components/Navbar";
import ProfileHeader from "../components/ProfileHeader";
import Slider from "../components/Slider";
import RecentActivity from "../components/RecentActivity";
import RightPanel from "../components/RightPanel";
import MeetingsCard from "../components/MeetingsCard";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Center — 2 cols */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <ProfileHeader />
          <Slider />
          <RecentActivity />
        </div>

        {/* Right — 1 col */}
        <div className="flex flex-col gap-5">
          <RightPanel />
          <MeetingsCard />
        </div>

      </main>
    </div>
  );
}
