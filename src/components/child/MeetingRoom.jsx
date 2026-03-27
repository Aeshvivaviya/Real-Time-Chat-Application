import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import MeetingHeader from './MeetingHeader';
import BottomControls from './BottomControls';
import ParticipantsPanel from './ParticipantsPanel';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

const MeetingRoom = () => {
  const { meetingId } = useParams();
  const [showParticipants, setShowParticipants] = useState(false);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [videoOn, setVideoOn] = useState(true);

  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peersRef = useRef({});
  const pendingCandidates = useRef({});  // queue ICE before remoteDesc
  const socketRef = useRef(null);
  const myId = useRef(`u-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);

  const createPeer = useCallback((remoteId, socket, stream) => {
    // Close existing peer if any
    if (peersRef.current[remoteId]) {
      peersRef.current[remoteId].close();
    }

    const peer = new RTCPeerConnection(ICE_SERVERS);

    // Add all local tracks
    stream.getTracks().forEach(track => peer.addTrack(track, stream));

    // Send ICE candidates
    peer.onicecandidate = ({ candidate }) => {
      if (candidate) {
        socket.emit('ice-candidate', {
          roomId: meetingId,
          candidate,
          from: myId.current,
        });
      }
    };

    // Receive remote stream
    peer.ontrack = ({ streams }) => {
      if (!streams[0]) return;
      setRemoteStreams(prev => {
        if (prev.find(s => s.id === remoteId)) return prev;
        return [...prev, { id: remoteId, stream: streams[0] }];
      });
    };

    peer.onconnectionstatechange = () => {
      console.log(`Peer ${remoteId} state: ${peer.connectionState}`);
      if (peer.connectionState === 'failed') {
        peer.restartIce();
      }
    };

    return peer;
  }, [meetingId]);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    const init = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      // Join room AFTER stream is ready
      socket.emit('join-room', meetingId, myId.current);
    };

    // ── Existing user in room → I am the new joiner, wait for their offer ──
    // ── New user joined → I am existing, I send the offer ──
    socket.on('user-joined', async (newUserId) => {
      console.log('user-joined:', newUserId);
      const stream = localStreamRef.current;
      if (!stream) return;

      const peer = createPeer(newUserId, socket, stream);
      peersRef.current[newUserId] = peer;

      const offer = await peer.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
      await peer.setLocalDescription(offer);
      socket.emit('offer', { roomId: meetingId, sdp: peer.localDescription, from: myId.current });
    });

    // Receive offer → send answer
    socket.on('offer', async ({ sdp, from }) => {
      console.log('received offer from:', from);
      const stream = localStreamRef.current;
      if (!stream) return;

      const peer = createPeer(from, socket, stream);
      peersRef.current[from] = peer;

      await peer.setRemoteDescription(new RTCSessionDescription(sdp));

      // Flush queued ICE candidates
      const queued = pendingCandidates.current[from] || [];
      for (const c of queued) {
        await peer.addIceCandidate(new RTCIceCandidate(c)).catch(console.error);
      }
      delete pendingCandidates.current[from];

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socket.emit('answer', { roomId: meetingId, sdp: peer.localDescription, from: myId.current });
    });

    // Receive answer
    socket.on('answer', async ({ sdp, from }) => {
      console.log('received answer from:', from);
      const peer = peersRef.current[from];
      if (!peer) return;

      await peer.setRemoteDescription(new RTCSessionDescription(sdp));

      // Flush queued ICE candidates
      const queued = pendingCandidates.current[from] || [];
      for (const c of queued) {
        await peer.addIceCandidate(new RTCIceCandidate(c)).catch(console.error);
      }
      delete pendingCandidates.current[from];
    });

    // ICE candidates — queue if remoteDescription not set yet
    socket.on('ice-candidate', ({ candidate, from }) => {
      const peer = peersRef.current[from];
      if (peer && peer.remoteDescription) {
        peer.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
      } else {
        if (!pendingCandidates.current[from]) pendingCandidates.current[from] = [];
        pendingCandidates.current[from].push(candidate);
      }
    });

    socket.on('user-left', (leftId) => {
      peersRef.current[leftId]?.close();
      delete peersRef.current[leftId];
      setRemoteStreams(prev => prev.filter(s => s.id !== leftId));
    });

    // 2-user call: other person ended → redirect everyone to dashboard
    socket.on('call-ended', () => {
      Object.values(peersRef.current).forEach(p => p.close());
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      socket.disconnect();
      window.location.href = '/dashboard';
    });

    init().catch(console.error);

    return () => {
      socket.emit('user-left', meetingId);
      Object.values(peersRef.current).forEach(p => p.close());
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      socket.disconnect();
    };
  }, [meetingId, createPeer]);

  const handleToggleVideo = (val) => {
    setVideoOn(val);
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = val; });
  };

  const handleToggleAudio = (val) => {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = val; });
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">

      {/* Remote videos */}
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

      {/* Local PiP */}
      <div className="absolute bottom-20 right-4 w-36 sm:w-48 aspect-video rounded-xl overflow-hidden border-2 border-white/20 shadow-xl z-20 bg-black">
        {videoOn
          ? <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center bg-gray-800"><span className="text-white text-xs">Cam off</span></div>
        }
        <span className="absolute bottom-1 left-1 text-white text-[10px] bg-black/60 px-1.5 py-0.5 rounded">You</span>
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

const RemoteVideo = ({ stream }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && stream) ref.current.srcObject = stream;
  }, [stream]);
  return <video ref={ref} autoPlay playsInline className="w-full h-full object-cover bg-black" />;
};

export default MeetingRoom;
