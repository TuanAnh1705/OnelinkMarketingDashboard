"use client";

import { uniqueId } from "lodash";
import { handleLogout } from "@/lib/logout"; // ✅ Import từ lib

export interface ChildItem {
  id?: number | string;
  name?: string;
  icon?: any;
  children?: ChildItem[];
  item?: any;
  url?: any;
  color?: string;
  disabled?: boolean;
  subtitle?: string;
  badge?: boolean;
  badgeType?: string;
  isPro?: boolean;
  target?: string;
  onClick?: () => void | Promise<void>;
}

export interface MenuItem {
  heading?: string;
  name?: string;
  icon?: any;
  id?: number;
  to?: string;
  items?: MenuItem[];
  children?: ChildItem[];
  url?: any;
  disabled?: boolean;
  subtitle?: string;
  badgeType?: string;
  badge?: boolean;
  isPro?: boolean;
}

const SidebarContent: MenuItem[] = [
  {
    heading: "Home",
    children: [
      {
        name: "Dashboard",
        icon: 'solar:widget-2-linear',
        id: uniqueId(),
        url: "/admin",
        isPro: false
      },
    ],
  },
  {
    heading: "pages",
    children: [
      {
        name: "BLOG",
        id: uniqueId(),
        icon: "solar:document-linear",
        url: "#",
        children: [
          {
            name: "New Post",
            id: uniqueId(),
            url: "https://onelinkmkt.vietnamsourcing.co/wp-admin/post-new.php",
            target: "_blank"
          },
          {
            name: "Review Post",
            id: uniqueId(),
            url: "/admin/blog",
          },
        ],
      },
    ],
  },
  {
    heading: "CATEGORIES",
    children: [
      {
        name: "New Categories",
        icon: 'mdi:category-plus-outline',
        id: uniqueId(),
        url: "/admin/categories",
      },
    ],
  },
  {
    heading: "ABOUT US",
    children: [
      {
        name: "New Members",
        icon: 'material-symbols:person-add-outline',
        id: uniqueId(),
        url: "/admin/utilities/aboutUs",
      },
    ],
  },
  // Thêm vào Sidebaritems.tsx
  {
    heading: "CONTENT",
    children: [
      {
        name: "Authors",
        icon: 'mdi:account-edit-outline',
        id: uniqueId(),
        url: "/admin/authors",
      },
    ],
  },
  {
    heading: "Auth",
    children: [
      {
        name: "Log Out",
        icon: 'material-symbols:logout',
        id: uniqueId(),
        url: "#",
        onClick: handleLogout,
      },
    ],
  },

];

export default SidebarContent;