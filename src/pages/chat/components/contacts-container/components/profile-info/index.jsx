import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FiEdit2 } from "react-icons/fi";
import { getColor } from "@/lib/utils";
import { useAppStore } from "@/store";
import { LOGIN_ROUTE, LOGOUT_ROUTE } from "@/utils/constants";
import React from "react";
import { useNavigate } from "react-router-dom";
import { IoPowerSharp } from "react-icons/io5";
import { apiClient } from "@/lib/api-client";

const ProfileInfo = () => {
  const navigate = useNavigate();
  const { userInfo, setUserInfo } = useAppStore();

  const logOut = async () => {
    try {
      const response = await apiClient.post(
        LOGOUT_ROUTE,
        {},
        {
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        navigate("/auth");
        setUserInfo(null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="absolute bottom-0 h-16 flex items-center justify-between px-10 w-full bg-[#2a2b33]">
      <div className="flex gap-3 items-center justify-center">
        <div>
          <Avatar className="h-12 w-12 rounded-full overflow-hidden">
            {userInfo.image && userInfo.image.url ? (
              <AvatarImage
                src={userInfo.image.url}
                alt="profile"
                className="object-cover w-full h-full bg-black"
              />
            ) : (
              <div
                className={`uppercase w-12 h-12 text-lg border flex items-center justify-center rounded-full ${getColor(
                  userInfo.color
                )}`}
              >
                {userInfo.firstName ? userInfo.firstName[0] : userInfo.email[0]}
              </div>
            )}
          </Avatar>
        </div>
        <div>
          {userInfo.firstName && userInfo.lastName
            ? `${userInfo.firstName} ${userInfo.lastName}`
            : ""}
        </div>
        <div className="flex gap-5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <FiEdit2
                  className="text-xl text-purple-500 font-medium"
                  onClick={() => navigate("/profile")}
                />
              </TooltipTrigger>
              <TooltipContent className="bg-[#1c1b1e] border-none text-white">
                Edit Profile
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <IoPowerSharp
                  className="text-xl text-red-500 font-medium"
                  onClick={logOut}
                />
              </TooltipTrigger>
              <TooltipContent className="bg-[#1c1b1e] border-none text-white">
                Logout
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;
