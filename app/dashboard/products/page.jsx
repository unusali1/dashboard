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
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeftRight, ChevronDown, Plus } from "lucide-react";

const StockIndicator = ({ stock }) => {
  let bg = "bg-green-100 text-green-800";
  if (stock < 10) bg = "bg-red-100 text-red-800";
  else if (stock < 50) bg = "bg-yellow-100 text-yellow-800";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium ${bg}`}
    >
      {stock} pcs
    </span>
  );
};

const StatusChip = ({ status }) => {
  const active = /active/i.test(status);
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium ${
        active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
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
    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
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
        stroke="#2563eb"
        strokeWidth="1.5"
        points={points}
      />
      <polyline
        fill="none"
        stroke="#bfdbfe"
        strokeWidth="6"
        strokeLinecap="round"
        points={points}
        opacity="0.25"
      />
    </svg>
  );
};

const fetchProducts = async () => {
  const url = `https://68f9c1b2ef8b2e621e7d4f9a.mockapi.io/ap1/v1/products?page`;
  const resp = await axios.get(url);
  return {
    data: resp.data,
    total: parseInt(resp.headers["x-total-count"]) || 1000,
  };
};

export default function ProductListPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const currentPage = page;
  const [globalFilter, setGlobalFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const {
    data: result,
    error,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });

  const totalPages = Math.ceil( result?.data?.length / 10);
  const getPages = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handlePageClick = (page) => {
    if (page !== currentPage) {
       setPage(page);
    }
  };

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

  const columnHelper = createColumnHelper();
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            className="form-checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            className="form-checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
      }),
      columnHelper.accessor("productImage", {
        id: "image",
        header: "Image",
        cell: (info) => (
          <img
            src={info.getValue()}
            alt={info.row.original.productName}
            className="w-10 h-10 rounded-md object-cover"
          />
        ),
      }),
      columnHelper.accessor("productName", {
        header: "Product",
        cell: (info) => <div className="font-medium">{info.getValue()}</div>,
        enableSorting: true,
      }),
      columnHelper.accessor("category", {
        header: "Category",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("sku", {
        header: "SKU",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("price", {
        header: "Price",
        cell: (info) => <div>${info.getValue()}</div>,
        enableSorting: true,
      }),
      columnHelper.accessor("stock", {
        header: "Stock",
        cell: (info) => <StockIndicator stock={info.getValue()} />,
        enableSorting: true,
      }),
      columnHelper.display({
        id: "status",
        header: "Status",
        cell: (info) => (
          <StatusChip status={info.row.original.activeStatus || "inactive"} />
        ),
      }),
      columnHelper.display({
        id: "csat",
        header: "Client",
        cell: (info) => <EmojiRating score={info.row.original.csat} />,
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
            <button
              className="text-sm px-2 py-1 bg-blue-600 text-white rounded-md"
              onClick={() => alert(`Edit ${row.original.productName}`)}
            >
              Edit
            </button>
            <button
              className="text-sm px-2 py-1 bg-red-100 text-red-700 rounded-md"
              onClick={() => {
                if (confirm(`Delete ${row.original.productName}?`)) {
                  alert("Deleted (mock)");
                }
              }}
            >
              Delete
            </button>
          </div>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: enrichedData,
    columns,
    state: {
      globalFilter,
      columnVisibility,
      rowSelection,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
    globalFilterFn: "includesString",
    debugTable: false,
  });


  useEffect(() => {
    const combined = [
      globalFilter || "",
      categoryFilter || "",
      statusFilter || "",
      priceMin || "",
      priceMax || "",
    ].join(" ");
    table.setGlobalFilter(combined);
  }, [globalFilter, categoryFilter, statusFilter, priceMin, priceMax]);

  const selectedRows = Object.keys(rowSelection).length;

  return (
    <div className="w-full min-h-screen bg-white">
      <Navbar />
      <div className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-semibold">Products</h1>

          <div className="flex gap-2 items-center">
            <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/products/create")}>
              <Plus /> Add Product
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <Input
            placeholder="Search product..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="md:col-span-2"
          />
          <Input
            placeholder="Category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          />
          <Input
            placeholder="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />

          <Input
            placeholder="Min price"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            type="number"
          />
          <Input
            placeholder="Max price"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            type="number"
          />
        </div>

        {/* Bulk actions + Column toggle */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm">Selected: {selectedRows}</span>
            <Button
              variant="destructive"
              disabled={selectedRows === 0}
              onClick={() => {
                if (
                  confirm(`Run bulk delete on ${selectedRows} items (mock)?`)
                ) {
                  alert("Bulk deleted (mock)");
                }
              }}
            >
              Bulk Delete
            </Button>
          </div>

          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Button variant="outline" size="sm">
                    <ArrowLeftRight /> View
                  </Button>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Column Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table.getAllLeafColumns().map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    checked={col.getIsVisible()}
                    onCheckedChange={() => col.toggleVisibility()}
                    disabled={col.id === "select" || col.id === "actions"}
                  >
                    {col.columnDef.header ?? col.id}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div
                          className="flex items-center gap-2"
                          onClick={header.column.getToggleSortingHandler?.()}
                          style={{
                            cursor: header.column.getCanSort()
                              ? "pointer"
                              : "default",
                          }}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: <span className="ml-1">↑</span>,
                            desc: <span className="ml-1">↓</span>,
                          }[header.column.getIsSorted() ?? ""] ?? null}
                        </div>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading || isFetching ? (
                Array.from({ length: 10 }).map((_, index) => (
                  <TableRow key={index}>
                    {columns.map((col) => (
                      <TableCell key={col.id} className="px-4 py-3">
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center py-6"
                  >
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-muted/50">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-4 py-3">
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

        {/* Pagination controls */}
        <div className="flex items-center justify-between gap-3">
        <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => handlePageClick(currentPage - 1)}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>

          {getPages().map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                isActive={page === currentPage}
                onClick={() => handlePageClick(page)}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={() => handlePageClick(currentPage + 1)}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
        </div>
      </div>
    </div>
  );
}
