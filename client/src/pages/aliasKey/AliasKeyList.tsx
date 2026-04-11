import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import type { IAliasKey } from "../../interface/aliasKey.interface";
import AliasKeyRow from "./AliasKeyRow";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import apiClient from "../../services/apiClient";
import { FiPlus } from "react-icons/fi";
import { FiSearch } from "react-icons/fi";
import { FiAlertTriangle } from "react-icons/fi";
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
} from "lucide-react";
import { MdClose } from "react-icons/md";

function AliasKeyList() {
  const { user } = useAuth();
  const [apiData, setApiData] = useState<IAliasKey[]>([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [total, setTotal] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("_id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedRow, setSelectedRow] = useState<IAliasKey | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [mobileView, setMobileView] = useState(false);

  // Check screen size for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setMobileView(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleActionClick = (row: IAliasKey) => {
    setSelectedRow(row);
    setShowModal(true);
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
      console.error(err);
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
    { label: "#", field: "_id" },
    ...(isAdmin
      ? [
          { label: "User", field: "user_id.first_name" },
          { label: "Email", field: "user_id.email" },
        ]
      : []),
    { label: "Key", field: "alias_key" },
    { label: "Domain", field: "domain" },
    { label: "Status", field: "status" },
    { label: "# Quota", field: "total_quota" },
    { label: "# Avaiable", field: "used_quota" },
    { label: "Created", field: "createdAt" },
  ];

  // Responsive grid columns based on screen size and admin status
  const getGridCols = () => {
    if (mobileView) return "grid-cols-1"; // Card view on mobile
    const baseCols = isAdmin ? 10 : 8;
    return `grid-cols-${baseCols}`;
  };
  const gridColsClass =
    user?.role === "Admin"
      ? "grid-cols-[40px_1.2fr_1.5fr_2fr_1.5fr_100px_80px_80px_80px_40px]"
      : "grid-cols-[40px_2fr_1.5fr_100px_100px_100px_100px_80px]";
  return (
    <div className="py-4">
      <div className="p-4 bg-white border border-gray-200 shadow-sm rounded-xl sm:p-5">
        {/* Header - Responsive */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-gray-800 sm:text-2xl">
              Alias Keys
            </h2>
            <p className="mt-1 text-base text-gray-500 sm:text-base">
              Manage and monitor alias key usage
            </p>
          </div>
          {user?.role === "User" && (
            <Link
              to="/alias-key/add"
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primaryHover text-white px-4 py-2.5 rounded-lg text-base font-medium shadow-sm transition-all duration-200"
            >
              <FiPlus className="w-4 h-4" />
              Create Alias Key Request
            </Link>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Search - Responsive */}
            <div className="relative w-full mb-5 sm:w-80">
              <input
                ref={searchRef}
                type="text"
                placeholder="Search alias keys..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 text-base shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all duration-200"
              />
              <FiSearch className="absolute w-4 h-4 text-gray-400 left-3 top-3" />
            </div>

            {/* Table - Responsive with Card View on Mobile */}
            <div className="overflow-x-auto border border-gray-200 shadow-sm rounded-xl">
              <div className="overflow-hidden border border-gray-200 shadow-sm rounded-xl">
                {/* Header Row */}
                <div
                  className={`grid ${gridColsClass} bg-gradient-to-r from-gray-50 to-gray-100 text-base font-semibold text-gray-600  px-4 py-3 border-b border-gray-200`}
                >
                  {columns.map((col) => (
                    <div
                      key={col.field}
                      onClick={() => handleSort(col.field)}
                      className="flex items-center gap-1 text-base transition-colors duration-200 cursor-pointer hover:text-primary"
                    >
                      {col.label}
                      {sortField === col.field && (
                        <span className="text-base text-primary">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  ))}
                  <div className="text-base text-center">Actions</div>
                </div>

                {/* Rows */}
                {apiData.length === 0 ? (
                  <div className="py-10 text-center text-gray-500">
                    <p className="text-base font-semibold">No data found</p>
                    <p className="mt-1 text-base text-gray-400">
                      Try adjusting your search or filters
                    </p>
                  </div>
                ) : (
                  apiData.map((item, index) => (
                    <AliasKeyRow
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
              <div className="flex flex-wrap justify-center gap-1 mt-6 sm:gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className={`px-2 sm:px-3 py-1.5 rounded-md text-base sm:text-base border transition-all duration-200 ${
                    page === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-600 hover:bg-gray-50 border-gray-300"
                  }`}
                >
                  Previous
                </button>
                {Array.from(
                  { length: Math.min(5, Math.ceil(total / limit)) },
                  (_, i) => {
                    // Show limited pages on mobile
                    let pageNum;
                    if (Math.ceil(total / limit) <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= Math.ceil(total / limit) - 2) {
                      pageNum = Math.ceil(total / limit) - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-2 sm:px-3 py-1.5 rounded-md text-base sm:text-base border transition-all duration-200 ${
                          page === pageNum
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "bg-white text-gray-600 hover:bg-gray-50 border-gray-300"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  },
                )}
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === Math.ceil(total / limit)}
                  className={`px-2 sm:px-3 py-1.5 rounded-md text-base sm:text-base border transition-all duration-200 ${
                    page === Math.ceil(total / limit)
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-600 hover:bg-gray-50 border-gray-300"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal - Responsive */}
      {showModal && selectedRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 bg-black/60 backdrop-blur-md">
          {/* Modal */}
          <div className="relative w-full max-w-4xl overflow-hidden transition-all duration-300 transform bg-white shadow-2xl rounded-2xl animate-in fade-in zoom-in-95">
            {/* Decorative top bar */}

            {/* Close Icon - Improved */}
            <button
              onClick={() => setShowModal(false)}
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
                  Review Alias Key Request
                </h3>
              </div>

              <p className="pl-4 mt-1 text-base text-gray-500">
                Please review the details before approving or rejecting this
                request
              </p>
            </div>

            {/* Key Details Card */}
            <div className="p-4 mx-6 mt-6 border border-gray-100 bg-gray-50 rounded-xl">
              <h4 className="mb-3 text-base font-semibold tracking-wider text-gray-500 uppercase">
                Request Details
              </h4>

              <div className="space-y-3">
                {selectedRow?.user_id && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-base text-gray-600">
                        Requested By
                      </span>
                    </div>
                    <span className="text-base font-medium text-gray-800">
                      {selectedRow.user_id.first_name || "-"}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <span className="text-base text-gray-600">Domain</span>
                  </div>
                  <span className="text-base font-medium text-gray-800">
                    {selectedRow?.domain || "-"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-gray-400" />
                    <span className="text-base text-gray-600">Total Quota</span>
                  </div>
                  <span className="text-base font-medium text-gray-800">
                    {selectedRow?.total_quota || "-"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-base text-gray-600">Purpose</span>
                  </div>
                  <span className="text-base font-medium text-gray-800">
                    {selectedRow.description || "-"}
                  </span>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="p-3 mx-6 mt-4 border border-blue-100 rounded-lg bg-blue-50">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-base text-blue-700">
                  This action can't be changed.
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-gray-100"></div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 px-6 pb-8 sm:flex-row">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 text-base font-medium bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200"
              >
                Cancel
              </button>

              <button
                onClick={() => handleApprove("Rejected")}
                className="flex-1 px-4 py-2.5 text-base font-medium bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>

              <button
                onClick={() => handleApprove("Active")}
                disabled={loading}
                className="flex-1 px-4 py-2.5 text-base font-medium bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
    </div>
  );
}

export default AliasKeyList;
