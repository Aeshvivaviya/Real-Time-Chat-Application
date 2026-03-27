import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Video } from 'lucide-react';

const HostPopup = ({ onClose }) => {
  const navigate = useNavigate();

  const handleOpenMeeting = () => {
    const meetingId = Date.now().toString();
    onClose();
    navigate(`/meeting/${meetingId}`);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
      <div className="bg-[#1c1c1e] rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Video size={20} className="text-blue-400" />
            <h2 className="text-white font-semibold text-lg">Start a Meeting</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <p className="text-gray-400 text-sm mb-6">
          A new meeting ID will be generated and you'll be taken to the meeting room.
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleOpenMeeting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-200"
          >
            Open Meeting
          </button>
          <button
            onClick={onClose}
            className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 rounded-xl transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default HostPopup;
