import React from 'react';
import { X, Mic, MicOff, MoreHorizontal, UserPlus } from 'lucide-react';
import CopyLinkButton from './CopyLinkButton';

const participants = [
  { id: 1, name: 'aeshvi vaviya (Host, Me)', muted: false },
];

const ParticipantsPanel = ({ onClose }) => {
  const [list, setList] = React.useState(participants);

  const toggleMute = (id) => {
    setList(prev =>
      prev.map(p => p.id === id ? { ...p, muted: !p.muted } : p)
    );
  };

  const muteAll = () => {
    setList(prev => prev.map(p => ({ ...p, muted: true })));
  };

  return (
    <div className="fixed top-0 right-0 h-full w-72 sm:w-80 bg-[#1c1c1e] border-l border-white/10 z-30 flex flex-col shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
        <h2 className="text-white font-semibold text-base">
          Participants ({list.length})
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Participants List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {list.map(p => (
          <div
            key={p.id}
            className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                {p.name[0].toUpperCase()}
              </div>
              <span className="text-white text-sm truncate max-w-[140px]">{p.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => toggleMute(p.id)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                {p.muted
                  ? <MicOff size={15} className="text-red-400" />
                  : <Mic size={15} className="text-gray-400" />
                }
              </button>
              <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100">
                <MoreHorizontal size={15} className="text-gray-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="px-3 py-4 border-t border-white/10 space-y-2">
        <CopyLinkButton />
        <button
          onClick={muteAll}
          className="flex items-center gap-2 w-full px-4 py-2 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20 text-white transition-all duration-200"
        >
          <MicOff size={16} />
          Mute All
        </button>
        <button className="flex items-center gap-2 w-full px-4 py-2 rounded-lg text-sm font-medium bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 transition-all duration-200">
          <UserPlus size={16} />
          Invite
        </button>
      </div>
    </div>
  );
};

export default ParticipantsPanel;
