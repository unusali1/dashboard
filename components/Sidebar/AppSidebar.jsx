"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { House, Package, ShoppingCart } from "lucide-react";

const AppSidebar = () => {
  const pathname = usePathname();

  const items = [
    { title: "Dashboard", url: "/", icon: House },
    { title: "Products", url: "/dashboard/products", icon: Package },
    { title: "Orders", url: "/dashboard/orders", icon: ShoppingCart },
  ];

  return (
    <Sidebar collapsible="icon" className="bg-white dark:bg-gray-900 ">
      {/* Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link
                href="/"
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 transition-all duration-300 group"
              >
                <div className="h-8 w-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-md">
                  <span className="text-white text-md font-bold">PM</span>
                </div>

                <div className="flex flex-col ml-2">
                  <span className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Product Management
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    System
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Divider */}
      <div className="my-4 px-4">
        <hr className="my-1 border-t border-dashed border-slate-300/50 dark:border-slate-600/50" />
      </div>

      {/* Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.url;

                return (
                  <SidebarMenuItem key={item.title} className="my-1.5">
                    <SidebarMenuButton
                      asChild
                      className={`relative flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ease-in-out
                        ${
                          isActive
                            ? "bg-gray-200 dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-semibold"
                            : "text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400"
                        }`}
                    >
                      <Link
                        href={item.url}
                        className="flex items-center h-10 gap-3 w-full"
                      >
                        <Icon
                          className={`w-5 h-5 shrink-0 transition-transform duration-300 ${
                            isActive ? "scale-110" : "group-hover:scale-110"
                          }`}
                        />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
