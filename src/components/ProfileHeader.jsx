export default function ProfileHeader() {
  const user = JSON.parse(localStorage.getItem("chatUser") || "{}");
  const name = user?.username || "aeshvi vaviya";
  const firstLetter = name.charAt(0).toUpperCase();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-amber-700 flex items-center justify-center text-white font-bold text-xl shrink-0">
          {firstLetter}
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">{name}</h2>
          <p className="text-xs text-gray-500">Plan: <span className="font-medium">Workplace Basic</span></p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <button className="px-4 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
          Manage Plan
        </button>
        <a href="#" className="text-xs text-[#2D8CFF] hover:underline">View Plan Details</a>
      </div>
    </div>
  );
}
