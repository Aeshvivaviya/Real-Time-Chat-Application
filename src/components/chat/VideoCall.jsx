import { useEffect, useRef } from "react";

const VideoCall = ({ start, onClose }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    let stream;

    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          alert("Use localhost or HTTPS for camera access");
          return;
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera error:", err);
      }
    };

    if (start) {
      startCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [start]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      
      {/* 🎥 VIDEO FULL SCREEN */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />

      {/* 🔴 END CALL BUTTON */}
      <div className="absolute bottom-10 w-full flex justify-center">
        <button
          onClick={onClose}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full text-lg shadow-lg"
        >
          End Call
        </button>
      </div>
    </div>
  );
};

export default VideoCall;