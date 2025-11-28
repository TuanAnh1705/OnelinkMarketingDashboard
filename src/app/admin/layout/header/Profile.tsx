"use client";

import { Icon } from "@iconify/react";
import { Button, Dropdown, DropdownItem } from "flowbite-react";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SimpleBar from "simplebar-react";
import { handleLogout } from "@/lib/logout";

interface UserData {
  id: number;
  fullName: string;
  email: string;
  role: string;
}

const Profile = () => {
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

    return (
      names[0].charAt(0).toUpperCase() +
      names[names.length - 1].charAt(0).toUpperCase()
    );
  };

  // Hàm tạo màu background từ tên
  const getColorFromName = (name: string) => {
    if (!name) return "#5D87FF";

    const colors = [
      "#5D87FF", // blue
      "#49BEFF", // cyan
      "#13DEB9", // teal
      "#FFAE1F", // yellow
      "#FA896B", // orange
      "#F36896", // pink
    ];

    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="relative group/menu ps-15 shrink-0">
      <Dropdown
        label=""
        className="w-screen sm:w-[280px] pb-6 pt-4 rounded-sm"
        dismissOnClick={false}
        renderTrigger={() => (
          <span className="hover:text-primary hover:bg-lightprimary rounded-full flex justify-center items-center cursor-pointer group-hover/menu:bg-lightprimary group-hover/menu:text-primary">
            {loading ? (
              <div className="w-[35px] h-[35px] bg-gray-200 rounded-full animate-pulse" />
            ) : (
              <div
                className="w-[35px] h-[35px] rounded-full flex items-center justify-center text-white font-semibold text-sm"
                style={{ backgroundColor: getColorFromName(user?.fullName || "") }}
              >
                {getInitials(user?.fullName || "User")}
              </div>
            )}
          </span>
        )}
      >
        <SimpleBar className="max-h-[400px]">
          {/* User Info Section */}
          <div className="px-4 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div
                className="w-[50px] h-[50px] rounded-full flex items-center justify-center text-white font-semibold text-lg"
                style={{ backgroundColor: getColorFromName(user?.fullName || "") }}
              >
                {loading ? (
                  <div className="w-full h-full bg-gray-200 rounded-full animate-pulse" />
                ) : (
                  getInitials(user?.fullName || "User")
                )}
              </div>

              <div className="flex flex-col">
                {loading ? (
                  <>
                    <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-1" />
                    <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                  </>
                ) : (
                  <>
                    <h5 className="text-sm font-semibold text-dark">
                      {user?.fullName || "User"}
                    </h5>
                    <p className="text-xs text-gray-500">
                      {user?.email || ""}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          {/* <div className="py-2">
            <DropdownItem
              as={Link}
              href="/admin/profile"
              className="px-4 py-2 flex justify-between items-center bg-hover group/link w-full"
            >
              <div className="w-full">
                <div className="ps-0 flex items-center gap-3 w-full">
                  <Icon
                    icon="solar:user-circle-linear"
                    className="text-lg text-slateGray group-hover/link:text-primary"
                  />
                  <div className="w-3/4">
                    <h5 className="mb-0 text-sm text-slateGray group-hover/link:text-primary">
                      My Profile
                    </h5>
                  </div>
                </div>
              </div>
            </DropdownItem>

            <DropdownItem
              as={Link}
              href="/admin/settings"
              className="px-4 py-2 flex justify-between items-center bg-hover group/link w-full"
            >
              <div className="w-full">
                <div className="ps-0 flex items-center gap-3 w-full">
                  <Icon
                    icon="solar:settings-linear"
                    className="text-lg text-slateGray group-hover/link:text-primary"
                  />
                  <div className="w-3/4">
                    <h5 className="mb-0 text-sm text-slateGray group-hover/link:text-primary">
                      Account Settings
                    </h5>
                  </div>
                </div>
              </div>
            </DropdownItem>
          </div> */}
        </SimpleBar>

        {/* Logout Button */}
        <div className="pt-2 px-4 border-none mt-2">
          <Button
            color="outlineprimary"
            size="md"
            onClick={handleLogout}
            className="w-full rounded-lg py-0"
          >
            <Icon icon="material-symbols:logout" className="mr-2" />
            Logout
          </Button>
        </div>
      </Dropdown>
    </div>
  );
};

export default Profile;