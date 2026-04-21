import { MdFirstPage, MdLastPage } from "react-icons/md";
import { CheckCircle, XCircle } from "lucide-react";
import {
  FiSearch,
  FiPlus,
  FiEdit2,
  FiEye,
  FiTrash2,
  FiAlertCircle,
} from "react-icons/fi";

import TotalHitsModal from "./TotalHitsModal";
import {
  User,
  FolderOpen,
  Globe,
  TrendingUp,
  Calculator,
  DollarSign,
  Shield,
  FileText,
} from "lucide-react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiArrowUp,
  FiArrowDown,
} from "react-icons/fi";

import { Link, useLocation, useNavigate } from "react-router-dom";
import type { IAliasKey } from "../../interface/aliasKey.interface";
import AliasKeyRow from "./AliasKeyRow";

import { useAuth } from "../../context/AuthContext";

import { AlertTriangle } from "lucide-react";
import { MdClose } from "react-icons/md";
import React, { useEffect, useState, useRef, useCallback } from "react";
import DataTable from "react-data-table-component";
import apiClient from "../../services/apiClient";
import toast from "react-hot-toast";
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
      if (curl_token in json) {
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
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
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
const customTableStyles = {
  headRow: {
    style: {
      backgroundColor: "#ffffff",
      color: "#000000",
      fontWeight: 600,
      fontSize: "14px",
      height: "50px",
    },
  },
  rows: {
    style: {
      fontSize: "15px",
      minHeight: "52px", // 👈 slightly taller (default ~48)

      backgroundColor: "#ffffff",
      "&:hover": {
        backgroundColor: "#f3f4f6",
        cursor: "pointer",
      },
    },
    stripedStyle: {
      backgroundColor: "#ffffff",
    },
  },
  cells: {
    style: {
      fontSize: "14.5px", // 👈 subtle increase (best sweet spot)
      lineHeight: "1.5", // 👈 improves readability
      paddingTop: "10px",
      paddingBottom: "10px",
    },
  },
  pagination: {
    style: {
      minHeight: "56px",
    },
  },
  noData: {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#ffffff",
      minHeight: "300px",
    },
  },
};
const AliasKeyList = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const searchRef = useRef<HTMLInputElement>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState<IAliasKey[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const deleteModalRef = useRef<HTMLDivElement>(null);
  const showPendingRejectedRef = useRef<HTMLInputElement>(null);
  const showDetailRef = useRef<HTMLDivElement>(null);
  const showActiveInactiveModalRef = useRef<HTMLDivElement>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sort, setSort] = useState({
    field: "createdAt",
    order: "desc" as "asc" | "desc",
  });
  const [selectedRow, setSelectedRow] = useState<IAliasKey | null>(null);
  const [showPendingRejectedModal, setShowPendingRejectedModal] =
    useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActiveInactiveModal, setShowActiveInactiveModal] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");
  const [liveUrl, setLiveUrl] = useState<
    string | { url: string; body: string }
  >("");
  const [showStats, setShowStats] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);
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
  const handleshowKeyDetail = (row: IAliasKey) => {
    setSelectedRow(row);
    setShowDetailModal(true);

    const proxyResult = row?.proxy
      ? generateProxyUrl(row.proxy.curl || "", row.proxy.curl_token || "")
      : "";
    setLiveUrl(proxyResult);
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
  // Status Badge Component
  const StatusBadge = ({
    row,
    userRole,
    onActionClick,
    onStatusChange,
    isDeleted,
  }: any) => {
    const getStatusConfig = (status: string) => {
      switch (status) {
        case "Active":
          return {
            bg: "bg-green-50",
            text: "text-green-700",
            dot: "bg-green-500",
            border: "border-green-200",
            icon: CheckCircle,
          };
        case "Inactive":
          return {
            bg: "bg-gray-100",
            text: "text-gray-600",
            dot: "bg-gray-400",
            border: "border-gray-300",
            icon: XCircle,
          };
        case "Pending":
          return {
            bg: "bg-yellow-50",
            text: "text-yellow-700",
            dot: "bg-yellow-500",
            border: "border-yellow-200",
            icon: AlertTriangle,
          };
        case "Rejected":
          return {
            bg: "bg-red-50",
            text: "text-red-700",
            dot: "bg-red-500",
            border: "border-red-200",
            icon: XCircle,
          };
        default:
          return {
            bg: "bg-gray-50",
            text: "text-gray-700",
            dot: "bg-gray-500",
            border: "border-gray-200",
            icon: AlertTriangle,
          };
      }
    };

    const statusConfig = getStatusConfig(row.status);
    const Icon = statusConfig.icon;

    if (userRole === "Admin") {
      if (row.status === "Pending") {
        return (
          <button
            disabled={isDeleted}
            onClick={() => onActionClick(row)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 font-medium rounded-full ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}
            title="Click to approve/reject"
          >
            <Icon className="w-4 h-4" />
            {row.status}
          </button>
        );
      } else if (row.status === "Active" || row.status === "Inactive") {
        return (
          <button
            disabled={isDeleted}
            onClick={() =>
              onStatusChange(
                row,
                row.status === "Active" ? "Inactive" : "Active",
              )
            }
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 font-medium rounded-full ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}
            title="Click to change status"
          >
            <Icon className="w-4 h-4" />
            {row.status}
          </button>
        );
      }
    }

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 font-medium rounded-full ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}
      >
        <Icon className="w-4 h-4" />
        {row.status}
      </span>
    );
  };
  // 🔥 Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);
  const handleActiveInactiveClick = (row: IAliasKey, newStatus: string) => {
    setSelectedRow(row);

    setNewStatus(newStatus);
    setShowActiveInactiveModal(true);
  };
  // 🔥 Fetch Data (SERVER SIDE)
  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    const controller = new AbortController();
    controllerRef.current = controller;

    // const fetchData = async () => {
    //   setLoading(true);
    //   try {
    //     const { data } = await apiClient.get(`${BACKEND_URL}/api/alias-key`, {
    //       signal: controller.signal,
    //       params: {
    //         page,
    //         limit,
    //         search: debouncedSearch,
    //         sortField: sort.field,
    //         sortOrder: sort.order,
    //       },
    //     });

    //     setData(data.data);
    //     setTotal(data.pagination.total);
    //   } catch (err: any) {
    //     if (err.name !== "CanceledError") {
    //       toast.error(err?.message || "Failed to load data");
    //     }
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    fetchData();

    return () => controller.abort();
  }, [page, limit, debouncedSearch, sort.field, sort.order]);
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
          sortField: sort.field,
          sortOrder: sort.order,
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
  }, [page, limit, search, sort.field, sort.order]);

  // 🔥 Sorting Handler (NO double call)
  const handleSort = (column: any, sortDirection: "asc" | "desc") => {
    if (!column.sortField) return;

    setSort((prev) => {
      if (prev.field === column.sortField && prev.order === sortDirection) {
        return prev;
      }

      return {
        field: column.sortField,
        order: sortDirection,
      };
    });

    setPage(1);
  };
  const handleActionClick = (row: IAliasKey) => {
    setSelectedRow(row);
    setShowPendingRejectedModal(true);
  };
  const ActionsCell = ({
    row,
    userRole,
    onEdit,
    onDelete,
    onView,
    isDeleted,
  }: any) => {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={onView}
          className="text-blue-600 transition hover:text-blue-700"
          title="View details"
        >
          <FiEye className="w-4 h-4" />
        </button>

        {!isDeleted && (
          <>
            {userRole === "User" && (
              <button
                onClick={() => onEdit(row._id)}
                className="text-orange-600 transition hover:text-orange-700"
                title="Edit"
              >
                <FiEdit2 className="w-4 h-4" />
              </button>
            )}

            {userRole === "Admin" && (
              <button
                onClick={() => onDelete(row._id)}
                className="text-red-600 transition hover:text-red-700"
                title="Delete"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            )}
          </>
        )}
      </div>
    );
  };
  // 🔥 Columns
  const columns = [
    {
      name: "No.",
      cell: (_: any, index: number) => (page - 1) * limit + index + 1,
      width: "70px",
    },
    ...(isAdmin
      ? [
          {
            name: "User",
            selector: (row: IAliasKey) =>
              row.user?.first_name || row.user?.name || "-",
            width: "150px",
            grow: 1,
            style: {
              // maxWidth: "300px", // ✅ correct
            },
            sortable: true,
          },
        ]
      : []),
    {
      name: "Key",
      selector: (row: any) => row.alias_key,
      sortable: true,
      sortField: "alias_key",
      width: "250px",
      grow: 1,
      cell: (row: IAliasKey) => (
        <span className="font-semibold">{row.alias_key || "-"}</span>
      ),
    },
    {
      name: "Domain Name",
      selector: (row: any) => row.domain_name,
      sortable: true,
      sortField: "domain_name",
      width: "250px",
      grow: 1,
      wrap: true,
      cell: (row) => (
        <span className="break-all whitespace-normal ">
          {row.domain_name || "-"}
        </span>
      ),
    },
    {
      name: "Status",
      selector: (row: IAliasKey) => row.status || "-",
      width: "150px",
      sortable: true,
      cell: (row: IAliasKey) => (
        <StatusBadge
          row={row}
          userRole={user?.role}
          onActionClick={() => handleActionClick(row)}
          onStatusChange={handleActiveInactiveClick}
          isDeleted={row.proxy?.is_deleted}
        />
      ),
      sortField: "status", // ✅ ADD
    },
    {
      name: "Total Quota",
      selector: (row: any) => row.total_quota,
      sortable: true,
      sortField: "total_quota",
      width: "120px",
      cell: (row: IAliasKey) => (
        <span>{row.total_quota?.toLocaleString() || "0"}</span>
      ),
    },
    {
      name: "Total Available",
      selector: (row: any) => row.remaining_quota,
      sortable: true,
      sortField: "remaining_quota",
      width: "120px",
      cell: (row: IAliasKey) => (
        <span>{row.remaining_quota?.toLocaleString() || "0"}</span>
      ),
    },
    {
      name: "Created",
      selector: (row: any) => row.createdAt,
      sortable: true,
      sortField: "createdAt",
      cell: (row: IAliasKey) => (
        <span className="text-sm">
          {row.createdAt
            ? new Date(row.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "-"}
        </span>
      ),
      width: "140px",
    },
    {
      name: "Actions",
      selector: () => "",
      width: "100px",
      sortable: false,
      cell: (row: IAliasKey) => (
        <ActionsCell
          row={row}
          userRole={user?.role}
          onEdit={(id: string) => {
            navigate(`/alias-key/add/${id}`);
          }}
          onDelete={(id: string) => handleDeleteClick(id)}
          onView={() => handleshowKeyDetail(row)}
          isDeleted={row.proxy?.is_deleted}
        />
      ),
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
            <h5 className=" sm:text-xl text-white/60"> Key Management</h5>
          </div>
        </div>
      </div>
      <div className="p-5 sm:p-6">
        {/* Loading */}

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

        <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300">
          <div className="min-w-max">
            {/* 🔍 Search */}

            {/* 📊 Table */}
            <DataTable
              columns={columns}
              data={apiData}
              progressPending={loading}
              pagination
              paginationServer
              paginationTotalRows={total}
              paginationPerPage={limit}
              onChangePage={(p) => setPage(p)}
              onChangeRowsPerPage={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
              sortServer
              onSort={handleSort}
              highlightOnHover
              pointerOnHover
              customStyles={customTableStyles}
            />
          </div>
        </div>
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
      {showDetailModal && selectedRow && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 bg-black/60 backdrop-blur-md"
          onClick={(e) => {
            if (
              showDetailRef.current &&
              !showDetailRef.current.contains(e.target as Node)
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
                      <p className="text-sm font-medium text-gray-800">
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
                    <p className="p-2 font-mono text-sm text-gray-600 break-all border border-gray-200 rounded-md bg-gray-50">
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
                <div className="pt-4 mt-6 border-t border-gray-200">
                  <label className="block mb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Cost Calculation
                  </label>
                  <div className="p-3 overflow-y-auto font-mono text-sm text-gray-600 rounded-lg bg-gray-50 max-h-32 custom-scrollbar">
                    {selectedRow?.cost_calculation || "-"}
                  </div>
                </div>
              )}

              {/* Purpose - Full Width */}
              {selectedRow?.description && (
                <div className="pt-4 mt-6 border-t border-gray-200">
                  <label className="block mb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Purpose
                  </label>
                  <div className="p-3 overflow-y-auto text-sm text-gray-600 rounded-lg bg-gray-50 max-h-32 custom-scrollbar">
                    {selectedRow?.description || "-"}
                  </div>
                </div>
              )}

              {/* Proxy Configuration Section - Only if proxy exists */}
              {selectedRow?.proxy && (
                <div className="pt-4 mt-6 border-t border-gray-200">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                        Proxy Name
                      </label>
                      <p className="text-sm font-medium text-gray-600">
                        {selectedRow.proxy?.proxy_name || "-"}
                      </p>
                    </div>

                    {["Active", "Inactive"].includes(selectedRow.status) &&
                      selectedRow.proxy?.query_params &&
                      Object.keys(selectedRow.proxy.query_params).length >
                        0 && (
                        <div>
                          <label className="block mb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                            Proxy URL
                          </label>
                          <div className="p-3 overflow-y-auto text-sm text-gray-600 rounded-lg bg-gray-50 max-h-48 custom-scrollbar">
                            {!liveUrl && "No proxy data"}
                            {typeof liveUrl === "string" && liveUrl && (
                              <div className="font-mono text-gray-600 break-all">
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
                <div className="pt-4 mt-6 border-t border-gray-200">
                  <div className="p-3 border border-red-200 rounded-lg bg-red-50">
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

            {/* Content - Simple Layout */}
            <div className="flex-1 px-6 py-5 overflow-y-auto max-h-[55vh] custom-scrollbar">
              {/* Two column grid for better space utilization */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Requested By
                    </label>
                    <p className="text-sm font-medium text-gray-800">
                      {selectedRow?.user?.first_name ||
                        selectedRow?.user?.name ||
                        "-"}
                    </p>
                  </div>

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
                <div className="pt-4 mt-6 border-t border-gray-200">
                  <label className="block mb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Cost Calculation
                  </label>
                  <div className="p-3 overflow-y-auto font-mono text-sm text-gray-600 rounded-lg bg-gray-50 max-h-32 custom-scrollbar">
                    {selectedRow?.cost_calculation || "-"}
                  </div>
                </div>
              )}

              {/* Purpose - Full Width */}
              {selectedRow?.description && (
                <div className="pt-4 mt-6 border-t border-gray-200">
                  <label className="block mb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Purpose
                  </label>
                  <div className="p-3 overflow-y-auto text-sm text-gray-600 rounded-lg bg-gray-50 max-h-32 custom-scrollbar">
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
      )}{" "}
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
      {/* Total Hits Modal */}
      {showStats && selectedRow && (
        <TotalHitsModal
          data={selectedRow}
          onClose={() => setShowStats(false)}
        />
      )}
      {loading && (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default AliasKeyList;
