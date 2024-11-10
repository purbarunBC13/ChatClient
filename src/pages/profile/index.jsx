import { useAppStore } from "@/store";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import { colors, getColor } from "@/lib/utils";
import { FaTrash, FaPlus } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import {
  REMOVE_PROFILE_IMAGE_ROUTE,
  UPDATE_PROFILE_ROUTE,
} from "@/utils/constants";

const Profile = () => {
  const navigate = useNavigate();
  const { userInfo, setUserInfo } = useAppStore();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [image, setImage] = useState(null);
  const [publicId, setPublicId] = useState(null);
  const [hovered, setHovered] = useState(false);
  const [selectedColor, setselectedColor] = useState(0);

  const fileInputRef = useRef(null);
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const cloudPreset = import.meta.env.VITE_CLOUDINARY_PRESET;
  // console.log(cloudName, cloudPreset);

  useEffect(() => {
    if (userInfo.profileSetup) {
      setFirstName(userInfo.firstName);
      setLastName(userInfo.lastName);
      setselectedColor(userInfo.color);
    }
    if (userInfo.image) {
      setImage(userInfo.image.url);
      setPublicId(userInfo.image.public_id);
    }
  }, [userInfo]);

  const validateProfile = () => {
    if (!firstName) {
      toast.error("Please enter first name");
      return false;
    }
    if (!lastName) {
      toast.error("Please enter last name");
      return false;
    }
    return true;
  };

  const saveChanges = async () => {
    if (validateProfile()) {
      try {
        const response = await apiClient.post(
          UPDATE_PROFILE_ROUTE,
          {
            firstName,
            lastName,
            color: selectedColor,
            image:
              image && publicId ? { url: image, public_id: publicId } : null, // include image info if available
          },
          {
            withCredentials: true,
          }
        );
        if (response.status === 200 && response.data) {
          setUserInfo({ ...response.data });
          toast.success("Profile updated successfully");
          navigate("/chat");
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleNavigate = () => {
    if (userInfo.profileSetup) navigate("/chat");
    else toast.error("Please complete your profile setup");
  };

  const handleFileInputClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", cloudPreset); // Replace with your Cloudinary upload preset
      formData.append("cloud_name", cloudName); // Replace with your Cloudinary cloud name

      try {
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await res.json();
        if (data.secure_url) {
          setImage(data.secure_url);
          setPublicId(data.public_id);
          setUserInfo({
            ...userInfo,
            image: { url: data.secure_url, public_id: data.public_id },
          });
          toast.success("Image uploaded successfully");
        }
      } catch (error) {
        toast.error("Image upload failed");
        console.log(error);
      }
    }
  };

  const handleDeleteImage = async () => {
    if (publicId) {
      try {
        const res = await apiClient.post(
          REMOVE_PROFILE_IMAGE_ROUTE,
          { public_id: publicId },
          { withCredentials: true }
        );

        if (res.status === 200) {
          setUserInfo({ ...userInfo, image: null });
          setImage(null);
          setPublicId(null);
          toast.success("Image removed successfully");
        } else {
          throw new Error("Image deletion failed");
        }
      } catch (error) {
        toast.error("Failed to delete image");
        console.log(error);
      }
    }
  };

  return (
    <div className="bg-[#1b1c24] h-[100vh] flex flex-col items-center justify-center gap-10">
      <div className="flex flex-col gap-10 w-[80vw] md:w-max">
        <div onClick={handleNavigate}>
          <IoArrowBack className="text-4xl lg:text-6xl text-white/90 cursor-pointer" />
        </div>
        <div className="grid grid-cols-2">
          <div
            className="h-full w-32 md:w-48 relative flex items-center justify-center"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <Avatar className="h-32 w-32 md:h-48 md:w-48 rounded-full overflow-hidden">
              {image ? (
                <AvatarImage
                  src={image}
                  alt="profile"
                  className="object-cover w-full h-full bg-black"
                />
              ) : (
                <div
                  className={`uppercase w-32 h-32 md:w-48 md:h-48 text-5xl border flex items-center justify-center rounded-full ${getColor(
                    selectedColor
                  )}`}
                >
                  {firstName ? firstName[0] : userInfo.email[0]}
                </div>
              )}
              {hovered && (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black/50 ring-fuchsia-50 rounded-full"
                  onClick={image ? handleDeleteImage : handleFileInputClick}
                >
                  {image ? (
                    <FaTrash className="text-white text-3xl cursor-pointer" />
                  ) : (
                    <FaPlus className="text-white text-3xl cursor-pointer" />
                  )}
                </div>
              )}
              <Input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleImageChange}
                name="profile-image"
                accept=".png, .jpg, .jpeg, .svg, .webp"
              />
            </Avatar>
          </div>
          <div className="flex min-w-32 md:min-w-64 flex-col gap-5 text-white items-center justify-center">
            <div className="w-full">
              <Input
                type="email"
                value={userInfo.email}
                placeholder="Email"
                disabled
                className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              />
            </div>
            <div className="w-full">
              <Input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              />
            </div>
            <div className="w-full">
              <Input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              />
            </div>
            <div className="w-full flex gap-5">
              {colors.map((color, index) => (
                <div
                  key={index}
                  onClick={() => setselectedColor(index)}
                  className={`w-8 h-8 rounded-full cursor-pointer transition-all duration-300 ${color} ${
                    selectedColor === index ? "ring-2 ring-white" : ""
                  }`}
                ></div>
              ))}
            </div>
          </div>
        </div>
        <div className="w-full">
          <Button
            className="h-16 w-full bg-purple-700 hover:bg-purple-900 transition-all duration-300 text-lg md:text-xl"
            onClick={saveChanges}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
