export default function MeetingsCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Meetings</h3>
        <a href="#" className="text-xs text-[#2D8CFF] hover:underline">Visit Meetings</a>
      </div>
      <div className="bg-gray-50 rounded-lg py-4 px-3 flex flex-col items-center gap-3">
        <p className="text-sm text-gray-500">No Upcoming Meetings</p>
        <button className="px-4 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors">
          Test Audio and Video
        </button>
      </div>
    </div>
  );
}
