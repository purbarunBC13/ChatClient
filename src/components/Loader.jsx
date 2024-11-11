import React from "react";
import Lottie from "react-lottie";
import Loader from "../assets/Loader.json";
const LoaderPage = () => {
  return <Lottie options={{ animationData: Loader, loop: true }} />;
};

export default LoaderPage;
