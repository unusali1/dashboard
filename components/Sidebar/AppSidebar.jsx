"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

// Lucide Icons
import {
  Package,
  ShoppingCart,
  Settings,
  User,
  LogOut,
  ChevronDown,
  GraduationCap,
} from "lucide-react";

const AppSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const items = [
    { title: "Products", url: "/dashboard/products", icon: Package },
    { title: "Orders", url: "/dashboard/orders", icon: ShoppingCart },
  ];

  const handleLogout = () => {
    // handle logout logic here
    console.log("User logged out");
  };

  return (
    <Sidebar collapsible="icon" className="bg-white shadow-md border-r border-gray-200">
      {/* HEADER */}
      <SidebarHeader className="mt-4 px-5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/" className="flex items-center gap-3 group">
                <div className="bg-blue-600 text-white p-2 rounded-xl shadow-md">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="font-semibold text-base text-blue-600 group-hover:text-blue-700 transition-colors">
                    Abroad Inquiry
                  </span>
                  <span className="text-xs text-gray-500">
                    Educational Consultants
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Divider */}
      <div className="my-4 px-3">
        <hr className="border-t border-dashed border-slate-300/40" />
      </div>

      {/* NAVIGATION */}
      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title} className="my-1">
                    <SidebarMenuButton
                      asChild
                      className={`relative flex items-center gap-3 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200
                        ${
                          isActive
                            ? "bg-blue-50 text-blue-700 shadow-sm"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                    >
                      <Link href={item.url} className="flex items-center gap-3 w-full">
                        {isActive && (
                          <span className="absolute left-0 top-0 h-full w-1 bg-blue-600 rounded-r"></span>
                        )}
                        <Icon className="w-5 h-5 shrink-0" />
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

      {/* FOOTER / USER MENU */}
      <SidebarFooter className="bg-gray-50 p-4 border-t border-gray-200">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="flex items-center justify-between gap-3 py-3 px-3 rounded-lg hover:bg-gray-100 transition-all">
                  <div className="flex items-center gap-3">
                    <Avatar className="border">
                      <AvatarImage src="" alt="User" />
                      <AvatarFallback>MU</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium text-gray-800">
                        Md Unus Ali
                      </span>
                      <span className="text-xs text-gray-500">Guest</span>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-white shadow-xl rounded-lg border border-gray-200 w-48"
              >
                <DropdownMenuItem className="px-4 py-2 text-sm hover:bg-gray-100 rounded-md flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem className="px-4 py-2 text-sm hover:bg-gray-100 rounded-md flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
