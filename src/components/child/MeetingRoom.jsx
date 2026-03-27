import React, { useState, useEffect, useRef } from 'react';
import MeetingHeader from './MeetingHeader';
import BottomControls from './BottomControls';
import ParticipantsPanel from './ParticipantsPanel';

const MeetingRoom = () => {
  const [showParticipants, setShowParticipants] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [audioOn, setAudioOn] = useState(true);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access denied:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const handleToggleVideo = (val) => {
    setVideoOn(val);
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => { track.enabled = val; });
    }
  };

  const handleToggleAudio = (val) => {
    setAudioOn(val);
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => { track.enabled = val; });
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center">
      {/* Live Camera Feed */}
      {videoOn ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
            A
          </div>
          <p className="text-gray-400 text-sm">aeshvi vaviya (Host)</p>
        </div>
      )}

      {/* Header */}
      <MeetingHeader />

      {/* Bottom Controls */}
      <BottomControls
        onToggleParticipants={() => setShowParticipants(prev => !prev)}
        onToggleVideo={handleToggleVideo}
        onToggleAudio={handleToggleAudio}
      />

      {/* Participants Panel */}
      {showParticipants && (
        <ParticipantsPanel onClose={() => setShowParticipants(false)} />
      )}
    </div>
  );
};

export default MeetingRoom;
