import React from 'react';
import { Video } from 'lucide-react';

const HostButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-blue-500/30 text-sm sm:text-base"
    >
      <Video size={20} />
      Host Meeting
    </button>
  );
};

export default HostButton;
