import React, { useState } from 'react';
import HostButton from '../components/child/HostButton';
import HostPopup from '../components/child/HostPopup';

const NewMeetingPage = () => {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div className="min-h-screen bg-[#111] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-white text-3xl sm:text-4xl font-bold mb-3">
          Video Meetings
        </h1>
        <p className="text-gray-400 text-sm sm:text-base mb-8 max-w-sm mx-auto">
          Start or join a meeting with one click. No downloads required.
        </p>
        <HostButton onClick={() => setShowPopup(true)} />
      </div>

      {showPopup && <HostPopup onClose={() => setShowPopup(false)} />}
    </div>
  );
};

export default NewMeetingPage;
