"use client";

import {
  LogOut,
  Moon,
  Sun,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  AlignJustify,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {useSidebar } from "@/components/ui/sidebar";

const Navbar = () => {
  const { toggleSidebar, open, isMobile } = useSidebar();
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", prefersDark);
    }
  }, []);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <div className="w-full">
      <nav className="flex items-center justify-between px-4 py-3 sticky top-0  z-20">
        {isMobile ? (
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSidebar}
            className="rounded-xl"
          >
            <AlignJustify className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSidebar}
            className="rounded-xl"
          >
            {open ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </Button>
        )}

        <div className="flex items-center gap-4">
          <span className="font-semibold text-slate-800 dark:text-slate-100">
            Md Unus Ali
          </span>

          {/* Theme Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full transition-colors hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5 text-slate-800" />
            ) : (
              <Sun className="h-5 w-5 text-yellow-400" />
            )}
          </Button>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none focus:ring-0">
              <Avatar className="h-9 w-9 border border-slate-300 dark:border-slate-600">
                <AvatarImage src="" />
                <AvatarFallback className="bg-blue-600 text-white">
                  U
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              sideOffset={10}
              className="w-48 rounded-xl shadow-lg"
            >
              <DropdownMenuLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                My Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-red-500 focus:text-red-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

     
      <div className="mb-2">
        <hr className="my-2 border-t border-dashed border-slate-300/50 dark:border-slate-600/50" />
      </div>
    </div>
  );
};

export default Navbar;
