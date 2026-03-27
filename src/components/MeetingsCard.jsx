export default function MeetingsCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Meetings</h3>
        <a href="#" className="text-xs text-[#2D8CFF] hover:underline">Visit Meetings</a>
      </div>
      <div className="flex flex-col items-center justify-center py-6 gap-4">
        <p className="text-sm text-gray-400">No Upcoming Meetings</p>
        <button className="px-4 py-2 text-sm font-medium text-[#2D8CFF] border border-[#2D8CFF] rounded-lg hover:bg-blue-50 transition-colors">
          Test Audio and Video
        </button>
      </div>
    </div>
  );
}
