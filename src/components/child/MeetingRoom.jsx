import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import MeetingHeader from './MeetingHeader';
import BottomControls from './BottomControls';
import ParticipantsPanel from './ParticipantsPanel';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

const MeetingRoom = () => {
  const { meetingId } = useParams();
  const [showParticipants, setShowParticipants] = useState(false);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [videoOn, setVideoOn] = useState(true);

  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peersRef = useRef({});       // { userId: RTCPeerConnection }
  const socketRef = useRef(null);
  const userId = useRef(`user-${Date.now()}`);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL);
    socketRef.current = socket;

    const init = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      socket.emit('join-room', meetingId, userId.current);
    };

    init().catch(console.error);

    // New user joined → we create offer
    socket.on('user-joined', async (newUserId) => {
      const peer = createPeer(newUserId, socket);
      peersRef.current[newUserId] = peer;

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      socket.emit('offer', { roomId: meetingId, sdp: offer, from: userId.current, to: newUserId });
    });

    // Receive offer → send answer
    socket.on('offer', async ({ sdp, from }) => {
      const peer = createPeer(from, socket);
      peersRef.current[from] = peer;

      await peer.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socket.emit('answer', { roomId: meetingId, sdp: answer, from: userId.current, to: from });
    });

    // Receive answer
    socket.on('answer', async ({ sdp, from }) => {
      const peer = peersRef.current[from];
      if (peer) await peer.setRemoteDescription(new RTCSessionDescription(sdp));
    });

    // ICE candidates
    socket.on('ice-candidate', ({ candidate, from }) => {
      const peer = peersRef.current[from];
      if (peer && candidate) peer.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
    });

    // User left
    socket.on('user-left', (leftId) => {
      if (peersRef.current[leftId]) {
        peersRef.current[leftId].close();
        delete peersRef.current[leftId];
      }
      setRemoteStreams(prev => prev.filter(s => s.id !== leftId));
    });

    return () => {
      Object.values(peersRef.current).forEach(p => p.close());
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      socket.disconnect();
    };
  }, [meetingId]);

  const createPeer = (remoteId, socket) => {
    const peer = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks
    localStreamRef.current?.getTracks().forEach(track => {
      peer.addTrack(track, localStreamRef.current);
    });

    // ICE candidate
    peer.onicecandidate = ({ candidate }) => {
      if (candidate) {
        socket.emit('ice-candidate', { roomId: meetingId, candidate, from: userId.current, to: remoteId });
      }
    };

    // Remote stream
    peer.ontrack = ({ streams }) => {
      setRemoteStreams(prev => {
        const exists = prev.find(s => s.id === remoteId);
        if (exists) return prev;
        return [...prev, { id: remoteId, stream: streams[0] }];
      });
    };

    return peer;
  };

  const handleToggleVideo = (val) => {
    setVideoOn(val);
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = val; });
  };

  const handleToggleAudio = (val) => {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = val; });
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">

      {/* Remote videos grid */}
      {remoteStreams.length === 0 ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center mx-auto mb-3 text-white text-3xl font-bold">A</div>
            <p className="text-gray-400 text-sm">Waiting for others to join...</p>
          </div>
        </div>
      ) : (
        <div className={`w-full h-full grid gap-1 ${remoteStreams.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {remoteStreams.map(({ id, stream }) => (
            <RemoteVideo key={id} stream={stream} />
          ))}
        </div>
      )}

      {/* Local video — small pip */}
      <div className="absolute bottom-20 right-4 w-32 sm:w-44 aspect-video rounded-xl overflow-hidden border-2 border-white/20 shadow-lg z-20 bg-black">
        {videoOn ? (
          <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <span className="text-white text-xs">Cam off</span>
          </div>
        )}
        <span className="absolute bottom-1 left-1 text-white text-[10px] bg-black/50 px-1 rounded">You</span>
      </div>

      <MeetingHeader />
      <BottomControls
        onToggleParticipants={() => setShowParticipants(p => !p)}
        onToggleVideo={handleToggleVideo}
        onToggleAudio={handleToggleAudio}
      />
      {showParticipants && <ParticipantsPanel onClose={() => setShowParticipants(false)} />}
    </div>
  );
};

// Separate component to attach stream via ref
const RemoteVideo = ({ stream }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, [stream]);
  return <video ref={ref} autoPlay playsInline className="w-full h-full object-cover bg-black" />;
};

export default MeetingRoom;
