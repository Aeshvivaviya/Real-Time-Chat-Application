import { useNavigate } from "react-router-dom";

export default function OneMoreThing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 md:px-10 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#2D8CFF] rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z"/>
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900">Meet<span className="text-[#2D8CFF]">Up</span></span>
        </div>
        <nav className="flex items-center gap-4 md:gap-6">
          <span className="text-sm text-gray-500 hidden md:block">
            Already have an account?{" "}
            <a href="/login" className="text-[#2D8CFF] font-medium hover:underline">Sign In</a>
          </span>
          <a href="#" className="text-sm text-gray-600 hover:text-[#2D8CFF] font-medium">Support</a>
          <select className="text-sm border border-gray-300 rounded-md px-2 py-1 text-gray-600 outline-none focus:border-[#2D8CFF]">
            <option>English</option>
            <option>Hindi</option>
          </select>
        </nav>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="flex flex-col md:flex-row gap-10 w-full max-w-4xl items-center">

          {/* Left illustration */}
          <div className="flex-1 bg-[#F7F8FA] rounded-2xl p-10 flex items-center justify-center min-h-72 relative overflow-hidden">
            <div className="absolute top-4 left-4 w-28 h-28 bg-blue-100 rounded-2xl opacity-40 rotate-6" />
            <div className="absolute bottom-4 right-4 w-20 h-20 bg-purple-100 rounded-2xl opacity-40 -rotate-6" />

            <div className="relative z-10 flex items-end gap-6">
              {/* Whiteboard */}
              <div className="w-32 h-24 bg-white border-2 border-gray-300 rounded-lg shadow-md flex flex-col items-center justify-center gap-1 p-2">
                <div className="flex gap-2 items-end">
                  <div className="w-6 h-8 bg-blue-200 rounded-sm" />
                  <div className="w-6 h-12 bg-green-200 rounded-sm" />
                  <div className="w-6 h-6 bg-yellow-200 rounded-sm" />
                </div>
                {/* Triangle */}
                <svg width="28" height="18" viewBox="0 0 28 18">
                  <polygon points="14,2 26,16 2,16" fill="none" stroke="#2D8CFF" strokeWidth="2" />
                </svg>
              </div>

              {/* Teacher */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 bg-orange-300 rounded-full border-2 border-white shadow" />
                <div className="w-10 h-20 bg-blue-400 rounded-t-xl shadow-md" />
                {/* Pointer arm */}
                <div className="absolute ml-8 -mt-10 w-8 h-1.5 bg-blue-300 rounded-full rotate-[-30deg]" />
              </div>

              {/* Student */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-7 h-7 bg-yellow-300 rounded-full border-2 border-white shadow" />
                <div className="w-9 h-14 bg-purple-400 rounded-t-xl shadow-md" />
                {/* Desk */}
                <div className="w-14 h-2 bg-gray-300 rounded-full -mt-1" />
              </div>
            </div>
          </div>

          {/* Right content */}
          <div className="w-full md:w-96 bg-white rounded-2xl p-8 shadow-md border border-gray-100 flex flex-col items-center text-center gap-6">
            <h2 className="text-2xl font-bold text-gray-900">One More Thing</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              As a school or other organization that provides educational services to children, you must provide additional information to continue using MeetUp services.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full py-3 rounded-lg text-sm font-semibold text-white bg-[#2D8CFF] hover:bg-blue-600 active:bg-blue-700 transition-colors duration-200"
            >
              Continue
            </button>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 flex justify-center">
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          Protected by MeetUp Security
        </div>
      </footer>
    </div>
  );
}
