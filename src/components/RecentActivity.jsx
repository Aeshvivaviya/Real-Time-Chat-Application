export default function RecentActivity() {
  const user = JSON.parse(localStorage.getItem("chatUser") || "{}");
  const name = user?.username || "aeshvi vaviya";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent activity</h3>
      <div className="border border-gray-100 rounded-xl p-3 hover:bg-gray-50 transition-colors cursor-pointer relative">
        {/* Three dots */}
        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
          </svg>
        </button>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-xl shrink-0">
            👋
          </div>
          <div className="min-w-0 flex-1 pr-4">
            <p className="text-sm font-medium text-[#2D8CFF] leading-snug">
              Welcome to MeetUp Docs, {name}!
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Created by {name}</p>
            <p className="text-xs text-gray-400 mt-0.5">Last viewed 1 hour ago</p>
          </div>
        </div>

        {/* Docs tag */}
        <div className="flex justify-end mt-2">
          <span className="text-xs border border-pink-300 text-pink-500 px-2 py-0.5 rounded-full">Docs</span>
        </div>
      </div>
    </div>
  );
}
