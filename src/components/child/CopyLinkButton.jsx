import React, { useState } from 'react';
import { Link2, Check } from 'lucide-react';

const CopyLinkButton = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-2 w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        copied
          ? 'bg-green-600/20 text-green-400'
          : 'bg-white/10 hover:bg-white/20 text-white'
      }`}
    >
      {copied ? <Check size={16} /> : <Link2 size={16} />}
      {copied ? 'Link Copied!' : 'Copy Meeting Link'}
    </button>
  );
};

export default CopyLinkButton;
