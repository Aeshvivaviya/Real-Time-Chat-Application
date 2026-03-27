export default function RecentActivity() {
  const user = JSON.parse(localStorage.getItem("chatUser") || "{}");
  const name = user?.username || "Aeshvi Vaviya";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent activity</h3>
      <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl shrink-0">
          👋
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-800 leading-snug">
            Welcome to MeetUp Docs, {name}!
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Created by {name}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs text-gray-400">Last viewed 1 hour ago</span>
            <span className="text-xs bg-blue-50 text-[#2D8CFF] px-2 py-0.5 rounded-full font-medium">Docs</span>
          </div>
        </div>
      </div>
    </div>
  );
}
