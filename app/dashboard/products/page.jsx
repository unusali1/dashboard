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


// ---------- Helper small components ----------
const StockIndicator = ({ stock }) => {
  let bg = "bg-green-100 text-green-800";
  if (stock < 10) bg = "bg-red-100 text-red-800";
  else if (stock < 50) bg = "bg-yellow-100 text-yellow-800";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium ${bg}`}>
      {stock} pcs
    </span>
  );
};

const StatusChip = ({ status }) => {
  const active = /active/i.test(status);
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium ${active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
      {active ? "Active" : "Inactive"}
    </span>
  );
};

const EmojiRating = ({ score }) => {
  // score 1-5
  if (score >= 4) return <span className="text-2xl">😀</span>;
  if (score >= 3) return <span className="text-2xl">😐</span>;
  return <span className="text-2xl">😡</span>;
};

const ProgressBar = ({ value }) => {
  const percent = Math.max(0, Math.min(100, value));
  return (
    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
      <div style={{ width: `${percent}%` }} className="h-full rounded-full bg-blue-500" />
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
  const points = values.map((v, i) => `${i * step},${h - ((v - min) / diff) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="inline-block align-middle">
      <polyline fill="none" stroke="#2563eb" strokeWidth="1.5" points={points} />
      <polyline fill="none" stroke="#bfdbfe" strokeWidth="6" strokeLinecap="round" points={points} opacity="0.25" />
    </svg>
  );
};

// ---------- Fetcher (server-side pagination) ----------
const fetchProducts = async ({ queryKey }) => {
  // queryKey = ['products', {page, limit, filters, sort}]
  const [, opts] = queryKey;
  const page = opts?.page || 1;
  const limit = opts?.limit || 10;
  // You can extend to include sort/filter params to get server filtering/sorting
  const url = `https://68f9c1b2ef8b2e621e7d4f9a.mockapi.io/ap1/v1/products?page=${page}&limit=${limit}`;
  const resp = await axios.get(url);
  // mockapi returns just data array; in real server include total count for pagination. We'll fake total from headers if available.
  return { data: resp.data, total: parseInt(resp.headers["x-total-count"]) || 1000 };
};

// ---------- Main Page Component ----------
export default function ProductListPage() {
  // server-side page control
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(10);

  // client-side filters and sorting state (used by table)
  const [globalFilter, setGlobalFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  // column visibility & row selection states (React Table controlled)
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});

  const { data: result, error, isLoading, isFetching } = useQuery({
    queryKey: ["products", { page: pageIndex, limit: pageSize }],
    queryFn: fetchProducts,
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });

  // sample client satisfaction and sales data augmentation (since API doesn't provide them)
  const enrichedData = useMemo(() => {
    if (!result?.data) return [];
    return result.data.map((p) => ({
      ...p,
      // random client satisfaction between 1-5 for demo
      csat: Math.floor(Math.random() * 5) + 1,
      // delivery progress random 0-100
      progress: Math.floor(Math.random() * 101),
      // sales trend last 7 days random
      sales7: Array.from({ length: 7 }).map(() => Math.floor(Math.random() * 20)),
    }));
  }, [result]);

  // Columns definition
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
          <img src={info.getValue()} alt={info.row.original.productName} className="w-10 h-10 rounded-md object-cover" />
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
        cell: (info) => <StatusChip status={info.row.original.activeStatus || "inactive"} />,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Create table instance
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
    globalFilterFn: "includesString", // simple built-in
    debugTable: false,
  });

  // Derived counts for pagination UI (mock total if not provided)
  const totalItems = result?.total ?? 1000;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Apply UI-level filters (category, status, price) by using table.setGlobalFilter or filtering the data before table.
  // Simpler: use globalFilter for search; use JS filtering to adjust table data (we already pass enrichedData through table instance).
  useEffect(() => {
    // create combined global filter string
    const combined = [
      globalFilter || "",
      categoryFilter || "",
      statusFilter || "",
      priceMin || "",
      priceMax || "",
    ].join(" ");
    table.setGlobalFilter(combined);
    // For more advanced per-column filtering integrate with columnFilters state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalFilter, categoryFilter, statusFilter, priceMin, priceMax]);

  // Bulk actions
  const selectedRows = Object.keys(rowSelection).length;

  return (
    <div className="w-full min-h-screen bg-white">
      <Navbar />
      <div className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-semibold">Products</h1>

          <div className="flex gap-2 items-center">
            <div className="text-sm">Columns:</div>
            {/* Column toggles */}
            <div className="flex gap-1 flex-wrap items-center">
              {table.getAllLeafColumns().map((col) => (
                <label key={col.id} className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={col.getIsVisible()}
                    onChange={() => col.toggleVisibility(!col.getIsVisible())}
                    className="form-checkbox"
                  />
                  <span className="ml-1">{col.columnDef.header ?? col.id}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-6 gap-3">
          <input
            placeholder="Search product..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="md:col-span-2 p-2 border rounded"
          />
          <input
            placeholder="Category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-2 border rounded"
          />
          <input
            placeholder="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border rounded"
          />
          <div className="flex gap-2 items-center">
            <input
              placeholder="Min price"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              className="p-2 border rounded w-full"
              type="number"
            />
            <input
              placeholder="Max price"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              className="p-2 border rounded w-full"
              type="number"
            />
          </div>
        </div>

        {/* Bulk actions + pagination info */}
        <div className="mt-4 flex flex-col md:flex-row md:justify-between items-start md:items-center gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sm">Selected: {selectedRows}</span>
            <button
              disabled={selectedRows === 0}
              onClick={() => {
                if (confirm(`Run bulk delete on ${selectedRows} items (mock)?`)) {
                  alert("Bulk deleted (mock)");
                }
              }}
              className="px-3 py-1 bg-red-600 text-white rounded disabled:opacity-50"
            >
              Bulk Delete
            </button>
            <button
              onClick={() => {
                // Example: toggle visibility of image column
                const col = table.getColumn("image");
                if (col) col.toggleVisibility(!col.getIsVisible());
              }}
              className="px-3 py-1 bg-gray-200 rounded"
            >
              Toggle Image
            </button>
          </div>

          <div className="text-sm">
            Page {pageIndex} of {totalPages} {isFetching ? " (loading...)" : ""}
          </div>
        </div>

        {/* Table */}
        <div className="mt-4 overflow-auto border rounded">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-3 py-2 text-left text-sm font-medium">
                      {header.isPlaceholder ? null : (
                        <div
                          className="flex items-center gap-2"
                          onClick={header.column.getToggleSortingHandler?.()}
                          style={{ cursor: header.column.getCanSort() ? "pointer" : "default" }}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: " 🔼",
                            desc: " 🔽",
                          }[header.column.getIsSorted() ?? ""] ?? null}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody className="bg-white divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="p-6 text-center">
                    Loading...
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="p-6 text-center">
                    No products found.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3 py-2 align-middle text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
              disabled={pageIndex === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() => setPageIndex((p) => Math.min(totalPages, p + 1))}
              disabled={pageIndex === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
            <span className="text-sm ml-2">
              Go to page:
              <input
                type="number"
                min={1}
                max={totalPages}
                value={pageIndex}
                onChange={(e) => {
                  const v = e.target.value ? Number(e.target.value) : 1;
                  setPageIndex(Math.max(1, Math.min(totalPages, v)));
                }}
                className="w-20 ml-2 p-1 border rounded"
              />
            </span>
          </div>

          <div className="text-sm">
            Showing {enrichedData.length} products on this page • Total items (approx): {totalItems}
          </div>
        </div>
      </div>
    </div>
  );
}
