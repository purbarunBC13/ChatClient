import IncomingCallNotification from "@/components/incoming-call-notification";
import { useAppStore } from "@/store";
import { HOST } from "@/utils/constants";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useToast } from "@/components/hooks/use-toast";
import notificationSound from "@/assets/beltekpar.mp3";
const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const { toast } = useToast();

  const socket = useRef();
  const { userInfo, setCallRoom } = useAppStore();
  const [incomingCall, setIncomingCall] = useState(null); // State for incoming call
  const [typingRoomId, setTypingRoomId] = useState({
    recipientId: null,
    senderId: null,
  });
  const [isTyping, setIsTyping] = useState(false); // State to track if the user is typing
  const audioRef = useRef(new Audio(notificationSound));

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
        if (audioRef.current) {
          audioRef.current.loop = true;
          audioRef.current.play().catch((err) => {
            console.error("Error playing sound:", err);
          });
        }

        setIncomingCall({ room, caller: userIdentity });
      });

      // Listen for incoming channel call
      socket.current.on(
        "receiveChannelCallRequest",
        ({ channelId, userIdentity }) => {
          console.log(
            `Incoming call from ${userIdentity} in channel ${channelId}`
          );
          if (audioRef.current) {
            audioRef.current.loop = true;
            audioRef.current.play().catch((err) => {
              console.error("Error playing sound:", err);
            });
          }

          setIncomingCall({ room: channelId, caller: userIdentity });
        }
      );

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
        const {
          selectedChatData,
          selectedChatType,
          addMessage,
          setSelectedChatData,
          setSelectedChatType,
          addContactsInDMContacts,
        } = useAppStore.getState();
        console.log("message", message);
        if (
          selectedChatType !== undefined &&
          (selectedChatData._id === message.sender._id ||
            selectedChatData._id === message.recipient._id)
        ) {
          addMessage(message);
        }
        addContactsInDMContacts(message);
        if (userInfo.id !== message.sender._id) {
          if (message.messageType === "file") {
            toast({
              title: `${message.sender.firstName} ${message.sender.lastName}`,
              description: "Sent a file",
              duration: 3000,
            });
          } else {
            toast({
              title: `${message.sender.firstName} ${message.sender.lastName}`,
              description: message.content,
              duration: 3000,
            });
          }
        }
      };

      const handleReceiveChannelMessage = (message) => {
        const {
          selectedChatData,
          selectedChatType,
          addMessage,
          addChanneInChannelList,
        } = useAppStore.getState();
        console.log("message", message);
        if (
          selectedChatType !== undefined &&
          selectedChatData._id === message.channelId
        ) {
          addMessage(message);
        }
        addChanneInChannelList(message);
        if (userInfo.id !== message.sender._id)
          if (message.messageType === "file") {
            toast({
              title: `Channel ${message.channelName}: ${message.sender.firstName} ${message.sender.lastName}`,
              description: "Sent a file",
              duration: 3000,
            });
          } else {
            toast({
              title: `Channel ${message.channelName}: ${message.sender.firstName} ${message.sender.lastName}`,
              description: message.content,
              duration: 3000,
            });
          }
      };

      socket.current.on("typing", ({ recipientId, senderId }) => {
        console.log(`User is typing in room: ${recipientId}`);
        setTypingRoomId({
          recipientId,
          senderId,
        });
        setIsTyping(true);
      });

      socket.current.on("stop typing", ({ recipientId, senderId }) => {
        console.log(`User stopped typing in room: ${recipientId}`);
        setTypingRoomId({
          recipientId: null,
          senderId: null,
        });
        setIsTyping(false);
      });

      socket.current.on("receiveMessage", handleReceiveMessage);
      socket.current.on("recieve-channel-message", handleReceiveChannelMessage);
      socket.current.on("eventScheduled", ({ message, dateTime }) => {
        toast({
          title: "Event Scheduled",
          description: `📅 ${message} at ${new Date(
            dateTime
          ).toLocaleString()}`,
          duration: 5000,
        });
      });

      // Listen to future reminders
      socket.current.on("reminder", ({ message, time }) => {
        toast({
          title: "Reminder",
          description: `⏰ ${message} at ${new Date(time).toLocaleString()}`,
          duration: 5000,
        });
      });

      return () => {
        socket.current.disconnect();
      };
    }
  }, [userInfo]);

  const stopNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.pause(); // Stop playback
      audioRef.current.currentTime = 0; // Reset playback position
    }
  };
  // Function to emit a call rejection
  const rejectCall = (room) => {
    if (socket.current) {
      stopNotificationSound();
      socket.current.emit("rejectCall", { room });
      setIncomingCall(null); // Clear the call notification
    }
  };

  // Function to emit a call acceptance
  const acceptCall = () => {
    if (socket.current && incomingCall?.room) {
      socket.current.emit("acceptCall", { room: incomingCall.room });
      stopNotificationSound();

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
        typingRoomId,
        isTyping,
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
