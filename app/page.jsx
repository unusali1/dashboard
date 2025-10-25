"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart } from "lucide-react";
import Navbar from "@/components/Navbar/Navbar";

const DashboardPage = () => {
  const router = useRouter();

  const cards = [
    {
      title: "Products",
      icon: <Package className="w-10 h-10 text-blue-500" />,
      desc: "View and manage all your products",
      link: "/dashboard/products",
    },
    {
      title: "Orders",
      icon: <ShoppingCart className="w-10 h-10 text-green-500" />,
      desc: "Check and track all your orders",
      link: "/dashboard/orders",
    },
  ];

  return (
    <div className="w-full">
      <Navbar />
      <div className="min-h-screen w-full  dark:from-gray-900 dark:to-gray-950 flex flex-col items-center p-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-10 text-center">
          WELCOME TO DASHBOARD
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-3xl">
          {cards.map((card, index) => (
            <Card
              key={index}
              onClick={() => router.push(card.link)}
              className="cursor-pointer hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 bg-white dark:bg-gray-800"
            >
              <CardHeader className="flex flex-col items-center space-y-3 pt-6">
                {card.icon}
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 dark:text-gray-400 pb-4">
                  {card.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
