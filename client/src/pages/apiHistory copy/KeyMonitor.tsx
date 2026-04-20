import React, { useState, useEffect, useCallback, useRef } from "react";
import DataTable from "react-data-table-component";
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

import { Link, useLocation, useNavigate } from "react-router-dom";
import type { IAliasKey } from "../../interface/aliasKey.interface";
import { FiEdit2, FiEye, FiTrash2, FiList } from "react-icons/fi";
import KeyMonitorRow from "./KeyMonitorRow";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import apiClient from "../../services/apiClient";

import { AlertTriangle } from "lucide-react";
import { MdClose } from "react-icons/md";
import TotalHitsModal from "../aliasKey/TotalHitsModal";
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
function KeyMonitor() {
  const { user } = useAuth();
  const navigate = useNavigate();
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
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [statsData, setStatsData] = useState<IAliasKey | null>(null);
  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(Number(e.target.value));
    setPage(1); // reset to first page
  };

  // Status badge configuration
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Active":
        return {
          bg: "bg-green-50",
          text: "text-green-700",
          dot: "bg-green-500",
          border: "border-green-200",
        };
      case "Inactive":
        return {
          bg: "bg-gray-100",
          text: "text-gray-600",
          dot: "bg-gray-400",
          border: "border-gray-300",
        };
      case "Pending":
        return {
          bg: "bg-yellow-50",
          text: "text-yellow-700",
          dot: "bg-yellow-500",
          border: "border-yellow-200",
        };
      case "Rejected":
        return {
          bg: "bg-red-50",
          text: "text-red-700",
          dot: "bg-red-500",
          border: "border-red-200",
        };
      default:
        return {
          bg: "bg-gray-50",
          text: "text-gray-700",
          dot: "bg-gray-500",
          border: "border-gray-200",
        };
    }
  };

  // Helper functions for actions
  const handleEdit = (row: IAliasKey) => {
    navigate(`/alias-key/add/${row._id}`);
  };

  const handleShowStats = (row: IAliasKey) => {
    // You'll need to implement the stats modal
    console.log("Show stats", row);
  };

  const userRole = user?.role;
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

  // Define columns for react-data-table-component
  const columns = [
    {
      name: "No.",
      selector: (row, index) => (page - 1) * limit + (index ?? 0) + 1,
      sortable: false,
      width: "60px",
      center: true,
    },
    {
      name: "Key",
      selector: (row) => row.alias_key || "-",
      sortable: true,
      sortField: "alias_key",
      cell: (row) => (
        <div className="font-mono text-xs text-gray-800 truncate max-w-[200px]">
          {row.alias_key || "-"}
        </div>
      ),
      width: "200px",
    },
    {
      name: "Domain Name",
      selector: (row) => row.domain_name || "-",
      sortable: true,
      sortField: "domain_name",
      cell: (row) => (
        <div className="text-xs truncate max-w-[150px]">
          {row.domain_name || "-"}
        </div>
      ),
      width: "150px",
    },
    {
      name: "Status",
      selector: (row) => row.status || "-",
      sortable: true,
      sortField: "status",
      cell: (row) => {
        const statusConfig = getStatusConfig(row.status);
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}
          >
            {row.status || "-"}
          </span>
        );
      },
      width: "100px",
      center: true,
    },
    {
      name: "# Quota",
      selector: (row) => row.total_quota || 0,
      sortable: true,
      sortField: "total_quota",
      cell: (row) => (
        <div className="text-xs font-semibold">{row.total_quota || "-"}</div>
      ),
      width: "80px",
      center: true,
    },
    {
      name: "# Available",
      selector: (row) => row.remaining_quota || 0,
      sortable: true,
      sortField: "remaining_quota",
      cell: (row) => {
        const availablePercentage =
          row.total_quota > 0
            ? ((row.remaining_quota / row.total_quota) * 100).toFixed(2)
            : "0.00";
        return (
          <div className="flex items-center gap-2 text-xs">
            <span>
              {["Active", "Inactive"].includes(row.status)
                ? (row.remaining_quota ?? "-")
                : "-"}
            </span>
            {["Active", "Inactive"].includes(row.status) &&
              row.total_quota != null &&
              row.remaining_quota != null && (
                <span className="text-xs text-gray-400">
                  ({availablePercentage}%)
                </span>
              )}
          </div>
        );
      },
      width: "100px",
      center: true,
    },
    {
      name: "# Hits",
      selector: (row) => row.total_history_records || 0,
      sortable: false,
      cell: (row) => (
        <div className="text-xs font-semibold">
          {["Active", "Inactive"].includes(row.status) ? (
            <button
              onClick={() => handleShowStats(row)}
              className="px-2 py-1 text-xs font-medium text-indigo-600 rounded-md bg-indigo-50 hover:bg-indigo-100"
            >
              {row.total_history_records}
            </button>
          ) : (
            "-"
          )}
        </div>
      ),
      width: "80px",
      center: true,
    },
    {
      name: "Created",
      selector: (row) => row.createdAt || "",
      sortable: true,
      sortField: "createdAt",
      cell: (row) => (
        <div className="text-xs">
          {row.createdAt
            ? new Date(row.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "-"}
        </div>
      ),
      width: "100px",
      center: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-0.5 p-0.5">
          {userRole === "User" ? (
            <>
              <button
                disabled={row.proxy?.is_deleted === true}
                onClick={() => handleEdit(row)}
                className="p-1.5 text-blue-600 hover:text-white hover:bg-blue-500 rounded-md transition-all duration-200 group relative"
                title="Edit"
              >
                <FiEdit2 size={14} />
              </button>
              <button
                disabled={row.proxy?.is_deleted === true}
                onClick={() => showKeyDetail(row)}
                className="p-1.5 text-green-600 hover:text-white hover:bg-green-500 rounded-md transition-all duration-200 group relative"
                title="View Details"
              >
                <FiEye size={14} />
              </button>
              <button
                onClick={() => handleDeleteClick(row._id)}
                className="p-1.5 text-red-600 hover:text-white hover:bg-red-500 rounded-md transition-all duration-200 group relative"
                title="Delete"
              >
                <FiTrash2 size={14} />
              </button>
            </>
          ) : (
            <>
              {row.status === "Pending" && (
                <button
                  onClick={() => handleActionClick(row)}
                  className="p-1.5 text-orange-600 hover:text-white hover:bg-orange-500 rounded-md transition-all duration-200 group relative"
                  title="Approve/Reject"
                >
                  <FiList size={14} />
                </button>
              )}
              {["Active", "Inactive"].includes(row.status) && (
                <button
                  onClick={() =>
                    handleActiveInactiveClick(
                      row,
                      row.status === "Active" ? "Inactive" : "Active",
                    )
                  }
                  className={`p-1.5 rounded-md transition-all duration-200 group relative ${
                    row.status === "Active"
                      ? "text-yellow-600 hover:text-white hover:bg-yellow-500"
                      : "text-green-600 hover:text-white hover:bg-green-500"
                  }`}
                  title={
                    row.status === "Active" ? "Make Inactive" : "Make Active"
                  }
                >
                  {row.status === "Active" ? (
                    <XCircle size={14} />
                  ) : (
                    <CheckCircle size={14} />
                  )}
                </button>
              )}
              <button
                onClick={() => showKeyDetail(row)}
                className="p-1.5 text-green-600 hover:text-white hover:bg-green-500 rounded-md transition-all duration-200 group relative"
                title="View Details"
              >
                <FiEye size={14} />
              </button>
            </>
          )}
        </div>
      ),
      width: "120px",
      center: true,
    },
  ];

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
            {/* Table - Using react-data-table-component */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <DataTable
                columns={columns}
                data={apiData}
                progressPending={loading}
                pagination
                paginationServer
                paginationTotalRows={total}
                paginationPerPage={limit}
                paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
                onChangePage={(page) => setPage(page)}
                onChangeRowsPerPage={(newPerPage) => {
                  setLimit(newPerPage);
                  setPage(1);
                }}
                onSort={(column, sortDirection) => {
                  if (column.sortField) {
                    setSortField(column.sortField);
                    setSortOrder(sortDirection);
                  }
                }}
                sortServer
                defaultSortFieldId={1}
                defaultSortAsc={false}
                noDataComponent={
                  <div className="py-10 text-center text-gray-600">
                    <p className="text-sm font-semibold">No key found</p>
                  </div>
                }
                customStyles={{
                  headRow: {
                    style: {
                      backgroundColor: "#f9fafb",
                      borderBottom: "1px solid #e5e7eb",
                    },
                  },
                  headCells: {
                    style: {
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      color: "#374151",
                      padding: "12px 16px",
                    },
                  },
                  cells: {
                    style: {
                      padding: "12px 16px",
                      fontSize: "0.75rem",
                    },
                  },
                  rows: {
                    style: {
                      borderBottom: "1px solid #f3f4f6",
                      "&:hover": {
                        backgroundColor: "#f9fafb",
                      },
                    },
                  },
                  pagination: {
                    style: {
                      borderTop: "1px solid #e5e7eb",
                      padding: "16px",
                    },
                  },
                }}
                responsive
              />
            </div>
          </>
        )}
      </div>

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
                        : "-"}{" "}
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
                      Key
                    </label>
                    <p className="text-sm text-gray-500 break-all">
                      {selectedRow?.alias_key || "-"}
                    </p>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium uppercase">
                      Domain Name
                    </label>
                    <p className="text-sm text-gray-500">
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

              {selectedRow?.cost_calculation && (
                <div className="pt-2 mt-2">
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
                <div className="pt-2 mt-2">
                  <label className="block text-xs font-medium uppercase">
                    Purpose
                  </label>
                  <div className="pt-1 overflow-y-auto text-sm text-gray-500 rounded-lg max-h-32">
                    {selectedRow?.description || "-"}
                  </div>
                </div>
              )}

              {/* Proxy Configuration Section - Only if proxy exists */}
              {selectedRow?.proxy && (
                <div className="pt-2 mt-2 border-t">
                  <div className="space-y-3 rounded-lg ">
                    <div>
                      <label className="block mb-1 text-xs font-medium uppercase">
                        Proxy Name
                      </label>
                      <p className="text-sm font-medium text-gray-500">
                        {selectedRow.proxy?.proxy_name || "-"}
                      </p>
                    </div>

                    {["Active", "Inactive"].includes(selectedRow.status) &&
                      selectedRow.proxy?.query_params &&
                      Object.keys(selectedRow.proxy.query_params).length >
                        0 && (
                        <div>
                          <label className="block pt-2 mt-2 text-xs font-medium uppercase  ">
                            Proxy URL
                          </label>
                          <div className="overflow-hidden rounded-lg">
                            <div className="overflow-auto text-sm whitespace-pre-wrap max-h-48">
                              {!liveUrl && "No proxy data"}
                              {typeof liveUrl === "string" && liveUrl && (
                                <div className="font-mono break-all">
                                  {/* <span className="font-semibold text-blue-400">
                                    URL:
                                  </span>{" "} */}
                                  <span className="text-gray-500">
                                    {liveUrl}
                                  </span>
                                </div>
                              )}
                              {typeof liveUrl === "object" && liveUrl && (
                                <>
                                  <div className="mb-2 font-mono text-xs break-all">
                                    <span className="font-semibold text-blue-400">
                                      URL:
                                    </span>{" "}
                                    <span className="text-gray-500">
                                      {liveUrl.url}
                                    </span>
                                  </div>
                                  <div className="mb-1 font-mono text-xs font-semibold text-blue-400">
                                    Body:
                                  </div>
                                  <pre className="font-mono text-xs text-gray-500 whitespace-pre-wrap">
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
                <div className="pt-4 mt-4">
                  <div className="p-3 border-l-4 border-red-500 rounded-lg bg-red-50">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FiAlertCircle className="w-4 h-4 text-red-500" />
                      </div>
                      <div className="ml-2">
                        <h3 className="text-sm font-medium text-red-800">
                          Proxy Deleted
                        </h3>
                        <p className="text-xs text-red-700">
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

      {/* Stats Modal */}
      {showStatsModal && statsData && (
        <TotalHitsModal
          data={statsData}
          onClose={() => {
            setShowStatsModal(false);
            setStatsData(null);
          }}
        />
      )}
    </div>
  );
}

export default KeyMonitor;
