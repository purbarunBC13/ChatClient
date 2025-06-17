import React, { useState } from "react";
import Background from "@/assets/login2.png";
import Victory from "@/assets/victory.svg";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { LOGIN_ROUTE, SIGNUP_ROUTE } from "@/utils/constants";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store";
import { Eye, EyeOff } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const { userInfo, setUserInfo } = useAppStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isView, setIsView] = useState(false);
  const [isConfirmView, setIsConfirmView] = useState(false);

  const validateSignup = () => {
    if (!email || !password || !confirmPassword) {
      toast.error("Please fill in all the fields");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Password and confirm password do not match");
      return false;
    }
    // Password validation: min 8 chars, uppercase, lowercase, number, special char
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      toast.error(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
      );
      return false;
    }
    return true;
  };

  const validateLogin = () => {
    if (!email || !password) {
      toast.error("Please fill in all the fields");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    try {
      if (validateLogin()) {
        const response = await apiClient.post(
          LOGIN_ROUTE,
          { email, password },
          { withCredentials: true }
        );
        if (response.data.user.id) {
          toast.success("Login successful");
          setUserInfo(response.data.user);
          if (response.data.user.profileSetup) {
            navigate("/chat");
          } else {
            navigate("/profile");
          }
        }
      }
    } catch (error) {
      toast.error("Invalid credentials");
    }
  };

  const handleSignup = async () => {
    if (validateSignup()) {
      try {
        const response = await apiClient.post(
          SIGNUP_ROUTE,
          { email, password },
          { withCredentials: true }
        );
        toast.success("Signup successful");
        if (response.status === 201) {
          setUserInfo(response.data.user);
          navigate("/profile");
        }
      } catch (error) {
        toast.error(error.response.data);
      }
    }
  };

  return (
    <div className="h-[100vh] w-[100vw] flex justify-center items-center">
      <div className="h-[80vh] w-[80vw] bg-white border-2 border-white text-opacity-90 shadow-2xl md:w-[90vw] lg:w-[70vw] xl:w-[60vw] rounded-3xl grid xl:grid-cols-2">
        <div className="flex flex-col gap-10 items-center justify-center">
          <div className="flex items-center justify-center flex-col">
            <div className="flex items-center justify-center">
              <h1 className="text-5xl font-bold md:text-6xl">Welcome</h1>
              <img src={Victory} alt="victory Emoji" className="h-[100px]" />
            </div>
            <p className="font-medium text-center">
              Fill in the details to get started with the best chat app!
            </p>
          </div>
          <div className="flex items-center justify-center w-full">
            <Tabs className="w-3/4" defaultValue="login">
              <TabsList className="bg-transparent rounded-none w-full">
                <TabsTrigger
                  value="login"
                  className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300"
                >
                  Signup
                </TabsTrigger>
              </TabsList>
              <TabsContent className="flex flex-col gap-5 mt-10" value="login">
                <Input
                  placeholder="Email"
                  type="email"
                  className="rounded-full p-6"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="relative">
                  <Input
                    placeholder="Password"
                    type={isView ? "text" : "password"}
                    className="rounded-full p-6"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {isView ? (
                    <Eye
                      className="absolute right-4 top-4 z-10 cursor-pointer text-gray-500"
                      onClick={() => {
                        setIsView(!isView), console.log(isView);
                      }}
                    />
                  ) : (
                    <EyeOff
                      className="absolute right-4 top-4 z-10 cursor-pointer text-gray-500"
                      onClick={() => setIsView(!isView)}
                    />
                  )}
                </div>
                <Button className="rounded-full p-6" onClick={handleLogin}>
                  Login
                </Button>
              </TabsContent>
              <TabsContent className="flex flex-col gap-5" value="signup">
                <Input
                  placeholder="Email"
                  type="email"
                  className="rounded-full p-6"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="relative">
                  <Input
                    placeholder="Password"
                    type={isView ? "text" : "password"}
                    className="rounded-full p-6"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {isView ? (
                    <Eye
                      className="absolute right-4 top-4 z-10 cursor-pointer text-gray-500"
                      onClick={() => {
                        setIsView(!isView);
                      }}
                    />
                  ) : (
                    <EyeOff
                      className="absolute right-4 top-4 z-10 cursor-pointer text-gray-500"
                      onClick={() => setIsView(!isView)}
                    />
                  )}
                </div>
                <div className="relative">
                  <Input
                    placeholder="Confirm Password"
                    type={isConfirmView ? "text" : "password"}
                    className="rounded-full p-6"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  {isConfirmView ? (
                    <Eye
                      className="absolute right-4 top-4 z-10 cursor-pointer text-gray-500"
                      onClick={() => {
                        setIsConfirmView(!isConfirmView);
                      }}
                    />
                  ) : (
                    <EyeOff
                      className="absolute right-4 top-4 z-10 cursor-pointer text-gray-500"
                      onClick={() => setIsConfirmView(!isConfirmView)}
                    />
                  )}
                </div>
                <Button className="rounded-full p-6" onClick={handleSignup}>
                  Signup
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <div className="hidden xl:flex justify-center items-center">
          <img src={Background} alt="background" className="h-[600px]" />
        </div>
      </div>
    </div>
  );
};

export default Auth;
