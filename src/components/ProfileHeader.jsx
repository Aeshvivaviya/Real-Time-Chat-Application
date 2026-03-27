export default function ProfileHeader() {
  const user = JSON.parse(localStorage.getItem("chatUser") || "{}");
  const name = user?.username || "Aeshvi Vaviya";
  const firstLetter = name.charAt(0).toUpperCase();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-amber-700 flex items-center justify-center text-white font-bold text-2xl shrink-0">
          {firstLetter}
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">{name}</h2>
          <p className="text-sm text-gray-500">Plan: Workplace Basic</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <a href="#" className="text-sm text-[#2D8CFF] hover:underline">View Plan Details</a>
        <button className="px-4 py-2 text-sm font-medium text-white bg-[#2D8CFF] rounded-lg hover:bg-blue-600 transition-colors">
          Manage Plan
        </button>
      </div>
    </div>
  );
}
