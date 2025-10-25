"use client";
import React, { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Navbar from "@/components/Navbar/Navbar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeftRight, Plus } from "lucide-react";

const StockIndicator = ({ stock }) => {
  let bg =
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
  if (stock < 10)
    bg = "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
  else if (stock < 50)
    bg =
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${bg}`}
    >
      {stock} pcs
    </span>
  );
};

const StatusChip = ({ status }) => {
  const active = /active/i.test(status);
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
        active
          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
};

const EmojiRating = ({ score }) => {
  if (score >= 4) return <span className="text-2xl">😀</span>;
  if (score >= 3) return <span className="text-2xl">😐</span>;
  return <span className="text-2xl">😡</span>;
};

const ProgressBar = ({ value }) => {
  const percent = Math.max(0, Math.min(100, value));
  return (
    <div className="w-24 h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div
        style={{ width: `${percent}%` }}
        className="h-full rounded-full bg-blue-500"
      />
    </div>
  );
};

const Sparkline = ({ values = [] }) => {
  const w = 60;
  const h = 20;
  if (!values || values.length === 0) {
    return <svg width={w} height={h} />;
  }
  const max = Math.max(...values);
  const min = Math.min(...values);
  const diff = max - min || 1;
  const step = w / (values.length - 1 || 1);
  const points = values
    .map((v, i) => `${i * step},${h - ((v - min) / diff) * h}`)
    .join(" ");
  return (
    <svg width={w} height={h} className="inline-block align-middle">
      <polyline
        fill="none"
        stroke="#3b82f6"
        strokeWidth="1.5"
        points={points}
      />
      <polyline
        fill="none"
        stroke="#93c5fd"
        strokeWidth="6"
        strokeLinecap="round"
        points={points}
        opacity="0.25"
      />
    </svg>
  );
};

const fetchProducts = async () => {
  const url = `https://68f9c1b2ef8b2e621e7d4f9a.mockapi.io/ap1/v1/products`;
  const resp = await axios.get(url);
  return {
    data: resp.data,
    total: parseInt(resp.headers["x-total-count"]) || 1000,
  };
};

export default function ProductListPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [globalFilter, setGlobalFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});

  const {
    data: result,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const enrichedData = useMemo(() => {
    if (!result?.data) return [];
    return result.data.map((p) => ({
      ...p,
      csat: Math.floor(Math.random() * 5) + 1,
      progress: Math.floor(Math.random() * 101),
      sales7: Array.from({ length: 7 }).map(() =>
        Math.floor(Math.random() * 20)
      ),
    }));
  }, [result]);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(enrichedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return enrichedData.slice(start, end);
  }, [page, enrichedData]);

  const handlePageClick = (p) => {
    if (p >= 1 && p <= totalPages) setPage(p);
  };

  const columnHelper = createColumnHelper();
  const columns = useMemo(
    () => [
      columnHelper.accessor("productImage", {
        id: "image",
        header: "Image",
        cell: (info) => (
          <img
            src={info.getValue()}
            alt={info.row.original.productName}
            className="w-12 h-12 rounded-md object-cover border border-gray-200 dark:border-gray-700"
          />
        ),
      }),
      columnHelper.accessor("productName", {
        header: "Product",
        cell: (info) => (
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("category", {
        header: "Category",
        cell: (info) => (
          <div className="text-gray-700 dark:text-gray-300">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("price", {
        header: "Price",
        cell: (info) => (
          <div className="text-gray-700 dark:text-gray-300">
            ${info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("stock", {
        header: "Stock",
        cell: (info) => <StockIndicator stock={info.getValue()} />,
      }),
      columnHelper.display({
        id: "status",
        header: "Status",
        cell: (info) => (
          <StatusChip status={info.row.original.activeStatus || "inactive"} />
        ),
      }),
      columnHelper.display({
        id: "progress",
        header: "Delivery",
        cell: (info) => <ProgressBar value={info.row.original.progress} />,
      }),
      columnHelper.display({
        id: "spark",
        header: "Sales (7d)",
        cell: (info) => <Sparkline values={info.row.original.sales7} />,
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-blue-600 border-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/30"
              onClick={() => alert(`Edit ${row.original.productName}`)}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 border-red-600 hover:bg-red-50 dark:text-red-400 dark:border-red-400 dark:hover:bg-red-900/30"
              onClick={() => {
                if (confirm(`Delete ${row.original.productName}?`))
                  alert("Deleted (mock)");
              }}
            >
              Delete
            </Button>
          </div>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: paginatedData,
    columns,
    state: { globalFilter, columnVisibility, rowSelection },
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const selectedRows = Object.keys(rowSelection).length;

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-row justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Products
          </h1>
          <Button
            size="lg"
            className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            onClick={() => router.push("/dashboard/products/create")}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Product
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[globalFilter, categoryFilter, statusFilter, priceMin, priceMax].map(
            (val, i) => (
              <Input
                key={i}
                placeholder={
                  [
                    "Search product...",
                    "Category",
                    "Status",
                    "Min price",
                    "Max price",
                  ][i]
                }
                value={val}
                onChange={(e) => {
                  const setters = [
                    setGlobalFilter,
                    setCategoryFilter,
                    setStatusFilter,
                    setPriceMin,
                    setPriceMax,
                  ];
                  setters[i](e.target.value);
                }}
                className="border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
              />
            )
          )}
        </div>

        <div className="flex flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Selected: {selectedRows}
            </span>
            <Button
              variant="destructive"
              size="sm"
              disabled={selectedRows === 0}
              className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
              onClick={() => {
                if (confirm(`Run bulk delete on ${selectedRows} items (mock)?`))
                  alert("Bulk deleted (mock)");
              }}
            >
              Bulk Delete
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <ArrowLeftRight className="h-4 w-4 mr-2" /> View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <DropdownMenuLabel className="text-gray-900 dark:text-gray-100">
                Column Options
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
              {table.getAllLeafColumns().map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  checked={col.getIsVisible()}
                  onCheckedChange={() => col.toggleVisibility()}
                  disabled={col.id === "select" || col.id === "actions"}
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {col.columnDef.header ?? col.id}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white shadow-sm dark:bg-gray-800 transition-colors duration-300">
          <Table className="min-w-full">
            <TableHeader className="bg-gray-100 dark:bg-gray-800">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-b border-gray-200 dark:border-gray-700"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-gray-900 dark:text-gray-100 font-semibold"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {isLoading || isFetching ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow
                    key={i}
                    className="border-b border-gray-200 dark:border-gray-700"
                  >
                    {columns.map((col) => (
                      <TableCell key={col?.id}>
                        <Skeleton className="h-8 w-full bg-gray-200 dark:bg-gray-700" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center py-6 text-gray-500 dark:text-gray-400"
                  >
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell?.id}
                        className="text-gray-700 dark:text-gray-300"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-center items-center mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageClick(page - 1)}
                  className={`${
                    page === 1 ? "pointer-events-none opacity-50" : ""
                  } text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800`}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    isActive={i + 1 === page}
                    onClick={() => handlePageClick(i + 1)}
                    className={`${
                      i + 1 === page
                        ? "bg-blue-600 text-white dark:bg-blue-500 dark:text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    } border-gray-300 dark:border-gray-700`}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageClick(page + 1)}
                  className={`${
                    page === totalPages ? "pointer-events-none opacity-50" : ""
                  } text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
