const footerLinks = {
  "About": ["About MeetUp", "Newsroom", "Blog", "Customers", "Our Team", "Careers", "Integrations", "Partners", "Investors", "Press"],
  "Products": ["MeetUp One", "Meetings & Chat", "MeetUp Phone", "MeetUp Rooms", "Webinars", "MeetUp Events", "Contact Center", "Virtual Agent", "Revenue Accelerator"],
  "Solutions": ["Education", "Financial Services", "Government", "Healthcare", "Manufacturing", "Retail", "Small Business", "Enterprise"],
  "Resources": ["Resource Library", "Blog", "Webinars", "MeetUp Trust Center", "Accessibility", "Support", "Privacy", "Legal & Compliance"],
};

export default function Footer() {
  return (
    <footer className="bg-[#0B1B3F] text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* Links grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-white text-sm font-semibold mb-3">{section}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-xs text-gray-400 hover:text-white transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Logo + copyright */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-[#2D8CFF] rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z"/>
              </svg>
            </div>
            <span className="text-sm text-gray-400">© {new Date().getFullYear()} MeetUp. All rights reserved.</span>
          </div>

          {/* Bottom links */}
          <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-400">
            {["Privacy Policy", "Terms of Service", "Cookie Preferences", "Accessibility"].map((item) => (
              <a key={item} href="#" className="hover:text-white transition-colors">{item}</a>
            ))}
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-3">
            {[
              { label: "Twitter", path: "M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0012 7v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" },
              { label: "LinkedIn", path: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z" },
              { label: "Facebook", path: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" },
            ].map(({ label, path }) => (
              <a key={label} href="#" aria-label={label} className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d={path} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
