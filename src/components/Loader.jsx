import React from "react";
import Lottie from "react-lottie";
import Loader from "../assets/Loader.json";
import ChatLoader from "../assets/ChatLoader.json";
import EmptyChat from "../assets/EmptyChat.json";
const LoaderPage = () => {
  return (
    <Lottie options={{ animationData: Loader, loop: true, autoplay: true }} />
  );
};

const LoaderChat = () => {
  return (
    <Lottie
      options={{ animationData: ChatLoader, loop: true, autoplay: true }}
    />
  );
};

const EmptyChatLoader = () => {
  return (
    <Lottie
      options={{ animationData: EmptyChat, loop: true, autoplay: true }}
    />
  );
};
export { LoaderPage, LoaderChat, EmptyChatLoader };
