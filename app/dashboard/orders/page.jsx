"use client";

import React, { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Smile, Meh, Frown, Edit, Trash } from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";

const fetchOrders = async () => {
  const res = await axios.get(
    "https://68f9c1b2ef8b2e621e7d4f9a.mockapi.io/api/v1/orders"
  );
  return res.data;
};

const OrderListPage = () => {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    retry:false
  });

  const columns = useMemo(
    () => [
      {
        header: "Order ID",
        accessorKey: "id",
        cell: ({ row }) => (
          <a
            href={`/dashboard/orders/${row.original.id}`}
            className="text-blue-600 hover:underline"
          >
            #{row.original.id}
          </a>
        ),
      },
      {
        header: "Client",
        accessorKey: "clientName",
        cell: ({ row }) => {
          const name = row.original.clientName;
          const initials = name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
          return (
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span>{name}</span>
            </div>
          );
        },
      },
      {
        header: "Payment Status",
        accessorKey: "paymentStatus",
        cell: ({ getValue }) => {
          const val = getValue();
          const color =
            val === "Paid"
              ? "bg-green-500"
              : val === "Pending"
              ? "bg-yellow-500"
              : "bg-red-500";
          return (
            <Badge className={`${color} text-white`}>{val}</Badge>
          );
        },
      },
      {
        header: "Delivery Status",
        accessorKey: "deliveryStatus",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Progress
              value={row.original.deliveryProgress}
              className="w-24"
            />
            <span className="text-xs text-gray-600">
              {row.original.deliveryStatus}
            </span>
          </div>
        ),
      },
      {
        header: "Total Amount",
        accessorKey: "total",
        cell: ({ getValue }) => (
          <span className="font-medium">
            ${parseFloat(getValue()).toFixed(2)}
          </span>
        ),
      },
      {
        header: "Customer Feedback",
        accessorKey: "feedback",
        cell: ({ getValue }) => {
          const val = getValue();
          if (val === "happy")
            return <Smile className="text-green-500" />;
          if (val === "neutral")
            return <Meh className="text-yellow-500" />;
          return <Frown className="text-red-500" />;
        },
      },
      {
        header: "Created At",
        accessorKey: "createdAt",
        cell: ({ getValue }) =>
          new Date(getValue()).toLocaleString(),
      },
      {
        header: "Actions",
        cell: () => (
          <div className="flex gap-2">
            <Button size="icon" variant="ghost">
              <Edit className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost">
              <Trash className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (isLoading)
    return <p className="p-8 text-center">Loading orders...</p>;

  return (
    <div className="p-6 space-y-6">
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Orders"
          value={orders.length}
          data={orders}
        />
        <StatCard
          title="Delivered %"
          value={`${Math.round(
            (orders.filter((o) => o.deliveryStatus === "Delivered").length /
              orders.length) *
              100
          )}%`}
          data={orders}
        />
        <StatCard
          title="Pending Deliveries"
          value={
            orders.filter((o) => o.deliveryStatus !== "Delivered")
              .length
          }
          data={orders}
        />
        <StatCard
          title="Avg. Client Satisfaction"
          value={`${Math.round(
            (orders.filter((o) => o.feedback === "happy").length /
              orders.length) *
              100
          )}% 😀`}
          data={orders}
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-200"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-t hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Overview Stat Card Component
const StatCard = ({ title, value, data }) => {
  const chartData = data.slice(0, 7).map((d, i) => ({
    name: `D${i + 1}`,
    value: Math.random() * 100,
  }));

  return (
    <Card className="p-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold mb-2">{value}</div>
        <div className="h-8 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderListPage;
