import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiSearch,
  FiPlus,
  FiArrowUp,
  FiArrowDown,
} from "react-icons/fi";
import { Copy } from "lucide-react";

import { Link, useLocation } from "react-router-dom";
import type { IProxy } from "../../interface/proxy.interface";
import ProxyRow from "./proxyRow";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import apiClient from "../../services/apiClient";

import {
  AlertTriangle,
  X,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Globe,
  Database,
  FileText,
  User,
} from "lucide-react";
import { MdClose } from "react-icons/md";

function ProxyList() {
  const { user } = useAuth();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [apiData, setApiData] = useState<IProxy[]>([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("_id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedRow, setSelectedRow] = useState<IProxy | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showActiveInactiveModal, setShowActiveInactiveModal] = useState(false);
  const [newStatus, setNewStatus] = useState(false);

  const [mobileView, setMobileView] = useState(false);
  const deleteModalRef = useRef<HTMLDivElement>(null);
  const actionModalRef = useRef<HTMLDivElement>(null);
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
  const handleActionClick = (row: IProxy) => {
    setSelectedRow(row);
    setShowModal(true);
  };
  const handleActiveInactiveClick = (row: IProxy, newStatus: string) => {
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
        "/api/proxy/perform-action",
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
        "/api/proxy/make-active-inactive",
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
      const { data } = await apiClient.get(BACKEND_URL + "/api/proxy", {
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
        `${BACKEND_URL}/api/proxy/${deleteId}`,
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
    { label: "Proxy Name", field: "proxy_name", sortable: true },
    { label: "Proxy Token", field: "proxy_token", sortable: true },
    { label: "Curl", field: "curl", sortable: true },
    { label: "Credit", field: "credit", sortable: true },
    { label: "Created", field: "createdAt", sortable: true },
  ];
  const gridColsClass = "grid-cols-[40px_1.2fr_1.2fr_2fr_80px_100px_80px]";

  return (
    <div className=" border border-gray-300">
      <div className="flex items-center justify-between mb-6 bg-primary px-5 py-4  shadow-sm">
        {/* LEFT SIDE */}
        <div className="flex items-center gap-3">
          {/* Accent Line */}
          <div className="w-1 h-6 rounded-full bg-menuActive" />

          {/* Title */}
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-white tracking-tight">
              Proxy
            </h2>
            <p className="text-xs sm:text-sm text-white/70">
              Manage and monitor your proxies
            </p>
          </div>
        </div>

        {/* RIGHT SIDE (Optional actions) */}
        {/* Example: Add button here later */}
      </div>
      <div className="p-4 bg-white border border-gray-200 shadow-sm rounded-xl sm:p-5">
        {/* Header - Responsive */}

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Search - Responsive */}
            <div className="flex items-center justify-between gap-3 mb-5">
              {/* LEFT SIDE (Search) */}
              <div className="relative w-full sm:w-80">
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search ..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-10 py-2.5 text-sm shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all duration-200"
                />

                {/* Search Icon */}
                <FiSearch className="absolute w-4 h-4 text-gray-400 left-3 top-1/2 -translate-y-1/2" />

                {/* Clear Button */}
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      searchRef.current?.focus();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    <MdClose size={18} />
                  </button>
                )}
              </div>

              {/* RIGHT SIDE (Button) */}
              <Link
                to="/proxy/add"
                className="whitespace-nowrap inline-flex items-center justify-center gap-2 bg-primary hover:bg-primaryHover text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-all duration-200"
              >
                <FiPlus className="w-4 h-4" />
                Create Proxy
              </Link>
            </div>
            {/* Table - Responsive with Card View on Mobile */}
            <div className="overflow-x-auto border border-gray-200 shadow-sm rounded-xl">
              <div className="overflow-hidden border border-gray-200 shadow-sm rounded-xl">
                {/* Header Row */}
                <div
                  className={`grid ${gridColsClass} bg-gradient-to-r from-gray-50 to-gray-100 text-sm font-semibold text-gray-600  px-4 py-3 border-b border-gray-200`}
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
                  <div className="py-10 text-center text-gray-500">
                    <p className="text-sm font-semibold">No proxy found</p>
                    <p className="mt-1 text-sm text-gray-400">
                      Try adjusting your search or filters
                    </p>
                  </div>
                ) : (
                  apiData.map((item, index) => (
                    <ProxyRow
                      key={item._id}
                      index={index}
                      apiData={item}
                      handleDelete={handleDeleteClick}
                      userRole={user?.role}
                      onActionClick={handleActionClick}
                      makeActiveInactiveClick={handleActiveInactiveClick}
                      mobileView={false}
                      gridColsClass={gridColsClass}
                    />
                  ))
                )}
              </div>
            </div>

            {total > limit && (
              <div className="flex flex-col items-center justify-between gap-4 mt-8 sm:flex-row">
                {/* Page info */}
                <div className="text-sm text-gray-600">
                  Showing{" "}
                  <span className="font-semibold text-gray-900">
                    {Math.min((page - 1) * limit + 1, total)}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-gray-900">
                    {Math.min(page * limit, total)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-900">{total}</span>{" "}
                  entries
                </div>

                {/* Pagination controls */}
                <div className="flex items-center gap-1">
                  {/* First Page */}
                  <button
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    className="items-center justify-center hidden text-gray-600 transition-all duration-200 bg-white border border-gray-300 rounded-lg md:flex w-9 h-9 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    title="First page"
                  >
                    <FiChevronsLeft className="w-4 h-4" />
                  </button>

                  {/* Previous */}
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 transition-all duration-200 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <FiChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </button>

                  {/* Page Numbers */}
                  <div className="flex gap-1">
                    {Array.from(
                      { length: Math.min(5, Math.ceil(total / limit)) },
                      (_, i) => {
                        let pageNum;
                        const totalPages = Math.ceil(total / limit);

                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`relative min-w-[36px] h-9 px-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                              page === pageNum
                                ? "bg-gradient-to-r from-primary to-primaryHover text-white shadow-md scale-105"
                                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      },
                    )}
                  </div>

                  {/* Next */}
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === Math.ceil(total / limit)}
                    className="flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 transition-all duration-200 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <FiChevronRight className="w-4 h-4" />
                  </button>

                  {/* Last Page */}
                  <button
                    onClick={() => setPage(Math.ceil(total / limit))}
                    disabled={page === Math.ceil(total / limit)}
                    className="items-center justify-center hidden text-gray-600 transition-all duration-200 bg-white border border-gray-300 rounded-lg md:flex w-9 h-9 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    title="Last page"
                  >
                    <FiChevronsRight className="w-4 h-4" />
                  </button>
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
            className="relative w-full max-w-2xl overflow-hidden transition-all duration-300 transform bg-white shadow-2xl rounded-2xl animate-in fade-in zoom-in-95"
          >
            {/* Close Icon */}
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute z-10 flex items-center justify-center w-10 h-10 text-gray-400 transition-all duration-200 bg-white rounded-full shadow-md top-4 right-4 hover:text-gray-600 hover:bg-gray-100 hover:shadow-lg group"
            >
              <MdClose className="w-5 h-5 transition-transform group-hover:scale-110" />
            </button>

            {/* Header */}
            <div className="px-6 pt-8 pb-4 text-left bg-gradient-to-b from-white to-gray-50">
              <div className="flex items-center gap-3">
                {/* Left Thick Line */}
                <div className="w-1 h-6 rounded-full bg-primary"></div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900">
                  Confirm Delete
                </h3>
              </div>

              <p className="pl-4 mt-1 text-sm text-gray-500">
                This action cannot be undone
              </p>
            </div>

            {/* Warning Content */}
            <div className="px-6 mt-4">
              {/* Warning Card */}
              <div className="p-4 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="space-y-1">
                    <p className="text-lg ">
                      Are you sure you want to delete this proxy?
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Details (if available) */}

              {/* Danger Info Box */}
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-gray-100"></div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 px-6 pb-8 sm:flex-row">
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
      {showModal && selectedRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 bg-black/60 backdrop-blur-md">
          {/* Modal */}
          <div
            ref={actionModalRef}
            className="relative w-full max-w-3xl overflow-hidden transition-all duration-300 transform bg-white shadow-2xl rounded-2xl animate-in fade-in zoom-in-95"
          >
            {/* Close Icon */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute z-10 flex items-center justify-center w-10 h-10 text-gray-400 transition-all duration-200 bg-white rounded-full shadow-md top-4 right-4 hover:text-gray-600 hover:bg-gray-100 hover:shadow-lg group"
            >
              <MdClose className="w-5 h-5 transition-transform group-hover:scale-110" />
            </button>

            {/* Header - Kept as requested */}
            <div className="px-6 pt-8 pb-4 text-left bg-gradient-to-b from-white to-gray-50">
              <div className="flex items-center gap-3">
                {/* Left Thick Line */}
                <div className="w-1 h-6 rounded-full bg-primary"></div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900">
                  Proxy Details
                </h3>
              </div>

              <p className="pl-4 mt-1 text-sm text-gray-500">
                View complete proxy configuration information
              </p>
            </div>

            {/* Proxy Details Grid */}
            <div className="px-6 pt-6 pb-2">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Proxy Name */}
                <div className="p-4 transition-all duration-200 border border-gray-100 rounded-lg bg-gray-50 hover:shadow-md hover:border-gray-200">
                  <label className="block text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Proxy Name
                  </label>
                  <p className="mt-2 text-xs font-semibold text-gray-900 break-all">
                    {selectedRow?.proxy_name || "-"}
                  </p>
                </div>

                {/* Proxy Token */}
                <div className="p-4 transition-all duration-200 border border-gray-100 rounded-lg bg-gray-50 hover:shadow-md hover:border-gray-200">
                  <label className="block text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Proxy Token
                  </label>
                  <p className="mt-2 font-mono text-xs font-semibold text-gray-900 break-all">
                    {selectedRow?.proxy_token || "-"}
                  </p>
                </div>

                {/* Domain Name */}
                <div className="p-4 transition-all duration-200 border border-gray-100 rounded-lg bg-gray-50 hover:shadow-md hover:border-gray-200">
                  <label className="block text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Domain Name
                  </label>
                  <p className="mt-2 text-xs font-semibold text-gray-900 break-all">
                    {selectedRow?.domain_name || "-"}
                  </p>
                </div>

                {/* Project Name */}
                <div className="p-4 transition-all duration-200 border border-gray-100 rounded-lg bg-gray-50 hover:shadow-md hover:border-gray-200">
                  <label className="block text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Project Name
                  </label>
                  <p className="mt-2 text-xs font-semibold text-gray-900">
                    {selectedRow?.project_name || "-"}
                  </p>
                </div>

                {/* Credit */}
                <div className="p-4 transition-all duration-200 border border-gray-100 rounded-lg bg-gray-50 hover:shadow-md hover:border-gray-200">
                  <label className="block text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Credit
                  </label>
                  <p className="mt-2 text-2xl font-bold text-blue-600">
                    {selectedRow?.credit || "0"}
                  </p>
                </div>
              </div>

              {/* Curl Section - Full Width */}
              {selectedRow?.curl && selectedRow.curl !== "-" && (
                <div className="mt-4 overflow-hidden border border-gray-100 rounded-lg bg-gray-50">
                  <div className="px-4 py-3 bg-gray-100 border-b border-gray-100">
                    <label className="text-xs font-medium tracking-wider text-gray-600 uppercase">
                      CURL Command
                    </label>
                  </div>
                  <div className="p-4">
                    <pre className="p-3 overflow-x-auto font-mono text-xs text-gray-700 break-all whitespace-pre-wrap bg-gray-100 rounded-lg">
                      {selectedRow?.curl}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-gray-100"></div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 px-6 pb-8 sm:flex-row">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium transition-all duration-200 bg-gray-100 rounded-xl text-gray-700 hover:bg-gray-200 hover:shadow-md active:scale-95"
              >
                Close
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
            className="relative w-full max-w-2xl overflow-hidden transition-all duration-300 transform bg-white shadow-2xl rounded-2xl animate-in fade-in zoom-in-95"
          >
            {/* Close Icon */}
            <button
              onClick={() => setShowActiveInactiveModal(false)}
              className="absolute z-10 flex items-center justify-center w-10 h-10 text-gray-400 transition-all duration-200 bg-white rounded-full shadow-md top-4 right-4 hover:text-gray-600 hover:bg-gray-100 hover:shadow-lg group"
            >
              <MdClose className="w-5 h-5 transition-transform group-hover:scale-110" />
            </button>

            {/* Header - Kept as requested */}
            <div className="px-6 pt-8 pb-4 text-left bg-gradient-to-b from-white to-gray-50">
              <div className="flex items-center gap-3">
                {/* Left Thick Line */}
                <div className="w-1 h-6 rounded-full bg-primary"></div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900">
                  Change Status
                </h3>
              </div>

              <p className="pl-4 mt-1 text-sm text-gray-500">
                Please review the details before change status request
              </p>
            </div>
            <div className="px-6 mt-4">
              {/* Warning Card */}
              <div className="p-4 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="space-y-1">
                    <p className="text-lg ">
                      Are you sure you want to change the status from{" "}
                      <span className="font-bold">
                        {selectedRow.status === "Active"
                          ? "Active"
                          : "Inactive"}
                      </span>{" "}
                      to <span className="font-bold">{newStatus}</span>?
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Confirmation Card */}

            {/* Warning Box for Inactive Status */}

            {/* Divider */}
            <div className="my-6 border-t border-gray-100"></div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 px-6 pb-8 sm:flex-row">
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

export default ProxyList;
