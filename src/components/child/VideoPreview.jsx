import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, ChevronDown } from 'lucide-react';

const VideoPreview = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const [audioOn, setAudioOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);

  const handleStart = () => {
    navigate(`/meeting/${meetingId}/room`);
  };

  return (
    <div className="min-h-screen bg-[#111] flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <h1 className="text-white text-2xl font-semibold text-center mb-6">
          Ready to join?
        </h1>

        {/* Video Preview Box */}
        <div className="relative bg-black rounded-2xl overflow-hidden aspect-video mb-6 flex items-center justify-center border border-white/10">
          {videoOn ? (
            <div className="text-gray-500 text-sm">Camera preview</div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
                <VideoOff size={28} className="text-gray-400" />
              </div>
              <span className="text-gray-400 text-sm">Camera is off</span>
            </div>
          )}

          {/* Controls overlay */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
            <button
              onClick={() => setAudioOn(!audioOn)}
              className={`p-3 rounded-full transition-all ${audioOn ? 'bg-white/20 hover:bg-white/30' : 'bg-red-600 hover:bg-red-700'}`}
            >
              {audioOn ? <Mic size={18} className="text-white" /> : <MicOff size={18} className="text-white" />}
            </button>
            <button
              onClick={() => setVideoOn(!videoOn)}
              className={`p-3 rounded-full transition-all ${videoOn ? 'bg-white/20 hover:bg-white/30' : 'bg-red-600 hover:bg-red-700'}`}
            >
              {videoOn ? <Video size={18} className="text-white" /> : <VideoOff size={18} className="text-white" />}
            </button>
          </div>
        </div>

        {/* Device Selector */}
        <div className="relative mb-6">
          <select className="w-full bg-[#2a2a2e] text-white text-sm px-4 py-3 rounded-xl border border-white/10 appearance-none cursor-pointer focus:outline-none focus:border-blue-500">
            <option>Default Microphone</option>
            <option>Default Speaker</option>
            <option>Default Camera</option>
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        {/* Meeting ID */}
        <p className="text-gray-500 text-xs text-center mb-4">
          Meeting ID: <span className="text-gray-300">{meetingId}</span>
        </p>

        {/* Start Button */}
        <button
          onClick={handleStart}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 text-base"
        >
          Start Meeting
        </button>
      </div>
    </div>
  );
};

export default VideoPreview;
