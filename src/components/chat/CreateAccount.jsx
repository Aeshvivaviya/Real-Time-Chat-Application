import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateAccount() {
  const [form, setForm] = useState({ firstName: "", lastName: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [isEducator, setIsEducator] = useState(false);
  const [ageGroups, setAgeGroups] = useState([]);
  const navigate = useNavigate();

  const isValid = form.firstName.trim() && form.lastName.trim() && form.password.length >= 6;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const toggleAge = (val) => {
    setAgeGroups((p) => p.includes(val) ? p.filter((a) => a !== val) : [...p, val]);
  };

  const handleSubmit = () => {
    const newErrors = {};
    if (!form.firstName.trim()) newErrors.firstName = "Please enter your first name";
    if (!form.lastName.trim()) newErrors.lastName = "Please enter your last name";
    if (form.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
    navigate("/login");
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
          <div className="flex-1 bg-gray-100 rounded-2xl p-10 flex items-center justify-center min-h-72 relative overflow-hidden">
            {/* Background shapes */}
            <div className="absolute top-6 left-6 w-32 h-32 bg-blue-100 rounded-2xl opacity-50 rotate-12" />
            <div className="absolute bottom-6 right-6 w-24 h-24 bg-purple-100 rounded-2xl opacity-50 -rotate-12" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-green-50 rounded-full opacity-40" />
            {/* People */}
            <div className="relative flex items-end gap-4 z-10">
              {[
                { bg: "bg-blue-400", h: "h-20", head: "bg-orange-300" },
                { bg: "bg-purple-400", h: "h-24", head: "bg-yellow-300" },
                { bg: "bg-green-400", h: "h-20", head: "bg-pink-300" },
              ].map((p, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 ${p.head} rounded-full border-2 border-white shadow`} />
                  <div className={`w-10 ${p.h} ${p.bg} rounded-t-xl shadow-md`} />
                </div>
              ))}
            </div>
          </div>

          {/* Right form */}
          <div className="w-full md:w-96 bg-white rounded-2xl p-8 shadow-md border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Your Account</h2>
            <p className="text-sm text-gray-500 mb-6">Enter your full name and password.</p>

            <div className="flex flex-col gap-4">
              {/* First Name */}
              <div>
                <input
                  name="firstName"
                  placeholder="First Name"
                  value={form.firstName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg text-sm outline-none transition-all placeholder-gray-400 ${errors.firstName ? "border-red-400 focus:border-red-400" : "border-gray-300 focus:border-[#2D8CFF] focus:ring-2 focus:ring-blue-100"}`}
                />
                {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
              </div>

              {/* Last Name */}
              <div>
                <input
                  name="lastName"
                  placeholder="Last Name"
                  value={form.lastName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg text-sm outline-none transition-all placeholder-gray-400 ${errors.lastName ? "border-red-400 focus:border-red-400" : "border-gray-300 focus:border-[#2D8CFF] focus:ring-2 focus:ring-blue-100"}`}
                />
                {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
              </div>

              {/* Password */}
              <div className="relative">
                <input
                  name="password"
                  type={showPass ? "text" : "password"}
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pr-10 border rounded-lg text-sm outline-none transition-all placeholder-gray-400 ${errors.password ? "border-red-400 focus:border-red-400" : "border-gray-300 focus:border-[#2D8CFF] focus:ring-2 focus:ring-blue-100"}`}
                />
                <button type="button" onClick={() => setShowPass((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              </div>

              {/* Educator checkbox */}
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={isEducator} onChange={(e) => setIsEducator(e.target.checked)} className="mt-0.5 accent-[#2D8CFF]" />
                <span className="text-xs text-gray-500 leading-relaxed">
                  For Educators: Check here if you are signing up on behalf of a school or other organization that provides educational services to children under the age of 18
                </span>
              </label>

              {/* Age groups */}
              {isEducator && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-medium text-gray-700 mb-3">What age group does the organization provide services for (select all that apply)?</p>
                  {["Under 13", "13 to 15", "16 to 17"].map((age) => (
                    <label key={age} className="flex items-center gap-2 mb-2 cursor-pointer">
                      <input type="checkbox" checked={ageGroups.includes(age)} onChange={() => toggleAge(age)} className="accent-[#2D8CFF]" />
                      <span className="text-sm text-gray-600">{age}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Continue button */}
              <button
                onClick={handleSubmit}
                disabled={!isValid}
                className="w-full py-3 rounded-lg text-sm font-semibold text-white bg-[#2D8CFF] transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:bg-blue-600"
              >
                Continue
              </button>
            </div>
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
