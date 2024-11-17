import IncomingCallNotification from "@/components/incoming-call-notification";
import { useAppStore } from "@/store";
import { HOST } from "@/utils/constants";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const socket = useRef();
  const { userInfo, setCallRoom } = useAppStore();
  const [incomingCall, setIncomingCall] = useState(null); // State for incoming call

  useEffect(() => {
    if (userInfo) {
      socket.current = io(HOST, {
        withCredentials: true,
        query: {
          userId: userInfo.id,
        },
      });

      socket.current.on("connect", () => {
        console.log("connected to socket server");
      });

      // Listen for incoming call
      socket.current.on("receiveCallRequest", ({ room, userIdentity }) => {
        console.log(`Incoming call from ${userIdentity} in room ${room}`);
        setIncomingCall({ room, caller: userIdentity });
      });

      // Handle call rejection
      socket.current.on("callRejected", ({ room }) => {
        console.log(`Call to room ${room} was rejected`);
        setIncomingCall(null); // Clear the call notification
      });

      // Handle call acceptance
      socket.current.on("callAccepted", ({ room }) => {
        console.log(`Call to room ${room} was accepted`);
        setCallRoom({ room });
        setIncomingCall(null); // Clear the call notification
      });

      const handleReceiveMessage = (message) => {
        const { selectedChatData, selectedChatType, addMessage } =
          useAppStore.getState();

        if (
          selectedChatType !== undefined &&
          (selectedChatData._id === message.sender._id ||
            selectedChatData._id === message.recipient._id)
        ) {
          addMessage(message);
        }
      };

      const handleReceiveChannelMessage = (message) => {
        const { selectedChatData, selectedChatType, addMessage } =
          useAppStore.getState();

        if (
          selectedChatType !== undefined &&
          selectedChatData._id === message.channelId
        ) {
          addMessage(message);
        }
      };

      socket.current.on("receiveMessage", handleReceiveMessage);
      socket.current.on("recieve-channel-message", handleReceiveChannelMessage);

      return () => {
        socket.current.disconnect();
      };
    }
  }, [userInfo]);

  // Function to emit a call rejection
  const rejectCall = (room) => {
    if (socket.current) {
      socket.current.emit("rejectCall", { room });
      setIncomingCall(null); // Clear the call notification
    }
  };

  // Function to emit a call acceptance
  const acceptCall = () => {
    if (socket.current && incomingCall?.room) {
      socket.current.emit("acceptCall", { room: incomingCall.room });

      // Store the room in global state
      setCallRoom(incomingCall.room);

      // Persist callRoom to localStorage
      localStorage.setItem("callRoom", incomingCall.room);

      setIncomingCall(null); // Clear the incoming call notification

      // Redirect to the video call page
      window.location.href = "/videoCall";
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socket.current,
        rejectCall,
        acceptCall,
      }}
    >
      {children}
      {/* Render Notification Component */}
      {incomingCall && (
        <IncomingCallNotification
          incomingCall={incomingCall}
          acceptCall={acceptCall}
          rejectCall={rejectCall}
        />
      )}
    </SocketContext.Provider>
  );
};
