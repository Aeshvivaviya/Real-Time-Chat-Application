import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function EmailVerify() {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [resent, setResent] = useState(false);
  const inputs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "your email";

  const isComplete = otp.every((d) => d !== "");

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  const handleChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = [...otp];
    pasted.split("").forEach((c, i) => { next[i] = c; });
    setOtp(next);
    inputs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleResend = () => {
    setResent(true);
    setOtp(Array(6).fill(""));
    inputs.current[0]?.focus();
    setTimeout(() => setResent(false), 3000);
  };

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
          <div className="flex-1 bg-gray-100 rounded-2xl p-10 flex items-center justify-center min-h-64">
            <div className="flex flex-col items-center gap-6">
              {/* Monitor */}
              <div className="relative">
                <div className="w-40 h-28 bg-white rounded-xl border-4 border-gray-300 shadow-md flex items-center justify-center">
                  <div className="w-10 h-10 bg-[#2D8CFF] rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0l-9.75 6.75L2.25 6.75" />
                    </svg>
                  </div>
                  {/* Chat bubble */}
                  <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-md px-2 py-1 border border-gray-200">
                    <span className="text-lg">✉️</span>
                  </div>
                </div>
                {/* Monitor stand */}
                <div className="w-8 h-3 bg-gray-300 mx-auto rounded-b" />
                <div className="w-16 h-2 bg-gray-300 mx-auto rounded" />
              </div>
              <p className="text-sm text-gray-500 text-center">Check your inbox for the code</p>
            </div>
          </div>

          {/* Right form */}
          <div className="w-full md:w-96 bg-white rounded-2xl p-8 shadow-md border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Check Your Email For A Code</h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Please enter the verification code sent to{" "}
              <span className="font-medium text-gray-700">{email}</span>
            </p>

            {/* OTP inputs */}
            <div className="flex gap-2 mb-4" onPaste={handlePaste}>
              {otp.map((val, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={val}
                  onChange={(e) => handleChange(e.target.value, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  className="w-full aspect-square text-center text-lg font-bold border-2 border-gray-200 rounded-lg outline-none focus:border-[#2D8CFF] focus:ring-2 focus:ring-blue-100 transition-all"
                />
              ))}
            </div>

            {/* Resend */}
            <p className="text-xs text-gray-400 mb-5">
              Didn't get the code?{" "}
              <button onClick={handleResend} className="text-[#2D8CFF] hover:underline font-medium">
                Resend code
              </button>
              {resent && <span className="text-green-500 ml-2">Sent!</span>}
            </p>

            {/* Verify button */}
            <button
              disabled={!isComplete}
              onClick={() => navigate("/create-account")}
              className="w-full py-3 rounded-lg text-sm font-semibold text-white bg-[#2D8CFF] mb-5 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:bg-blue-600"
            >
              Verify
            </button>

            {/* Email provider buttons */}
            <div className="flex gap-3">
              <a
                href="https://mail.google.com"
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M5.26620003,9.76452941 L5.26620003,14.2260294 L8.45,14.2260294 L8.45,12 C8.45,10.7 9.5,9.65 10.8,9.65 C11.45,9.65 12.05,9.9 12.5,10.3 L14.55,8.25 C13.6,7.4 12.35,6.9 10.8,6.9 C7.75,6.9 5.26620003,9.38379997 5.26620003,9.76452941 Z"/>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Open Gmail
              </a>
              <a
                href="https://outlook.live.com"
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#0078D4">
                  <path d="M24 7.387v10.478L19.2 21V9.196L24 7.387zM0 7.63l8.4 1.993V20.37L0 18.613V7.63zm9.6 2.217L18 7.63v10.983l-8.4 1.757V9.847zM9 3l9.6 2.13L9 7.26 0 5.13 9 3z"/>
                </svg>
                Open Outlook
              </a>
            </div>

            {/* Footer links */}
            <div className="flex justify-center gap-4 mt-6">
              {["Help", "Terms", "Privacy"].map((l) => (
                <a key={l} href="#" className="text-xs text-gray-400 hover:text-[#2D8CFF]">{l}</a>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
