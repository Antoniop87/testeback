import React, { useState, useRef } from "react";
import io from 'socket.io-client';

const ScreenShare = () => {
  const [stream, setStream] = useState(null);
  const [pc, setPc] = useState(null);
  const videoRef = useRef(null);

  const startScreenShare = async () => {
    const mediaStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });
    setStream(mediaStream);
    videoRef.current.srcObject = mediaStream;
  };

  const stopScreenShare = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      videoRef.current.srcObject = null;
    }
    if (pc) {
      pc.close();
      setPc(null);
    }
  };

  const handleOffer = async (offer) => {
    const newPc = new RTCPeerConnection();
    stream.getTracks().forEach((track) => newPc.addTrack(track, stream));

    newPc.onicecandidate = (event) => {
      if (event.candidate) {
        event.candidate.usernameFragment = null;
        console.log("candidate");
        socket.emit("candidate", event.candidate);
      }
    };

    await newPc.setRemoteDescription(offer);
    const answer = await newPc.createAnswer();
    await newPc.setLocalDescription(answer);
    socket.emit("answer", answer);
    setPc(newPc);
  };

  useEffect(() => {
    const socket = io();
    socket.on("offer", handleOffer);

    socket.on("candidate", async (candidate) => {
      console.log("candidate");
      await pc.addIceCandidate(candidate);
    });

    return () => {
      socket.disconnect();
      stopScreenShare();
    };
  }, []);

  return (
    <div>
      <h1>Screen Share</h1>
      <div>
        <button id="start" onClick={startScreenShare}>
          Start Sharing
        </button>
        <button id="stop" onClick={stopScreenShare}>
          Stop Sharing
        </button>
      </div>
      <video id="video" ref={videoRef} autoPlay></video>
    </div>
  );
};

export default ScreenShare;
