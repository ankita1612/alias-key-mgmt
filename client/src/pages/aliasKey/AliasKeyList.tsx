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
import AliasKeyRow from "./AliasKeyRow";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import apiClient from "../../services/apiClient";

import { AlertTriangle } from "lucide-react";
import { MdClose } from "react-icons/md";

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
function AliasKeyList() {
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
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [showActiveInactiveModal, setShowActiveInactiveModal] = useState(false);
  const [newStatus, setNewStatus] = useState(false);

  const [mobileView, setMobileView] = useState(false);
  const deleteModalRef = useRef<HTMLDivElement>(null);
  const actionModalRef = useRef<HTMLDivElement>(null);
  const actionDetailRef = useRef<HTMLDivElement>(null);
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

      // Action modal
      if (
        showModal &&
        actionModalRef.current &&
        !actionModalRef.current.contains(event.target as Node)
      ) {
        setShowModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDeleteModal, showModal]);
  const handleActionClick = (row: IAliasKey) => {
    setSelectedRow(row);
    setShowModal(true);
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
      setShowModal(false);
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
      const { data } = await apiClient.get(BACKEND_URL + "/api/alias-key", {
        signal: controller.signal,
        params: {
          page,
          limit,
          search,
          sortField,
          sortOrder,
        },
      });
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
    { label: "#", field: "_id", sortable: true },
    ...(isAdmin
      ? [
          { label: "User", field: "user.first_name", sortable: true },
          { label: "Email", field: "user.email", sortable: true },
        ]
      : []),
    { label: "Key", field: "alias_key", sortable: true },
    { label: "Domain Name", field: "domain_name", sortable: true },
    { label: "Status", field: "status", sortable: true },
    { label: "# Quota", field: "total_quota", sortable: true },
    { label: "# Available", field: "remaining_quota", sortable: true },
    { label: "# Hits", field: "", sortable: false },
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
      ? "grid-cols-[40px_1.2fr_1.5fr_2fr_1.5fr_100px_80px_100px_80px_80px_40px]"
      : "grid-cols-[40px_2fr_1.5fr_100px_100px_100px_100px_100px_80px]";
  return (
    <div className="overflow-hidden bg-white border border-gray-200 rounded-md shadow-sm">
      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-4 bg-primary">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          {/* Accent line touching left border */}
          <div className="w-1 h-6 -ml-6 rounded-r-full bg-menuActive" />

          {/* Title */}
          <div>
            <h5 className=" sm:text-xl text-white/60"> Key Management</h5>
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
                  placeholder="Search by key, domain name, status..."
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
              <Link
                to="/alias-key/add"
                className="whitespace-nowrap inline-flex items-center justify-center gap-2 bg-primary hover:bg-primaryHover text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm"
              >
                <FiPlus className="w-4 h-4" />
                Create Key
              </Link>
            </div>
            {/* Table - Responsive with Card View on Mobile */}
            <div className="overflow-hidden ">
              <div className="overflow-hidden bordershadow-sm rounded-xl">
                {/* Header Row */}
                <div
                  className={`grid ${gridColsClass} text-sm font-semibold text-gray-600  px-4 py-3 border-b border-gray-300`}
                >
                  {columns.map((col) => (
                    <div
                      key={col.label}
                      onClick={() => col.sortable && handleSort(col.field)}
                      className={`flex items-center gap-1 text-sm transition-colors duration-200 
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
                    <p className="text-sm font-semibold">No key found</p>
                  </div>
                ) : (
                  apiData.map((item, index) => (
                    <AliasKeyRow
                      key={item._id}
                      index={index}
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
                Delete Confirmation
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
            <div className="flex flex-col-reverse gap-3 px-6 pb-4 sm:flex-row">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2.5 text-sm font-medium bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                Delete Permanently
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
              actionDetailRef.current &&
              !actionDetailRef.current.contains(e.target)
            ) {
              setShowDetailModal(false);
            }
          }}
        >
          {/* Modal */}
          <div
            ref={actionDetailRef}
            className="relative w-full max-w-4xl max-h-[90vh] flex flex-col transition-all duration-300 transform bg-white shadow-2xl rounded-2xl animate-in fade-in zoom-in-95"
          >
            <button
              onClick={() => setShowDetailModal(false)}
              className="absolute z-10 flex items-center justify-center w-10 h-10 transition-all duration-200 bg-white top-4 right-4 hover:text-gray-600 hover:bg-gray-100 group"
            >
              <MdClose className="w-5 h-5 transition-transform group-hover:scale-110" />
            </button>

            {/* Header - Kept as requested */}

            <div className="flex items-center justify-between px-6 py-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">
                Key Details
              </h2>
            </div>

            <div className="flex-1 px-6 py-4 overflow-y-auto">
              {/* Key Information Section */}
              <div className="mb-6 overflow-hidden border border-gray-200 rounded-xl">
                <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
                  <h4 className="text-sm font-semibold tracking-wider text-gray-700 uppercase">
                    Key Information
                  </h4>
                </div>
                <div className="p-5 space-y-5">
                  {/* Key */}
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-500">
                      Key
                    </label>
                    <p className="p-3 font-mono text-sm font-semibold text-gray-900 break-all rounded-lg bg-gray-50">
                      {selectedRow?.alias_key || "-"}
                    </p>
                  </div>

                  {/* Project Name */}
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-500">
                      Project Name
                    </label>
                    <p className="p-3 text-sm text-gray-900 break-words rounded-lg bg-gray-50">
                      {selectedRow?.project_name || "-"}
                    </p>
                  </div>

                  {/* Domain Name */}
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-500">
                      Domain Name
                    </label>
                    <p className="p-3 text-sm text-gray-900 break-words rounded-lg bg-gray-50">
                      {selectedRow?.domain_name || "-"}
                    </p>
                  </div>

                  {/* Quota Information - 3 columns grid */}
                  <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-3">
                    <div className="p-4 text-center rounded-lg bg-blue-50">
                      <p className="text-sm font-semibold tracking-wider text-blue-600 uppercase">
                        Total Quota
                      </p>
                      <p className="mt-2 text-2xl font-bold text-blue-700">
                        {selectedRow?.total_quota?.toLocaleString() || "-"}
                      </p>
                    </div>
                    <div className="p-4 text-center rounded-lg bg-green-50">
                      <p className="text-sm font-semibold tracking-wider text-green-600 uppercase">
                        Remaining Quota
                      </p>
                      <p className="mt-2 text-2xl font-bold text-green-700">
                        {selectedRow?.remaining_quota?.toLocaleString() || "-"}
                      </p>
                    </div>
                    <div className="p-4 text-center rounded-lg bg-amber-50">
                      <p className="text-sm font-semibold tracking-wider uppercase text-amber-600">
                        Total Cost
                      </p>
                      <p className="mt-2 text-2xl font-bold text-amber-700">
                        $
                        {selectedRow?.total_estimated_cost?.toLocaleString() ||
                          "-"}
                      </p>
                    </div>
                  </div>

                  {/* Cost Calculation */}
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-500">
                      Cost Calculation
                    </label>
                    <div className="p-3 overflow-y-auto text-sm text-gray-700 break-words whitespace-pre-wrap rounded-lg bg-gray-50 max-h-48">
                      {selectedRow?.cost_calculation || "-"}
                    </div>
                  </div>

                  {/* Purpose */}
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-500">
                      Purpose
                    </label>
                    <div className="p-3 overflow-y-auto text-sm text-gray-700 break-words whitespace-pre-wrap rounded-lg bg-gray-50 max-h-48">
                      {selectedRow?.description || "-"}
                    </div>
                  </div>

                  {/* Proxy Permission */}
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-500">
                      Proxy Permission Required
                    </label>
                    <p className="p-3 text-sm font-semibold text-gray-900 rounded-lg bg-gray-50">
                      {selectedRow?.proxy_permission_required || "-"}
                    </p>
                  </div>

                  {/* Current Status */}
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-500">
                      Current Status
                    </label>
                    <div>
                      <span
                        className={`inline-flex px-3 py-1.5 text-sm font-semibold rounded-full ${
                          selectedRow?.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : selectedRow?.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {selectedRow?.status || "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Proxy Details Section */}
              {selectedRow?.proxy && (
                <div className="mb-6 overflow-hidden border border-gray-200 rounded-xl">
                  <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
                    <h4 className="text-sm font-semibold tracking-wider text-gray-700 uppercase">
                      Proxy Configuration
                    </h4>
                  </div>
                  <div className="p-5 space-y-5">
                    {/* Proxy Name */}
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-500">
                        Proxy Name
                      </label>
                      <p className="p-3 text-sm font-semibold text-gray-900 break-all rounded-lg bg-gray-50">
                        {selectedRow.proxy?.proxy_name || "-"}
                      </p>
                    </div>

                    {/* URL */}
                    {["Active", "Inactive"].includes(selectedRow.status) &&
                      selectedRow.proxy?.query_params &&
                      Object.keys(selectedRow.proxy.query_params).length >
                        0 && (
                        <div>
                          <div className="overflow-hidden bg-gray-900 rounded-lg">
                            <div className="p-4 overflow-auto text-sm text-gray-200 whitespace-pre-wrap max-h-96">
                              {!liveUrl && "No proxy data"}

                              {typeof liveUrl === "string" && liveUrl && (
                                <div className="mb-3 font-mono text-sm break-all">
                                  <span className="font-semibold text-blue-400">
                                    URL:
                                  </span>{" "}
                                  <span className="text-gray-300">
                                    {liveUrl}
                                  </span>
                                </div>
                              )}

                              {typeof liveUrl === "object" && liveUrl && (
                                <>
                                  <div className="mb-3 font-mono text-sm break-all">
                                    <span className="font-semibold text-blue-400">
                                      URL:
                                    </span>{" "}
                                    <span className="text-gray-300">
                                      {liveUrl.url}
                                    </span>
                                  </div>
                                  <div className="mb-2 font-mono text-sm font-semibold text-blue-400">
                                    Body:
                                  </div>
                                  <pre className="font-mono text-sm text-gray-300 whitespace-pre-wrap">
                                    {liveUrl.body}
                                  </pre>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              )}

              {/* Proxy Deleted Alert */}
              {selectedRow.proxy?.is_deleted === true && (
                <div className="p-4 border-l-4 border-red-500 rounded-md bg-red-50">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FiAlertCircle className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Proxy Deleted
                      </h3>
                      <div className="mt-1 text-sm text-red-700">
                        This proxy has been marked as deleted
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200"></div>

            {/* Actions */}
            <div className="px-6 py-4 border-t border-slate-200">
              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>{" "}
            </div>
          </div>
        </div>
      )}
      {showModal && selectedRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 bg-black/60 backdrop-blur-md">
          {/* Modal */}
          <div
            ref={actionModalRef}
            className="relative w-full max-w-4xl overflow-y-auto max-h-[90vh] transition-all duration-300 transform bg-white shadow-2xl rounded-2xl animate-in fade-in zoom-in-95"
          >
            {/* Close Icon */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute z-10 flex items-center justify-center w-10 h-10 transition-all duration-200 bg-white top-4 right-4 hover:text-gray-600 hover:bg-gray-100 group"
            >
              <MdClose className="w-5 h-5 transition-transform group-hover:scale-110" />
            </button>

            {/* Header */}

            <div className="flex items-center justify-between px-6 py-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">
                Review Key Activation Request
              </h2>
            </div>
            {/* Key Details Card */}
            <div className="flex-1 px-6 py-4 overflow-y-auto">
              <h4 className="mb-3 text-sm font-semibold tracking-wider text-gray-500 uppercase">
                Request Details
              </h4>

              <div className="space-y-4">
                {/* Requested By - Short field */}
                {selectedRow?.user_id && (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-2 min-w-[160px]">
                      <User className="flex-shrink-0 w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Requested By
                      </span>
                    </div>
                    <span className="flex-1 text-sm font-medium text-gray-800 break-words">
                      {selectedRow.user?.first_name ||
                        selectedRow.user?.name ||
                        "-"}
                    </span>
                  </div>
                )}

                {/* Project Name */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-2 min-w-[160px]">
                    <FolderOpen className="flex-shrink-0 w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Project Name</span>
                  </div>
                  <span className="flex-1 text-sm font-medium text-gray-800 break-words">
                    {selectedRow?.project_name || "-"}
                  </span>
                </div>

                {/* Domain Name */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-2 min-w-[160px]">
                    <Globe className="flex-shrink-0 w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Domain Name</span>
                  </div>
                  <span className="flex-1 text-sm font-medium text-gray-800 break-words">
                    {selectedRow?.domain_name || "-"}
                  </span>
                </div>

                {/* Total Quota */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-2 min-w-[160px]">
                    <TrendingUp className="flex-shrink-0 w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Total Quota</span>
                  </div>
                  <span className="flex-1 text-sm font-medium text-green-600 break-words">
                    {selectedRow?.total_quota?.toLocaleString() || "-"}
                  </span>
                </div>

                {/* Cost Calculation - Long text area */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                  <div className="flex items-center gap-2 min-w-[160px]">
                    <Calculator className="flex-shrink-0 w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Cost Calculation
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto text-sm font-medium text-gray-800 break-words rounded-lg max-h-48">
                    {selectedRow?.cost_calculation || "-"}
                  </div>
                </div>

                {/* Total Estimated Cost */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-2 min-w-[160px]">
                    <DollarSign className="flex-shrink-0 w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Total Estimated Cost
                    </span>
                  </div>
                  <span className="flex-1 text-sm font-semibold break-words">
                    $
                    {selectedRow?.total_estimated_cost?.toLocaleString() || "-"}
                  </span>
                </div>

                {/* Proxy Permission Required */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-2 min-w-[160px]">
                    <Shield className="flex-shrink-0 w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Proxy Permission Required
                    </span>
                  </div>
                  <span className="flex-1 text-sm font-medium text-gray-800 break-words">
                    {selectedRow?.proxy_permission_required || "-"}
                  </span>
                </div>

                {/* Purpose - Long text area */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                  <div className="flex items-center gap-2 min-w-[160px]">
                    <FileText className="flex-shrink-0 w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Purpose</span>
                  </div>
                  <div className="overflow-y-auto text-sm text-gray-700 break-words whitespace-pre-wrap rounded-lg flex-1p-3 max-h-48">
                    {selectedRow?.description || "-"}
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="px-6 py-2 border-t border-slate-200"></div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 px-6 pb-4 sm:flex-row">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200"
              >
                Cancel
              </button>

              <button
                onClick={() => handleApprove("Rejected")}
                className="flex-1 px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>

              <button
                onClick={() => handleApprove("Active")}
                disabled={loading}
                className="flex-1 px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </>
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
            ref={actionModalRef}
            className="relative w-full max-w-lg overflow-hidden transition-all duration-300 transform bg-white shadow-2xl rounded-2xl animate-in fade-in zoom-in-95"
          >
            {/* Close Icon */}
            <button
              onClick={() => setShowActiveInactiveModal(false)}
              className="absolute z-10 flex items-center justify-center w-10 h-10 transition-all duration-200 bg-white top-4 right-4 hover:text-gray-600 hover:bg-gray-100 group"
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
            <div className="flex flex-col-reverse gap-3 px-6 pb-4 sm:flex-row">
              <button
                onClick={() => setShowActiveInactiveModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium transition-all duration-200 bg-gray-100 rounded-xl text-gray-700 hover:bg-gray-200 hover:shadow-md active:scale-95"
              >
                Cancel
              </button>

              <button
                onClick={() => handleActiveInactive(newStatus)}
                disabled={loading}
                className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 ${
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

export default AliasKeyList;
