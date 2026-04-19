import React, { useState, useEffect, useCallback, useRef } from "react";
import { MdFirstPage, MdLastPage } from "react-icons/md";

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
const Row = ({ label, value, mono = false }: any) => (
  <div className="flex justify-between gap-4 py-2 border-b last:border-0">
    <span className="text-xs text-gray-500 uppercase">{label}</span>
    <span
      className={`text-sm text-gray-900 break-all ${
        mono ? "font-mono text-xs" : ""
      }`}
    >
      {value || "-"}
    </span>
  </div>
);
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
  const [limit, setLimit] = useState(10);
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
    // { label: "Proxy Token", field: "proxy_token", sortable: true },
    { label: "Curl", field: "curl", sortable: true },
    { label: "Credit", field: "credit", sortable: true },
    { label: "Created", field: "createdAt", sortable: true },
  ];
  const gridColsClass = "grid-cols-[40px_1.2fr_2fr_80px_100px_80px]";

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
            <h5 className=" sm:text-xl text-white/60">Proxy</h5>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="p-5 sm:p-6">
        {/* Search + Action Row */}
        <div className="flex flex-col gap-3 mb-5 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <input
              ref={searchRef}
              type="text"
              placeholder="Search ..."
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
            to="/proxy/add"
            className="whitespace-nowrap inline-flex items-center justify-center gap-2 bg-primary hover:bg-primaryHover text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm"
          >
            <FiPlus className="w-4 h-4" />
            Create Proxy
          </Link>
        </div>

        {/* CONTENT (Table / List / etc.) */}
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
                      {sortOrder === "asc" ? <FiArrowUp /> : <FiArrowDown />}
                    </span>
                  )}
                </div>
              ))}
              <div className="text-sm text-center">Actions</div>
            </div>

            {/* Rows */}
            {apiData.length === 0 ? (
              <div className="py-10 text-center text-gray-600">
                <p className="text-sm font-semibold">No proxy found</p>
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
      </div>
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 bg-black/60 backdrop-blur-md">
          {/* Modal */}
          <div
            ref={deleteModalRef}
            className="relative w-full max-w-lg overflow-hidden transition-all duration-300 transform bg-white shadow-2xl rounded-2xl animate-in fade-in zoom-in-95"
          >
            {/* Close Icon */}
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute z-10 flex items-center justify-center w-10 h-10 transition-all duration-200 bg-white top-4 right-4 hover:text-gray-600 group"
            >
              <MdClose className="w-5 h-5 transition-transform group-hover:scale-110" />
            </button>

            {/* Header - Kept as requested */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">
                Proxy Delete
              </h2>
            </div>

            {/* Warning Content */}
            <div className="flex-1 px-6 py-4 overflow-y-auto">
              <p className="text-sm ">Are you sure you want to delete proxy?</p>
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
              className="absolute z-10 flex items-center justify-center w-10 h-10 transition-all duration-200 bg-white top-4 right-4 hover:text-gray-600 group"
            >
              <MdClose className="w-4 h-4 transition-transform group-hover:scale-110" />
            </button>

            {/* Header - Kept as requested */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">
                Proxy Details
              </h2>
            </div>

            {/* Proxy Details - Improved Layout */}
            <div className="flex-1 px-6 py-5 overflow-y-auto max-h-[55vh] custom-scrollbar">
              {/* Two Column Grid for better layout */}
              <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="group">
                    <label className="block mb-1 text-xs font-medium uppercase">
                      Proxy Name
                    </label>
                    <p className="text-sm font-medium text-gray-500">
                      {selectedRow?.proxy_name || "-"}
                    </p>
                  </div>

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
                      Credit
                    </label>
                    <p className="text-base font-semibold text-indigo-600">
                      {selectedRow?.credit || "0"}
                    </p>
                  </div>
                  <div className="group">
                    <label className="block mb-1 text-xs font-medium uppercase">
                      Created date
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

                  <div className="group">
                    <label className="block mb-1 text-xs font-medium uppercase">
                      Proxy Token
                    </label>
                    <p className="p-2 font-mono text-xs text-gray-500 break-all rounded-md bg-gray-50">
                      {selectedRow?.proxy_token || "-"}
                    </p>
                  </div>

                  <div className="group">
                    <label className="block mb-1 text-xs font-medium uppercase">
                      Token for Curl
                    </label>
                    <p className="p-2 font-mono text-xs font-semibold text-indigo-600 rounded-md bg-indigo-50">
                      {selectedRow?.curl_token || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Curl Command - Full Width */}
              <div className="pt-4 mt-6 border-t border-gray-100">
                <label className="block mb-2 text-xs font-medium uppercase">
                  Curl Command
                </label>
                <div className="relative group">
                  <pre className="text-sm text-gray-500 break-words whitespace-pre-wrap">
                    <code>{selectedRow?.curl || "-"}</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Divider - Simplified */}
            <div className="border-t border-gray-100"></div>

            {/* Actions - Kept as requested but improved button */}
            <div className="flex justify-end px-6 py-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 text-sm font-medium text-gray-700 transition-all duration-200 bg-gray-100 rounded-lg hover:bg-gray-200 hover:shadow-sm active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProxyList;
