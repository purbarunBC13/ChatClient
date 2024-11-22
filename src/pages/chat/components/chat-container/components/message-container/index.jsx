import { apiClient } from "@/lib/api-client";
import { useAppStore } from "@/store";
import {
  GET_ALL_MESSAGES_ROUTE,
  GET_CHANNEL_MESSAGES_ROUTE,
  HOST,
} from "@/utils/constants";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { MdFolderZip } from "react-icons/md";
import { IoMdArrowRoundDown } from "react-icons/io";
import { IoCloseSharp } from "react-icons/io5";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getColor } from "@/lib/utils";
import { LoaderChat } from "@/components/Loader";
const MessageContainer = () => {
  const scrollRef = useRef();
  const {
    selectedChatType,
    selectedChatData,
    selectedChatMessages,
    setSelectedChatMessages,
    userInfo,
  } = useAppStore();

  const [showImage, setShowImage] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getMessages = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.post(
          GET_ALL_MESSAGES_ROUTE,
          {
            id: selectedChatData._id,
          },
          {
            withCredentials: true,
          }
        );
        // console.log(response);
        if (response.data) {
          setSelectedChatMessages(response.data);
          setIsLoading(false);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };

    const getChannelMessages = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get(
          `${GET_CHANNEL_MESSAGES_ROUTE}/${selectedChatData._id}`,
          {
            withCredentials: true,
          }
        );
        if (response.data.messages) {
          // console.log(response.data.messages);
          setSelectedChatMessages(response.data.messages);
          setIsLoading(false);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    if (selectedChatData._id) {
      if (selectedChatType === "contact") {
        getMessages();
      } else if (selectedChatType === "channel") {
        getChannelMessages();
      }
    }
  }, [selectedChatData, selectedChatType, setSelectedChatMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChatMessages]);

  const checkIfImage = (filePath) => {
    const imageRegex = /\.(jpeg|jpg|gif|png|bmp|tiff|tif|svg|ico|heic|hief)$/i;
    return imageRegex.test(filePath);
  };

  const renderMessages = () => {
    let lastDate = null;
    return selectedChatMessages.map((message, index) => {
      const messageDate = moment(message.timestamp).format("YYYY-MM-DD");
      const showDate = messageDate !== lastDate;
      lastDate = messageDate;
      return (
        <div key={index}>
          {showDate && (
            <div className="text-center text-xs text-gray-500 my-2">
              {moment(message.timestamp).format("LL")}
            </div>
          )}
          {selectedChatType === "contact" && renderDMMessages(message)}
          {selectedChatType === "channel" && renderChannelMessages(message)}
        </div>
      );
    });
  };

  const downloadFile = async (fileUrl) => {
    try {
      // Fetch the file as a blob
      const response = await fetch(fileUrl);

      // Check if the response is okay
      if (!response.ok) throw new Error("Failed to fetch file");

      // Convert the response to a blob
      const blob = await response.blob();

      // Create a temporary anchor element
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);

      // Set the download attribute with the filename
      link.setAttribute("download", fileUrl.split("/").pop());

      // Append the anchor to the document, trigger the click, and remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Revoke the object URL after the download starts to free memory
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("An error occurred while downloading the file:", error);
    }
  };

  const renderDMMessages = (message) => {
    return (
      <div
        className={`${
          message.sender === selectedChatData._id ? "text-left" : "text-right"
        }`}
      >
        {message.messageType === "text" && (
          <div
            className={`${
              message.sender !== selectedChatData._id
                ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
                : "bg-[#2a2b33]/5 text-white/80 border-white/20"
            } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}
          >
            {message.content}
          </div>
        )}
        {message.messageType === "file" && (
          <div
            className={`${
              message.sender !== selectedChatData._id
                ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
                : "bg-[#2a2b33]/5 text-white/80 border-white/20"
            } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}
          >
            {checkIfImage(message.fileUrl) ? (
              <div
                className="cursor-pointer"
                onClick={() => {
                  setShowImage(true);
                  setImageUrl(message.fileUrl);
                }}
              >
                <img
                  src={message.fileUrl} // Use the direct Cloudinary URL
                  height={300}
                  width={300}
                  alt="Uploaded file"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <span className="text-white/8 text-3xl bg-black/20 rounded-full p-3">
                  <MdFolderZip />
                </span>
                <span>{message.fileUrl.split("/").pop()}</span>
                <span
                  className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
                  onClick={() => window.open(message.fileUrl, "_blank")}
                >
                  <IoMdArrowRoundDown />
                </span>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-gray-600">
          {moment(message.timestamp).format("LT")}
        </div>
      </div>
    );
  };

  const renderChannelMessages = (message) => {
    return (
      <div
        className={`mt-5 ${
          message.sender._id !== userInfo.id ? "text-left" : "text-right"
        }`}
      >
        {message.messageType === "text" && (
          <div
            className={`${
              message.sender._id !== userInfo.id
                ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
                : "bg-[#2a2b33]/5 text-white/80 border-white/20"
            } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}
          >
            {message.content}
          </div>
        )}
        {message.sender._id !== userInfo.id ? (
          <div className="flex items-center justify-start gap-3">
            <Avatar className="h-8 w-8 rounded-full overflow-hidden">
              {message.sender.image && (
                <AvatarImage
                  src={message.sender.image.url}
                  alt="profile"
                  className="object-cover w-full h-full bg-black"
                />
              )}
              <AvatarFallback
                className={`uppercase w-8 h-8 text-lg border flex items-center justify-center rounded-full ${getColor(
                  message.sender.color
                )}`}
              >
                {message.sender.firstName
                  ? message.sender.firstName.split("").shift()
                  : message.sender.email.split("").shift()}
              </AvatarFallback>
            </Avatar>
            <span className="text-small text-white/60">{`${message.sender.firstName} ${message.sender.lastName}`}</span>
          </div>
        ) : (
          ""
        )}
        {message.messageType === "file" && (
          <div
            className={`${
              message.sender._id !== userInfo.id
                ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
                : "bg-[#2a2b33]/5 text-white/80 border-white/20"
            } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}
          >
            {checkIfImage(message.fileUrl) ? (
              <div
                className="cursor-pointer"
                onClick={() => {
                  setShowImage(true);
                  setImageUrl(message.fileUrl);
                }}
              >
                <img src={message.fileUrl} height={300} width={300} />
              </div>
            ) : (
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <span className="text-white/8 text-3xl bg-black/20 rounded-full p-3">
                  <MdFolderZip />
                </span>
                <span>{message.fileUrl.split("/").pop()}</span>
                <span
                  className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursior-pointer transition-all duration-300"
                  onClick={() => downloadFile(message.fileUrl)}
                >
                  <IoMdArrowRoundDown />
                </span>
              </div>
            )}
          </div>
        )}
        <div className="text-xs text-gray-600">
          {moment(message.timestamp).format("LT")}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hidden p-4 px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full">
      {isLoading ? <LoaderChat /> : renderMessages()}
      <div ref={scrollRef} />
      {showImage && (
        <div className="fixed z-[1000] top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center backdrop-blur-lg flex-col">
          <div>
            <img src={imageUrl} alt="" className="h-[80vh] w-full bg-cover" />
          </div>
          <div className="flex gap-5 fixed top-0 mt-5">
            <button
              className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursior-pointer transition-all duration-300"
              onClick={() => downloadFile(imageUrl)}
            >
              <IoMdArrowRoundDown />
            </button>
            <button
              className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursior-pointer transition-all duration-300"
              onClick={() => {
                setShowImage(false);
                setImageUrl(null);
              }}
            >
              <IoCloseSharp />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageContainer;
