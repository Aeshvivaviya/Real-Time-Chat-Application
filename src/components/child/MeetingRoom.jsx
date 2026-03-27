import React, { useState } from 'react';
import MeetingHeader from './MeetingHeader';
import BottomControls from './BottomControls';
import ParticipantsPanel from './ParticipantsPanel';

const MeetingRoom = () => {
  const [showParticipants, setShowParticipants] = useState(false);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center">
      {/* Video Background */}
      <div className="w-full h-full bg-[#111] flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center mx-auto mb-4 text-white text-3xl font-bold">
            A
          </div>
          <p className="text-gray-400 text-sm">aeshvi vaviya (Host)</p>
        </div>
      </div>

      {/* Header */}
      <MeetingHeader />

      {/* Bottom Controls */}
      <BottomControls onToggleParticipants={() => setShowParticipants(prev => !prev)} />

      {/* Participants Panel */}
      {showParticipants && (
        <ParticipantsPanel onClose={() => setShowParticipants(false)} />
      )}
    </div>
  );
};

export default MeetingRoom;
