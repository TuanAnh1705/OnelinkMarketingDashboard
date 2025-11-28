"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserData {
  id: number;
  fullName: string;
  email: string;
  role: string;
}

const ProfileWelcome = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/me");
        
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          console.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Hàm lấy initials từ fullName
  const getInitials = (name: string) => {
    if (!name) return "U";
    
    const names = name.trim().split(" ");
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    // Lấy chữ cái đầu của tên đầu và tên cuối
    return (
      names[0].charAt(0).toUpperCase() + 
      names[names.length - 1].charAt(0).toUpperCase()
    );
  };

  // Hàm tạo màu background từ tên
  const getColorFromName = (name: string) => {
    if (!name) return "bg-primary";
    
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];
    
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (loading) {
    return (
      <div className="relative flex items-center justify-between bg-lightsecondary rounded-lg p-6">
        <div className="flex items-center gap-3">
          <div className="w-[50px] h-[50px] bg-gray-200 rounded-full animate-pulse" />
          <div className="flex flex-col gap-2">
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="hidden sm:block absolute right-8 bottom-0">
          <Image 
            src={"/images/dashboard/customer-support-img.png"} 
            alt="support-img" 
            width={145} 
            height={95} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-between bg-lightsecondary rounded-lg p-6">
      <div className="flex items-center gap-3">
        <Avatar className="w-[50px] h-[50px]">
          <AvatarImage src="" alt={user?.fullName || "User"} />
          <AvatarFallback className={`${getColorFromName(user?.fullName || "")} text-white font-semibold`}>
            {getInitials(user?.fullName || "User")}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex flex-col gap-0.5">
          <h5 className="card-title">
            Welcome back! {user?.fullName || "User"} 👋
          </h5>
          <p className="text-link/80 dark:text-white/80">
            Check your reports
          </p>
        </div>
      </div>
      
      <div className="hidden sm:block absolute right-8 bottom-0">
        <Image 
          src={"/images/dashboard/customer-support-img.png"} 
          alt="support-img" 
          width={145} 
          height={95} 
        />
      </div>
    </div>
  );
};

export default ProfileWelcome;