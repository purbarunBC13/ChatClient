import {
  ControlBar,
  GridLayout,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
} from "@livekit/components-react";

import "@livekit/components-styles";
import { Track } from "livekit-client";
import { useEffect, useState } from "react";
import { useAppStore } from "@/store";
import { apiClient } from "@/lib/api-client";
import { LoaderChat, LoaderPage } from "@/components/Loader";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useSocket } from "@/context/SocketContext";

const serverUrl = import.meta.env.VITE_LIVEKIT_SERVER_URL;

export default function App() {
  const [isJoined, setIsJoined] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [identity, setIdentity] = useState("");
  const [currentToken, setCurrentToken] = useState("");
  const [isReceivingCall, setIsReceivingCall] = useState(false); // Track if receiving a call
  const [callRoom, setCallRoom] = useState(null);
  const { selectedChatData, userInfo, selectedChatType } = useAppStore();
  const navigate = useNavigate();
  const { socket } = useSocket();

  useEffect(() => {
    if (selectedChatData?._id && !isReceivingCall) {
      const room = selectedChatData._id;
      localStorage.setItem("callRoom", room);
      const userIdentity = userInfo.firstName;
      setRoomName(localStorage.getItem("callRoom"));
      setIdentity(userIdentity);
      handleJoin(room, userIdentity);

      if (selectedChatType === "contact") {
        // Notify the recipient about the call
        socket.emit("sendCallRequest", { room, userIdentity });
      } else if (selectedChatType === "channel") {
        // Notify the channel members about the call
        socket.emit("sendChannelCallRequest", {
          channelId: room,
          userId: userInfo.id,
          userIdentity,
        });
      }
    }
  }, [selectedChatData]);

  useEffect(() => {
    if (!callRoom) {
      // Retrieve the room from localStorage if not available in the state
      const savedCallRoom = localStorage.getItem("callRoom");
      if (savedCallRoom) {
        setCallRoom(savedCallRoom);
      }
    }
  }, [callRoom, setCallRoom]);

  useEffect(() => {
    console.log("Call room:", callRoom);
    if (callRoom) {
      setIsReceivingCall(true);
      handleJoin(callRoom, userInfo.firstName);
    }
  }, [callRoom]);

  const handleJoin = async (room, userIdentity) => {
    try {
      // Fetch token from the backend
      const response = await apiClient.get(
        `/token?room=${room}&identity=${userIdentity}`,
        {
          withCredentials: true,
        }
      );
      setCurrentToken(response.data); // Store the token
      setIsJoined(true); // Mark as joined
    } catch (error) {
      console.error("Error fetching token:", error);
      toast.error("Failed to join the room. Please try again.");
    }
  };

  const handleLeave = () => {
    setIsJoined(false);
    setRoomName("");
    localStorage.removeItem("callRoom");
    navigate("/chat");
  };

  return (
    <div className="h-screen">
      {!isJoined ? (
        <div className="flex flex-col justify-center items-center h-screen">
          <div className="size-60">
            <LoaderPage />
          </div>
          <div className="font-medium text-blue-600 text-2xl capitalize">
            Joining room, please wait...
          </div>
        </div>
      ) : (
        <LiveKitRoom
          video={true}
          audio={true}
          token={currentToken}
          serverUrl={serverUrl}
          data-lk-theme="default"
          onDisconnected={handleLeave}
          style={{ height: "100vh" }}
        >
          <MyVideoConference />
          <RoomAudioRenderer />
          <ControlBar />
        </LiveKitRoom>
      )}
    </div>
  );
}

function MyVideoConference() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  return (
    <GridLayout
      tracks={tracks}
      style={{ height: "calc(100vh - var(--lk-control-bar-height))" }}
    >
      <ParticipantTile />
    </GridLayout>
  );
}
