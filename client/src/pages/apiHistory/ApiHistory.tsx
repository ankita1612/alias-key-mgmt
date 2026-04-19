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
import {
  Key,
  Calendar,
  Send,
  Copy,
  Activity,
  User,
  BadgeCheck,
} from "lucide-react";
import { useParams } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import type { IAliasKey } from "../../interface/aliasKey.interface";
import ApiHistoryRow from "./ApiHistoryRow";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import apiClient from "../../services/apiClient";

import { CheckCircle, Clock } from "lucide-react";
import { MdClose, MdFirstPage, MdLastPage } from "react-icons/md";
const capitalize = (text?: string) =>
  text ? text.charAt(0).toUpperCase() + text.slice(1) : "-";
function ApiHistory() {
  const { aliasKeyId } = useParams();
  const { user } = useAuth();
  const [apiData, setApiData] = useState<IAliasKey[]>([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [total, setTotal] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [sortField, setSortField] = useState("_id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedRow, setSelectedRow] = useState<IAliasKey | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [mobileView, setMobileView] = useState(false);
  const [users, setUsers] = useState([]);
  const [aliasKeys, setAliasKeys] = useState([]);
  const aliasKeysLoaded = useRef(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedAliasKey, setSelectedAliasKey] = useState(aliasKeyId || "");
  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(Number(e.target.value));
    setPage(1); // reset to first page
  };
  // Check screen size for mobile view
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // ✅ better UX

    return () => clearTimeout(timer);
  }, [search]);
  const handleActionClick = async (row: IAliasKey) => {
    try {
      setLoading(true);
      console.log(row);
      const aliasKeyId = row?.user_alias_key_id?._id || row?.user_alias_key_id;
      const { data } = await apiClient.get(
        `${BACKEND_URL}/api/user/get-user-by-alias_id/${aliasKeyId}`,
      );

      // merge API response into row
      const updatedRow = {
        ...row,
        user_id: data.data, // assuming API returns { user: {...} }
      };

      setSelectedRow(updatedRow);
      setShowModal(true);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to fetch user details",
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    setPage(1);
  }, [selectedAliasKey, selectedUser, debouncedSearch]);
  useEffect(() => {
    if (!aliasKeyId) {
      setSelectedAliasKey("");
    }
  }, [location.pathname]);
  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    const loadHistory = async () => {
      setLoading(true);

      try {
        const { data } = await apiClient.get(BACKEND_URL + "/api/api-hisory", {
          signal: controller.signal,
          params: {
            page,
            limit,
            search: debouncedSearch,
            sortField,
            sortOrder,
            user: selectedUser,
            alias_key: selectedAliasKey,
          },
        });

        if (!isMounted) return;

        setApiData(data.data);
        setTotal(data.pagination.total);

        if (!aliasKeysLoaded.current && data.aliasKeysList) {
          setAliasKeys(data.aliasKeysList);
          aliasKeysLoaded.current = true;
        }

        if (!users.length && data.usersList) {
          setUsers(data.usersList);
        }
      } catch (error: any) {
        if (error.name !== "CanceledError") {
          toast.error(
            error?.response?.data?.message ||
              error?.message ||
              "Failed to load data",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [
    page,
    limit,
    debouncedSearch,
    sortField,
    sortOrder,
    selectedUser,
    selectedAliasKey,
    aliasKeyId,
  ]);

  const handleDelete = async (id: string) => {
    const previousData = apiData;
    setApiData((prev) => prev.filter((p) => p._id !== id));
    try {
      const res = await apiClient.delete(`${BACKEND_URL}/api/alias-key/${id}`);
      toast.success(res.data.message);
    } catch (error: any) {
      setApiData(previousData);
      toast.error(error.response?.data?.message || "Delete failed");
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
    { label: "Key", field: "user_alias_key_id.alias_key", sortable: true },
    { label: "Request", field: "request_info", sortable: true },
    { label: "Time", field: "execution_time", sortable: true },
    { label: "Status", field: "response_status", sortable: true },
    { label: "Message", field: "response_msg", sortable: true },
    { label: "Code", field: "response_code", sortable: true },
    { label: "Created", field: "createdAt", sortable: true },
  ];

  // Responsive grid columns based on screen size and admin status

  const gridColsClass =
    user?.role === "Admin"
      ? "grid-cols-[40px_1.2fr_100px_100px_100px_1.2fr_80px_80px_80px]"
      : "grid-cols-[40px_1.2fr_100px_100px_100px_1.2fr_80px_80px_80px]";
  const isFilterActive = selectedAliasKey || search;
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
            <h5 className=" sm:text-xl text-white/60">Key Monitor</h5>
          </div>
        </div>
      </div>
      <div className="p-5 sm:p-6">
        {/* Loading */}
        {loading ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="w-10 h-10 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2 mb-5 sm:flex-row sm:items-center sm:gap-3">
              <select
                value={selectedAliasKey}
                onChange={(e) => setSelectedAliasKey(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
              >
                <option value="">All Keys</option>
                {aliasKeys.map((k) => (
                  <option key={k._id} value={k._id}>
                    {k.alias_key}
                  </option>
                ))}
              </select>
              {/* Search - Responsive */}
              <div className="relative w-full sm:w-80">
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search by key, request, status, message, code"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 text-sm shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all duration-200"
                />
                <FiSearch className="absolute w-4 h-4 text-gray-400 left-3 top-3" />
              </div>
              <button
                onClick={() => {
                  setSelectedAliasKey("");
                  setSearch("");
                  searchRef.current?.focus();
                }}
                disabled={!isFilterActive}
                className={`px-4 py-2.5 text-sm rounded-lg transition-all duration-200
    ${
      isFilterActive
        ? "bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
        : "bg-gray-100 text-gray-400 cursor-not-allowed"
    }`}
              >
                Clear All
              </button>
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
                      {sortField === col.field && (
                        <span className="text-sm text-primary">
                          <span className="text-sm text-primary">
                            {sortOrder === "asc" ? (
                              <FiArrowUp />
                            ) : (
                              <FiArrowDown />
                            )}
                          </span>
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
                    <ApiHistoryRow
                      key={item._id}
                      index={index}
                      apiData={item}
                      handleDelete={handleDelete}
                      userRole={user?.role}
                      onActionClick={handleActionClick}
                      mobileView={false}
                      gridColsClass={gridColsClass}
                    />
                  ))
                )}
              </div>
            </div>
            {/* Pagination - Responsive */}
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

      {/* Modal - Responsive */}
      {showModal && selectedRow && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 bg-black/60 backdrop-blur-md"
          onClick={() => setShowModal(false)}
        >
          {/* Modal */}
          <div
            className="relative w-full max-w-4xl overflow-hidden transition-all duration-300 transform bg-white shadow-2xl rounded-2xl animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative top bar */}

            {/* Close Icon - Improved */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute z-10 flex items-center justify-center w-10 h-10 transition-all duration-200 bg-white top-4 right-4 hover:text-gray-600 hover:bg-gray-100 group"
            >
              className="absolute z-10 flex items-center justify-center w-10 h-10 transition-all duration-200 bg-white top-4 right-4 hover:text-gray-600 hover:bg-gray-100 group"
            </button>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">
                API Call Detail
              </h2>
            </div>

            {/* Content */}
            <div className="px-6 py-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {/* Two Column Grid for Requester and  Key */}
              <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
                {/* Requester Information Card */}
                <div className="overflow-hidden transition-all duration-300 bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md">
                  <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold tracking-wide text-gray-700 uppercase">
                        Requester
                      </span>
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                        <span className="text-sm font-semibold text-white">
                          {selectedRow?.user_id?.first_name?.charAt(0) || "U"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {selectedRow?.user_id?.first_name || "-"}{" "}
                          {selectedRow?.user_id?.last_name || ""}
                        </p>
                        <p className="text-sm text-gray-500">
                          {selectedRow?.user_id?.email || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden transition-all duration-300 bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md">
                  <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-semibold tracking-wide text-gray-700 uppercase">
                        Key
                      </span>
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="flex-1 font-mono text-sm font-medium text-gray-900 break-all">
                        {selectedRow?.alias.alias_key}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Two Column Grid for Metadata */}
              <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
                <div className="p-4 transition-all duration-200 border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:shadow-md">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-semibold text-gray-500 uppercase">
                      Execution Time
                    </span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedRow?.execution_time || "0"}ms
                  </p>
                </div>

                <div className="p-4 transition-all duration-200 border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:shadow-md">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-semibold text-gray-500 uppercase">
                      Status
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                      selectedRow?.response_status === "success"
                        ? "bg-green-100 text-green-700"
                        : selectedRow?.response_status === "fail"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        selectedRow?.response_status === "success"
                          ? "bg-green-500"
                          : selectedRow?.response_status === "fail"
                            ? "bg-red-500"
                            : "bg-yellow-500"
                      }`}
                    ></div>
                    {capitalize(selectedRow?.response_status)}
                  </span>
                </div>

                <div className="p-4 transition-all duration-200 border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:shadow-md">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-semibold text-gray-500 uppercase">
                      Created On
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(selectedRow?.createdAt || "").toLocaleString(
                      "en-US",
                      {
                        dateStyle: "medium",
                        timeStyle: "short",
                      },
                    )}
                  </p>
                </div>
              </div>

              {/* Request Info Section */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-blue-100">
                    <Send className="w-4 h-4 text-blue-600" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900">
                    Request Information
                  </h4>
                </div>
                <div className="overflow-hidden bg-gray-900 border border-gray-800 shadow-lg rounded-xl">
                  <pre className="p-4 overflow-auto font-mono text-sm text-gray-300 max-h-48 scrollbar-thin">
                    Method: {selectedRow?.method}
                    <br></br>
                    Query Parameters:
                    {selectedRow.request_params &&
                      Object.keys(selectedRow.request_params).length > 0 && (
                        <div className="mt-0">
                          <pre className="p-4 overflow-auto text-sm text-gray-300rounded-lg">
                            {JSON.stringify(
                              Object.fromEntries(
                                Object.entries(
                                  selectedRow.request_params || {},
                                ).filter(([key]) => key !== "alias_key"),
                              ),
                              null,
                              2,
                            )}
                          </pre>
                        </div>
                      )}
                  </pre>
                </div>
              </div>

              {/* Response Section */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-green-100">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900">
                    Response Data
                  </h4>
                </div>
                <div className="overflow-hidden bg-gray-900 border border-gray-800 shadow-lg rounded-xl">
                  <pre className="p-4 overflow-auto font-mono text-sm text-gray-300 max-h-48 scrollbar-thin">
                    Status: {capitalize(selectedRow?.response_status)} <br></br>
                    Response Message: {selectedRow?.response_msg}
                    <br></br>
                    Response Code: {selectedRow?.response_code}
                  </pre>
                </div>
              </div>
            </div>
            <div className="px-6 py-2 border-t border-slate-200"></div>

            {/* Footer Actions */}
            <div className="flex flex-col-reverse gap-3 px-6 pb-4 sm:flex-row">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium transition-all duration-200 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400"
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

export default ApiHistory;
