import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic, MicOff, Video, VideoOff, Users, MessageSquare,
  ScreenShare, MoreHorizontal, PhoneOff
} from 'lucide-react';

const BottomControls = ({ onToggleParticipants, onToggleChat, onToggleVideo, onToggleAudio, onEndCall }) => {
  const navigate = useNavigate();
  const [audio, setAudio] = useState(true);
  const [video, setVideo] = useState(true);

  const handleToggleAudio = () => {
    const next = !audio;
    setAudio(next);
    onToggleAudio?.(next);
  };

  const handleToggleVideo = () => {
    const next = !video;
    setVideo(next);
    onToggleVideo?.(next);
  };

  const handleEnd = () => {
    if (onEndCall) {
      onEndCall();
    } else {
      navigate('/dashboard');
    }
  };

  const ControlBtn = ({ icon, label, onClick, danger, active }) => (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 px-2 sm:px-3 py-2 rounded-xl transition-all duration-200 min-w-[48px]
        ${danger
          ? 'bg-red-600 hover:bg-red-700 text-white'
          : active === false
            ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400'
            : 'hover:bg-white/10 text-white'
        }`}
    >
      {icon}
      <span className="text-[10px] sm:text-xs text-gray-300 hidden sm:block">{label}</span>
    </button>
  );

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-4 z-10">
      <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
        <ControlBtn
          icon={audio ? <Mic size={20} /> : <MicOff size={20} />}
          label={audio ? 'Mute' : 'Unmute'}
          onClick={handleToggleAudio}
          active={audio}
        />
        <ControlBtn
          icon={video ? <Video size={20} /> : <VideoOff size={20} />}
          label={video ? 'Stop Video' : 'Start Video'}
          onClick={handleToggleVideo}
          active={video}
        />
        <ControlBtn
          icon={<Users size={20} />}
          label="Participants"
          onClick={onToggleParticipants}
        />
        <ControlBtn
          icon={<MessageSquare size={20} />}
          label="Chat"
          onClick={onToggleChat}
        />
        <ControlBtn
          icon={<ScreenShare size={20} />}
          label="Share"
          onClick={() => {}}
        />
        <ControlBtn
          icon={<MoreHorizontal size={20} />}
          label="More"
          onClick={() => {}}
        />
        <ControlBtn
          icon={<PhoneOff size={20} />}
          label="End"
          onClick={handleEnd}
          danger
        />
      </div>
    </div>
  );
};

export default BottomControls;
