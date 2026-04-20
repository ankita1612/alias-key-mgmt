import React, { useState, useEffect, useCallback, useRef } from "react";
import { MdFirstPage, MdLastPage } from "react-icons/md";

import {
  User,
  FolderOpen,
  Globe,
  TrendingUp,
  Calculator,
  DollarSign,
  Shield,
  FileText,
  XCircle,
  CheckCircle,
} from "lucide-react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiSearch,
  FiPlus,
  FiArrowUp,
  FiArrowDown,
  FiAlertCircle,
} from "react-icons/fi";

import { Link, useLocation } from "react-router-dom";
import type { IAliasKey } from "../../interface/aliasKey.interface";
import KeyMonitorRow from "./KeyMonitorRow";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import apiClient from "../../services/apiClient";

import { AlertTriangle } from "lucide-react";
import { MdClose } from "react-icons/md";
const getStatusStyle = (status?: string) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "bg-green-50 text-green-700";
    case "inactive":
      return "bg-gray-100 text-gray-600";
    case "pending":
      return "bg-yellow-50 text-yellow-700";
    case "rejected":
      return "bg-red-50 text-red-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};
const API_URL = import.meta.env.VITE_BACKEND_URL + "/api/get-proxy-response";
function generatePostProxyData(curl: string, curl_token: string) {
  try {
    // ✅ Extract ALL quoted parts
    const matches = curl.match(/'(.*?)'/g);

    if (!matches || matches.length < 2) {
      return { url: "", body: "" };
    }

    // ✅ Last match = URL
    const url = API_URL;
    // ✅ Second last match = BODY
    const jsonStr = matches[matches.length - 2].replace(/'/g, "");
    try {
      const json = JSON.parse(jsonStr);
      // ✅ Remove original token
      if (json.hasOwnProperty(curl_token)) {
        delete json[curl_token];
      }
      // ✅ Add alias_key
      json["alias_key"] = "Please enter alias key";

      return {
        url,
        body: JSON.stringify(json, null, 2),
      };
    } catch {
      return { url, body: jsonStr };
    }
  } catch {
    return { url: "", body: "" };
  }
}
function generateGetProxyUrl(curl: string, curl_token: string) {
  try {
    const urlMatch = curl.match(/'(.*?)'/);

    if (!urlMatch || !urlMatch[1]) return "";

    const originalUrl = urlMatch[1];
    const url = new URL(originalUrl);

    // ✅ Remove original token
    if (url.searchParams.has(curl_token)) {
      url.searchParams.delete(curl_token);
    }

    // ✅ Build new params
    const newParams = new URLSearchParams();

    // Add alias_key first
    newParams.set("alias_key", "Please enter alias key");

    // Add remaining params
    url.searchParams.forEach((value, key) => {
      newParams.set(key, value);
    });

    // ✅ Final proxy URL
    return `${API_URL}?${newParams.toString()}`;
  } catch (err) {
    console.error("Error generating proxy URL");
    return "";
  }
}
function generateProxyUrl(curl: string, curl_token: string) {
  if (!curl) return "";

  const lowerCurl = curl.toLowerCase();

  // ✅ Detect POST
  if (lowerCurl.includes("--request post") || lowerCurl.includes("--data")) {
    return generatePostProxyData(curl, curl_token);
  }

  // ✅ Default = GET
  return generateGetProxyUrl(curl, curl_token);
}
function KeyMonitorActive() {
  const { user } = useAuth();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [apiData, setApiData] = useState<IAliasKey[]>([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [total, setTotal] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("_id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedRow, setSelectedRow] = useState<IAliasKey | null>(null);
  const [showPendingRejectedModal, setShowPendingRejectedModal] =
    useState(false);
  const showPendingRejectedRef = useRef<HTMLInputElement>(null);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const showDetailRef = useRef<HTMLDivElement>(null);

  const [showActiveInactiveModal, setShowActiveInactiveModal] = useState(false);
  const showActiveInactiveModalRef = useRef<HTMLDivElement>(null);

  const [newStatus, setNewStatus] = useState(false);

  const [mobileView, setMobileView] = useState(false);
  const deleteModalRef = useRef<HTMLDivElement>(null);

  const [liveUrl, setLiveUrl] = useState("");
  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(Number(e.target.value));
    setPage(1); // reset to first page
  };
  // Check screen size for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setMobileView(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Delete modal
      if (
        showDeleteModal &&
        deleteModalRef.current &&
        !deleteModalRef.current.contains(event.target as Node)
      ) {
        setShowDeleteModal(false);
      }

      if (
        showPendingRejectedModal &&
        showPendingRejectedRef.current &&
        !showPendingRejectedRef.current.contains(event.target as Node)
      ) {
        setShowPendingRejectedModal(false);
      }

      //
      if (
        showActiveInactiveModal &&
        showActiveInactiveModalRef.current &&
        !showActiveInactiveModalRef.current.contains(event.target as Node)
      ) {
        setShowActiveInactiveModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDeleteModal, showPendingRejectedModal, showActiveInactiveModal]);
  const handleActionClick = (row: IAliasKey) => {
    setSelectedRow(row);
    setShowPendingRejectedModal(true);
  };
  const handleshowKeyDetail = (row: IAliasKey) => {
    setSelectedRow(row);
    setShowDetailModal(true);

    const proxyResult = row?.proxy
      ? generateProxyUrl(row.proxy.curl || "", row.proxy.curl_token || "")
      : null;
    setLiveUrl(proxyResult);
  };
  const handleActiveInactiveClick = (row: IAliasKey, newStatus: string) => {
    setSelectedRow(row);

    setNewStatus(newStatus);
    setShowActiveInactiveModal(true);
  };
  const handleApprove = async (action: string) => {
    try {
      setLoading(true);
      const userData = {
        id: selectedRow?._id,
        action: action,
      };
      const response = await apiClient.post(
        "/api/alias-key/perform-action",
        userData,
      );
      toast.success(response?.data?.message);
      fetchData();
      setShowPendingRejectedModal(false);
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  const handleActiveInactive = async (action: string) => {
    try {
      setLoading(true);
      const userData = {
        id: selectedRow?._id,
        action: action,
      };
      const response = await apiClient.post(
        "/api/alias-key/make-active-inactive",
        userData,
      );
      toast.success(response?.data?.message);
      fetchData();
      setShowActiveInactiveModal(false);
      setNewStatus("");
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  const fetchData = useCallback(async () => {
    const controller = new AbortController();
    setLoading(true);
    try {
      const { data } = await apiClient.get(
        BACKEND_URL + "/api/alias-key/key-monotor",
        {
          signal: controller.signal,
          params: {
            page,
            limit,
            search,
            sortField,
            sortOrder,
          },
        },
      );
      setApiData(data.data);
      setTotal(data.pagination.total);
    } catch (error: any) {
      if (error.name !== "CanceledError") {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to load data",
        );
      }
    } finally {
      setLoading(false);
    }
    return () => controller.abort();
  }, [page, limit, search, sortField, sortOrder]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };
  const handleConfirmDelete = async () => {
    if (!deleteId) return;

    const previousData = apiData;
    setApiData((prev) => prev.filter((p) => p._id !== deleteId));

    try {
      const res = await apiClient.delete(
        `${BACKEND_URL}/api/alias-key/${deleteId}`,
      );
      toast.success(res.data.message);
    } catch (error: any) {
      setApiData(previousData);
      toast.error(error.response?.data?.message || "Delete failed");
    } finally {
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  useEffect(() => {
    if (searchRef.current) {
      searchRef.current.focus();
    }
  }, [apiData]);

  const isAdmin = user?.role === "Admin";

  const columns = [
    { label: "No.", field: "_id", sortable: true },
    // ...(isAdmin
    //   ? [
    //       { label: "User", field: "user.first_name", sortable: true },
    //       { label: "Email", field: "user.email", sortable: true },
    //     ]
    //   : []),
    { label: "Key", field: "alias_key", sortable: true },
    { label: "Domain Name", field: "domain_name", sortable: true },
    { label: "Status", field: "status", sortable: true },
    { label: "Total Quota", field: "total_quota", sortable: true },
    { label: "Available", field: "remaining_quota", sortable: true },
    { label: "Total Hits", field: "", sortable: false },
    { label: "Created", field: "createdAt", sortable: true },
  ];

  // Responsive grid columns based on screen size and admin status
  const getGridCols = () => {
    if (mobileView) return "grid-cols-1"; // Card view on mobile
    const baseCols = isAdmin ? 10 : 8;
    return `grid-cols-${baseCols}`;
  };
  const gridColsClass =
    user?.role === "Admin"
      ? "grid-cols-[40px_2fr_1.5fr_100px_100px_100px_100px_100px_60px]"
      : "grid-cols-[40px_2fr_1.5fr_100px_100px_100px_100px_100px_60px]";
  return (
    <div className="overflow-hidden bg-white border border-gray-200 rounded-md shadow-sm">
      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-3 bg-primary">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          {/* Accent line touching left border */}
          <div className="w-1 h-6 -ml-6 rounded-r-full bg-menuActive" />

          {/* Title */}
          <div>
            <h5 className=" sm:text-xl text-white/60"> Key Monitor</h5>
          </div>
        </div>
      </div>
      <div className="p-5 sm:p-6">
        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 mb-5 sm:flex-row sm:items-center sm:justify-between">
              {/* Search - Responsive */}
              <div className="relative w-full sm:w-80">
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search by request method, time, status..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-10 py-2.5 text-sm shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
                />

                <FiSearch className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />

                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      searchRef.current?.focus();
                    }}
                    className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
                  >
                    <MdClose size={18} />
                  </button>
                )}
              </div>
              {/* Button */}
              {user?.role == "User" && (
                <Link
                  to="/alias-key/add"
                  className="whitespace-nowrap inline-flex items-center justify-center gap-2 bg-primary hover:bg-primaryHover text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm"
                >
                  <FiPlus className="w-4 h-4" />
                  Create Key
                </Link>
              )}
            </div>
            {/* Table - Responsive with Card View on Mobile */}
            <div className="overflow-hidden ">
              <div className="overflow-hidden bordershadow-sm rounded-xl">
                {/* Header Row */}
                <div
                  className={`grid ${gridColsClass} text-sm font-semibold text-gray-900  px-4 py-3 border-b border-gray-300`}
                >
                  {columns.map((col) => (
                    <div
                      key={col.label}
                      onClick={() => col.sortable && handleSort(col.field)}
                      className={`flex items-center  text-sm transition-colors duration-200 
      ${col.sortable ? "cursor-pointer hover:text-primary" : "cursor-default"}
    `}
                    >
                      {col.label}

                      {col.sortable && sortField === col.field && (
                        <span className="text-sm text-primary">
                          {sortOrder === "asc" ? (
                            <FiArrowUp />
                          ) : (
                            <FiArrowDown />
                          )}
                        </span>
                      )}
                    </div>
                  ))}
                  <div className="text-sm text-center">Actions</div>
                </div>

                {/* Rows */}
                {apiData.length === 0 ? (
                  <div className="py-10 text-center text-gray-600">
                    <p className="text-sm font-semibold">No data found</p>
                  </div>
                ) : (
                  apiData.map((item, index) => (
                    <KeyMonitorRow
                      key={item._id}
                      index={index}
                      page={page}
                      limit={limit}
                      apiData={item}
                      handleDelete={handleDeleteClick}
                      userRole={user?.role}
                      onActionClick={handleActionClick}
                      makeActiveInactiveClick={handleActiveInactiveClick}
                      mobileView={false}
                      gridColsClass={gridColsClass}
                      showKeyDetail={handleshowKeyDetail}
                    />
                  ))
                )}
              </div>
            </div>

            {total > limit && (
              <div className="flex justify-end mt-8">
                <div className="flex items-center gap-4">
                  {/* 1️⃣ LIMIT DROPDOWN */}
                  <div className="flex items-center gap-0 pr-4 text-xs text-gray-500">
                    <span>Rows Per Page :</span>
                    <select
                      value={limit}
                      onChange={handleLimitChange}
                      className="px-1 py-1 text-gray-500 rounded-md focus:outline-none focus:ring-2"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                  {/* Page info */}
                  <div className="pr-4 text-xs text-gray-500 whitespace-nowrap">
                    <span>{Math.min((page - 1) * limit + 1, total)}</span>-
                    <span>{Math.min(page * limit, total)}</span> of{" "}
                    <span>{total}</span>{" "}
                  </div>

                  {/* Pagination controls */}
                  <div className="flex items-center gap-3 text-xs">
                    {/* First */}
                    <button
                      onClick={() => setPage(1)}
                      disabled={page === 1}
                      className="text-gray-600 hover:text-gray-500 disabled:opacity-40"
                    >
                      <MdFirstPage size={25} />
                    </button>

                    {/* Previous */}
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="text-gray-600 hover:text-gray-500 disabled:opacity-40"
                    >
                      <FiChevronLeft size={22} />
                    </button>

                    {/* Next */}
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page === Math.ceil(total / limit)}
                      className="text-gray-600 hover:text-gray-500 disabled:opacity-40"
                    >
                      <FiChevronRight size={22} />
                    </button>

                    {/* Last */}
                    <button
                      onClick={() => setPage(Math.ceil(total / limit))}
                      disabled={page === Math.ceil(total / limit)}
                      className="text-gray-600 hover:text-gray-500 disabled:opacity-40"
                    >
                      <MdLastPage size={25} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 bg-black/60 backdrop-blur-md">
          {/* Modal */}
          <div
            ref={deleteModalRef}
            className="relative w-full max-w-lg  max-h-[90vh] flex flex-col transition-all duration-300 transform bg-white shadow-2xl rounded-2xl animate-in fade-in zoom-in-95"
          >
            {/* Close Icon */}
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute z-10 flex items-center justify-center w-10 h-10 transition-all duration-200 bg-white top-4 right-4 hover:text-gray-600 hover:bg-gray-100 group"
            >
              <MdClose className="w-5 h-5 transition-transform group-hover:scale-110" />
            </button>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">
                Key Delete
              </h2>
            </div>

            {/* Warning Content */}
            <div className="flex-1 px-6 py-4 overflow-y-auto">
              <p className="text-sm font-normal">
                Are you sure you want to delete key?
              </p>
            </div>

            {/* Divider */}
            <div className="px-6 py-2 border-t border-slate-200"></div>

            {/* Actions */}
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 transition bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition bg-red-500 rounded-md hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal - Responsive */}
      {showDetailModal && selectedRow && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 bg-black/60 backdrop-blur-md"
          onClick={(e) => {
            if (
              showDetailRef.current &&
              !showDetailRef.current.contains(e.target)
            ) {
              setShowDetailModal(false);
            }
          }}
        >
          {/* Modal */}
          <div
            ref={showDetailRef}
            className="relative w-full max-w-4xl overflow-hidden transition-all duration-300 transform bg-white shadow-2xl rounded-2xl animate-in fade-in zoom-in-95"
          >
            {/* Close Icon */}
            <button
              onClick={() => setShowDetailModal(false)}
              className="absolute z-10 flex items-center justify-center w-10 h-10 transition-all duration-200 bg-white top-4 right-4 hover:text-gray-600 group"
            >
              <MdClose className="w-5 h-5 transition-transform group-hover:scale-110" />
            </button>

            {/* Header - Kept as requested */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">
                Key Details
              </h2>
            </div>

            {/* Content - Simple Layout */}
            <div className="flex-1 px-6 py-5 overflow-y-auto max-h-[55vh] custom-scrollbar">
              {/* Two column grid for better space utilization */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Left Column */}
                <div className="space-y-4">
                  {selectedRow?.user_id && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                        Requested By
                      </label>
                      <p className="text-sm text-gray-800 font-medium">
                        {selectedRow.user?.first_name ||
                          selectedRow.user?.name ||
                          "-"}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Project Name
                    </label>
                    <p className="text-sm text-gray-600">
                      {selectedRow?.project_name || "-"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Status
                    </label>
                    <p
                      className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusStyle(
                        selectedRow?.status,
                      )}`}
                    >
                      {selectedRow?.status
                        ? selectedRow.status.charAt(0).toUpperCase() +
                          selectedRow.status.slice(1).toLowerCase()
                        : "-"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Total Quota
                    </label>
                    <p className="text-lg font-bold text-green-600">
                      {selectedRow?.total_quota?.toLocaleString() || "-"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Created Date
                    </label>
                    <p className="text-sm text-gray-600">
                      {selectedRow?.createdAt
                        ? new Date(selectedRow.createdAt).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )
                        : "-"}
                    </p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Key
                    </label>
                    <p className="text-sm font-mono text-gray-600 break-all bg-gray-50 p-2 rounded-md border border-gray-200">
                      {selectedRow?.alias_key || "-"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Domain Name
                    </label>
                    <p className="text-sm text-gray-600 break-all">
                      {selectedRow?.domain_name || "-"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Proxy Permission Required
                    </label>
                    <p className="text-sm text-gray-600">
                      {selectedRow?.proxy_permission_required || "-"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Total Estimated Cost
                    </label>
                    <p className="text-lg font-bold text-indigo-600">
                      $
                      {selectedRow?.total_estimated_cost?.toLocaleString() ||
                        "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cost Calculation - Full Width */}
              {selectedRow?.cost_calculation && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Cost Calculation
                  </label>
                  <div className="overflow-y-auto text-sm text-gray-600 bg-gray-50 p-3 rounded-lg max-h-32 custom-scrollbar font-mono">
                    {selectedRow?.cost_calculation || "-"}
                  </div>
                </div>
              )}

              {/* Purpose - Full Width */}
              {selectedRow?.description && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Purpose
                  </label>
                  <div className="overflow-y-auto text-sm text-gray-600 bg-gray-50 p-3 rounded-lg max-h-32 custom-scrollbar">
                    {selectedRow?.description || "-"}
                  </div>
                </div>
              )}

              {/* Proxy Configuration Section - Only if proxy exists */}
              {selectedRow?.proxy && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                        Proxy Name
                      </label>
                      <p className="text-sm text-gray-600 font-medium">
                        {selectedRow.proxy?.proxy_name || "-"}
                      </p>
                    </div>

                    {["Active", "Inactive"].includes(selectedRow.status) &&
                      selectedRow.proxy?.query_params &&
                      Object.keys(selectedRow.proxy.query_params).length >
                        0 && (
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Proxy URL
                          </label>
                          <div className="overflow-y-auto text-sm text-gray-600 bg-gray-50 p-3 rounded-lg max-h-48 custom-scrollbar">
                            {!liveUrl && "No proxy data"}
                            {typeof liveUrl === "string" && liveUrl && (
                              <div className="font-mono break-all text-gray-600">
                                {liveUrl}
                              </div>
                            )}
                            {typeof liveUrl === "object" && liveUrl && (
                              <>
                                <div className="mb-2 font-mono text-xs break-all">
                                  <span className="font-semibold text-gray-700">
                                    URL:
                                  </span>{" "}
                                  <span className="text-gray-600">
                                    {liveUrl.url}
                                  </span>
                                </div>
                                <div className="mb-1 font-mono text-xs font-semibold text-gray-700">
                                  Body:
                                </div>
                                <pre className="font-mono text-xs text-gray-600 whitespace-pre-wrap">
                                  {liveUrl.body}
                                </pre>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              )}

              {/* Proxy Deleted Alert */}
              {selectedRow.proxy?.is_deleted === true && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FiAlertCircle className="w-4 h-4 text-red-500" />
                      </div>
                      <div className="ml-2">
                        <h3 className="text-sm font-medium text-red-800">
                          Proxy Deleted
                        </h3>
                        <p className="text-xs text-red-600">
                          This proxy has been marked as deleted
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100"></div>

            {/* Footer - Kept as requested */}
            <div className="flex justify-end px-6 py-4">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-5 py-2 text-sm font-medium text-gray-700 transition-all duration-200 bg-gray-100 rounded-lg hover:bg-gray-200 hover:shadow-sm active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {showPendingRejectedModal && selectedRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 bg-black/60 backdrop-blur-md">
          {/* Modal */}
          <div
            ref={showPendingRejectedRef}
            className="relative w-full max-w-4xl overflow-hidden transition-all duration-300 transform bg-white shadow-2xl rounded-2xl animate-in fade-in zoom-in-95"
          >
            {/* Close Icon */}
            <button
              onClick={() => setShowPendingRejectedModal(false)}
              className="absolute z-10 flex items-center justify-center w-10 h-10 transition-all duration-200 bg-white top-4 right-4 hover:text-gray-600 group"
            >
              <MdClose className="w-4 h-4 transition-transform group-hover:scale-110" />
            </button>

            {/* Header - Kept as requested */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">
                Approve/Reject Request
              </h2>
            </div>

            {/* Content - Improved Layout */}
            <div className="flex-1 px-6 py-5 overflow-y-auto max-h-[55vh] custom-scrollbar">
              {/* Two Column Grid for better layout */}
              <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
                {/* Left Column */}
                <div className="space-y-4">
                  {selectedRow?.user_id && (
                    <div className="group">
                      <label className="block mb-1 text-xs font-medium uppercase">
                        Requested By
                      </label>
                      <p className="text-sm font-medium text-gray-500">
                        {selectedRow.user?.first_name ||
                          selectedRow.user?.name ||
                          "-"}
                      </p>
                    </div>
                  )}

                  <div className="group">
                    <label className="block mb-1 text-xs font-medium uppercase">
                      Project Name
                    </label>
                    <p className="text-sm text-gray-500">
                      {selectedRow?.project_name || "-"}
                    </p>
                  </div>

                  <div className="group">
                    <label className="block mb-1 text-xs font-medium uppercase">
                      Total Quota
                    </label>
                    <p className="text-base font-semibold text-green-600">
                      {selectedRow?.total_quota?.toLocaleString() || "-"}
                    </p>
                  </div>
                  <div className="group">
                    <label className="block mb-1 text-xs font-medium uppercase">
                      Created Date
                    </label>
                    <p className="text-sm text-gray-500">
                      {selectedRow?.createdAt
                        ? new Date(selectedRow.createdAt).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )
                        : "-"}
                    </p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="mt-4 space-y-4 md:mt-0">
                  <div className="group">
                    <label className="block mb-1 text-xs font-medium uppercase">
                      Domain Name
                    </label>
                    <p className="text-sm text-gray-500 break-all">
                      {selectedRow?.domain_name || "-"}
                    </p>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium uppercase">
                      Proxy Permission Required
                    </label>
                    <p className="text-sm text-gray-500">
                      {selectedRow?.proxy_permission_required || "-"}
                    </p>
                  </div>
                  <div className="group">
                    <label className="block mb-1 text-xs font-medium uppercase">
                      Total Estimated Cost
                    </label>
                    <p className="text-base font-semibold text-indigo-600">
                      $
                      {selectedRow?.total_estimated_cost?.toLocaleString() ||
                        "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cost Calculation - Full Width */}
              {selectedRow?.cost_calculation && (
                <div className="pt-2 mt-2 ">
                  <label className="block text-xs font-medium uppercase">
                    Cost Calculation
                  </label>
                  <div className="pt-1 overflow-y-auto text-sm text-gray-500 rounded-lg max-h-32">
                    {selectedRow?.cost_calculation || "-"}
                  </div>
                </div>
              )}

              {/* Purpose - Full Width */}
              {selectedRow?.description && (
                <div className="pt-2 mt-2 ">
                  <label className="block text-xs font-medium uppercase">
                    Purpose
                  </label>
                  <div className="pt-1 overflow-y-auto text-sm text-gray-500 rounded-lg max-h-32">
                    {selectedRow?.description || "-"}
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100"></div>

            {/* Actions - Kept as requested but improved */}
            <div className="flex justify-end gap-3 px-6 py-4">
              <button
                onClick={() => setShowPendingRejectedModal(false)}
                className="px-5 py-2 text-sm font-medium text-gray-700 transition-all duration-200 bg-gray-100 rounded-lg hover:bg-gray-200 hover:shadow-sm active:scale-95"
              >
                Cancel
              </button>

              <button
                onClick={() => handleApprove("Rejected")}
                className="px-5 py-2 text-sm font-medium text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:shadow-sm active:scale-95"
              >
                Reject
              </button>

              <button
                onClick={() => handleApprove("Active")}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:shadow-sm active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  "Approve"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {showActiveInactiveModal && selectedRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 bg-black/60 backdrop-blur-md">
          {/* Modal */}
          <div
            ref={showActiveInactiveModalRef}
            className="relative w-full max-w-lg overflow-hidden transition-all duration-300 transform bg-white shadow-2xl rounded-2xl animate-in fade-in zoom-in-95"
          >
            {/* Close Icon */}
            <button
              onClick={() => setShowActiveInactiveModal(false)}
              className="absolute z-10 flex items-center justify-center w-10 h-10 transition-all duration-200 bg-white top-4 right-4 hover:text-gray-600 group"
            >
              <MdClose className="w-5 h-5 transition-transform group-hover:scale-110" />
            </button>

            {/* Header - Kept as requested */}
            <div className="flex items-center justify-between px-6 py-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">
                Change Status
              </h2>
            </div>
            <div className="flex-1 px-6 py-4 overflow-y-auto">
              {/* Warning Card */}

              <p className="text-sm ">
                Are you sure you want to change the status from{" "}
                <span className="font-bold">
                  {selectedRow.status === "Active" ? "Active" : "Inactive"}
                </span>{" "}
                to <span className="font-bold">{newStatus}</span>?
              </p>
            </div>
            <div className="px-6 py-2 border-t border-slate-200"></div>

            {/* Actions */}
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button
                onClick={() => setShowActiveInactiveModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 transition bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>

              <button
                onClick={() => handleActiveInactive(newStatus)}
                disabled={loading}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition rounded-md ${
                  newStatus === "Active"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <span>Confirm {newStatus}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default KeyMonitorActive;
