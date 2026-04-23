import { FiX } from "react-icons/fi";
import { customTableStyles } from "../datatableDesign";
import StatusBadge, { getStatusConfig } from "../../utils/StatusBadge";
import {
  generateProxyUrl,
  handleCopy,
  fallbackCopy,
  char_max_len_listing,
  heading_label_style,
  label_style,
  input_style,
  input_style_with_gray_border,
} from "../../utils/CommonFn";
import { MdFirstPage, MdLastPage } from "react-icons/md";
import { CheckCircle, XCircle } from "lucide-react";
import {
  FiSearch,
  FiPlus,
  FiCopy,
  FiEdit2,
  FiEye,
  FiTrash2,
  FiAlertCircle,
  FiList,
} from "react-icons/fi";

import TotalHitsModal from "../aliasKey/TotalHitsModal";
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

import { useAuth } from "../../context/AuthContext";

import { AlertTriangle } from "lucide-react";
import { MdClose } from "react-icons/md";
import React, { useEffect, useState, useRef, useCallback } from "react";
import DataTable from "react-data-table-component";
import apiClient from "../../services/apiClient";
import toast from "react-hot-toast";

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

const KeyMonitorActive = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const searchRef = useRef<HTMLInputElement>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState<IAliasKey[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // 🔥 Filter states
  const [keyStatusFilter, setKeyStatusFilter] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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
  // const handleDeleteClick = (id: string) => {
  //   setDeleteId(id);
  //   setShowDeleteModal(true);
  // };
  // const handleConfirmDelete = async () => {
  //   if (!deleteId) return;

  //   const previousData = apiData;
  //   setApiData((prev) => prev.filter((p) => p._id !== deleteId));

  //   try {
  //     const res = await apiClient.delete(
  //       `${BACKEND_URL}/api/alias-key/${deleteId}`,
  //     );
  //     toast.success(res.data.message);
  //   } catch (error: any) {
  //     setApiData(previousData);
  //     toast.error(error.response?.data?.message || "Delete failed");
  //   } finally {
  //     setShowDeleteModal(false);
  //     setDeleteId(null);
  //   }
  // };
  const handleshowKeyDetail = (row: IAliasKey) => {
    setSelectedRow(row);
    setShowDetailModal(true);

    const proxyResult = row?.proxy
      ? generateProxyUrl(row.proxy.curl || "", row.proxy.curl_token || "")
      : "";
    setLiveUrl(proxyResult);
  };
  // const handleApprove = async (action: string) => {
  //   try {
  //     setLoading(true);
  //     const userData = {
  //       id: selectedRow?._id,
  //       action: action,
  //     };
  //     const response = await apiClient.post(
  //       "/api/alias-key/perform-action",
  //       userData,
  //     );
  //     toast.success(response?.data?.message);
  //     fetchData();
  //     setShowPendingRejectedModal(false);
  //   } catch (err) {
  //     toast.error("Something went wrong");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  // const handleActiveInactive = async (action: string) => {
  //   try {
  //     setLoading(true);
  //     const userData = {
  //       id: selectedRow?._id,
  //       action: action,
  //     };
  //     const response = await apiClient.post(
  //       "/api/alias-key/make-active-inactive",
  //       userData,
  //     );
  //     toast.success(response?.data?.message);
  //     fetchData();
  //     setShowActiveInactiveModal(false);
  //     setNewStatus("");
  //   } catch (err) {
  //     toast.error("Something went wrong");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  // Status Badge Component
  // const StatusBadge = ({
  //   row,
  //   userRole,
  //   onActionClick,
  //   onStatusChange,
  //   isDeleted,
  // }: any) => {
  //   const getStatusConfig = (status: string) => {
  //     switch (status) {
  //       case "Active":
  //         return {
  //           bg: "bg-green-50",
  //           text: "text-green-700",
  //           dot: "bg-green-500",
  //           border: "border-green-200",
  //           icon: CheckCircle,
  //         };
  //       case "Inactive":
  //         return {
  //           bg: "bg-gray-100",
  //           text: "text-gray-600",
  //           dot: "bg-gray-400",
  //           border: "border-gray-300",
  //           icon: XCircle,
  //         };
  //       case "Pending":
  //         return {
  //           bg: "bg-yellow-50",
  //           text: "text-yellow-700",
  //           dot: "bg-yellow-500",
  //           border: "border-yellow-200",
  //           icon: AlertTriangle,
  //         };
  //       case "Rejected":
  //         return {
  //           bg: "bg-red-50",
  //           text: "text-red-700",
  //           dot: "bg-red-500",
  //           border: "border-red-200",
  //           icon: XCircle,
  //         };
  //       default:
  //         return {
  //           bg: "bg-gray-50",
  //           text: "text-gray-700",
  //           dot: "bg-gray-500",
  //           border: "border-gray-200",
  //           icon: AlertTriangle,
  //         };
  //     }
  //   };

  //   const statusConfig = getStatusConfig(row.key_status);
  //   const Icon = statusConfig.icon;

  //   if (userRole === "Admin") {
  //     if (row.key_status === "Pending") {
  //       return (
  //         <button
  //           disabled={isDeleted}
  //           onClick={() => onActionClick(row)}
  //           className={`inline-flex items-center gap-1.5 px-2.5 py-1 font-medium rounded-full ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}
  //           title="Click to approve/reject"
  //         >
  //           <Icon className="w-4 h-4" />
  //           {row.key_status}
  //         </button>
  //       );
  //     } else if (row.key_status === "Active" || row.key_status === "Inactive") {
  //       return (
  //         <button
  //           disabled={isDeleted}
  //           onClick={() =>
  //             onStatusChange(
  //               row,
  //               row.key_status === "Active" ? "Inactive" : "Active",
  //             )
  //           }
  //           className={`inline-flex items-center gap-1.5 px-2.5 py-1 font-medium rounded-full ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}
  //           title="Click to change status"
  //         >
  //           <Icon className="w-4 h-4" />
  //           {row.key_status}
  //         </button>
  //       );
  //     }
  //   }

  //   return (
  //     <span
  //       className={`inline-flex items-center gap-1.5 px-2.5 py-1 font-medium rounded-full ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}
  //     >
  //       <Icon className="w-4 h-4" />
  //       {row.key_status}
  //     </span>
  //   );
  // };
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

    fetchData();

    return () => controller.abort();
  }, [
    page,
    limit,
    debouncedSearch,
    sort.field,
    sort.order,
    keyStatusFilter,
    appliedStartDate, // ✅ ADD THIS
    appliedEndDate,
    // startDate,
    // endDate,
  ]);
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
            search: debouncedSearch,
            sortField: sort.field,
            sortOrder: sort.order,
            ...(keyStatusFilter && { key_status: keyStatusFilter }),
            // Only send date filters when both dates are available
            ...(appliedStartDate &&
              appliedEndDate && {
                startDate: appliedStartDate,
                endDate: appliedEndDate,
              }),
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
  }, [
    page,
    limit,
    debouncedSearch,
    sort.field,
    sort.order,
    keyStatusFilter,

    appliedStartDate, // ✅ ADD
    appliedEndDate,
  ]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);
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
  const KeyStatusBadge = ({
    type,
    row,
    userRole,
    onActionClick,
    onStatusChange,
    isDeleted,
  }: any) => {
    // const getStatusConfig = (status: string) => {
    //   switch (status) {
    //     case "Active":
    //       return {
    //         bg: "bg-green-50",
    //         text: "text-green-700",
    //         dot: "bg-green-500",
    //         border: "border-green-200",
    //         icon: CheckCircle,
    //       };
    //     case "Inactive":
    //       return {
    //         bg: "bg-gray-100",
    //         text: "text-gray-600",
    //         dot: "bg-gray-400",
    //         border: "border-gray-300",
    //         icon: XCircle,
    //       };
    //   }
    // };

    const statusConfig = getStatusConfig(row.key_status);
    const Icon = statusConfig.icon;

    const commonClass = `inline-flex items-center gap-1.5 px-2.5 py-1 font-medium rounded-full border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`;

    return (
      <span className={commonClass}>
        <Icon className="w-4 h-4" />
        {statusConfig.label}
      </span>
    );
  };
  // 🔥 Columns
  const columns = [
    {
      name: "No.",
      cell: (_: any, index: number) => (page - 1) * limit + index + 1,
      minWidth: "70px",
    },

    {
      name: "Key",
      selector: (row: any) => row.alias_key,
      sortable: true,
      sortField: "alias_key",
      minWidth: "250px",
      grow: 2,
      cell: (row: IAliasKey) => (
        <div className="relative flex items-center gap-2 group">
          <span
            className={`font-semibold ${row.proxy?.is_deleted ? "text-gray-400 line-through" : "text-gray-900"} break-all`}
          >
            {row.alias_key || "-"}
          </span>
          {row.proxy?.is_deleted && (
            <>
              {/* Cross Icon */}
              <FiX className="w-4 h-4 text-red-500" />

              {/* Tooltip on Hover */}
              <div className="absolute z-10 invisible px-2 py-1 ml-2 text-xs text-white transition-all duration-200 bg-gray-900 rounded-md opacity-0 pointer-events-none group-hover:visible group-hover:opacity-100 whitespace-nowrap left-full">
                Proxy deleted
                <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-1.5 h-1.5 bg-gray-900 rotate-45"></div>
              </div>
            </>
          )}
        </div>
      ),
    },
    {
      name: "Domain Name",
      selector: (row: any) => row.domain_name,
      sortable: true,
      sortField: "domain_name",
      minWidth: "250px",
      grow: 2,
      wrap: true,
      cell: (row, index) => {
        const name = row.domain_name || "-";
        const maxLength = char_max_len_listing;

        const isTopRow = index === 0;
        const isLastRow = index === apiData.length - 1;

        const truncateText = (text, length) => {
          if (text.length <= length) return text;
          return text.substring(0, length) + "...";
        };

        return (
          <div className="relative group">
            <span>{truncateText(name, maxLength)}</span>

            {name.length > maxLength && (
              <div
                className={`invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute z-10 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-normal break-words max-w-md left-0 ${
                  isTopRow
                    ? "top-full mt-1"
                    : isLastRow
                      ? "bottom-full mb-1"
                      : "bottom-full mb-1"
                }`}
              >
                {name}
              </div>
            )}
          </div>
        );
      },
    },

    {
      name: "Total Quota",
      selector: (row: any) => row.total_quota,
      sortable: true,
      sortField: "total_quota",
      width: "150px",
      minWidth: "100px",
      cell: (row: IAliasKey) => <span>{row.total_quota || "0"}</span>,
    },
    {
      name: "Total Available",
      selector: (row: any) => row.remaining_quota,
      sortable: true,
      sortField: "remaining_quota",
      width: "150px",
      minWidth: "100px",
      cell: (row: IAliasKey) => <span>{row.remaining_quota || "0"}</span>,
    },
    {
      name: "Total Hits",
      selector: (row: any) => row.total_history_records,
      sortable: false,
      width: "150px",
      minWidth: "100px",
      cell: (row: IAliasKey) => {
        const value = row.total_history_records || 0;

        return (
          <button
            onClick={
              value > 0
                ? () => {
                    setSelectedRow(row);
                    setShowStats(true);
                  }
                : undefined
            }
            className={`font-medium ${
              value > 0
                ? "text-blue-600 hover:text-blue-700 cursor-pointer underline"
                : "text-gray-400 "
            }`}
            disabled={value === 0}
          >
            {value}
          </button>
        );
      },
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
      minWidth: "140px",
    },
    {
      name: "Status",
      selector: (row: IAliasKey) => row.key_status,
      sortable: true,
      sortField: "key_status",
      // cell: (row: IAliasKey) => (
      //   <span
      //     className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(
      //       row.key_status,
      //     )}`}
      //   >
      //     <StatusBadge status={row.key_status} />
      //   </span>
      // ),
      cell: (row: IAliasKey) => (
        <KeyStatusBadge
          type="key_status"
          row={row}
          userRole={user?.role}
          onActionClick={() => handleActionClick(row)}
          onStatusChange={handleActiveInactiveClick}
          isDeleted={row.proxy?.is_deleted}
        />
      ),
      width: "150px",
      minWidth: "150px",
    },
    {
      name: "Actions",
      cell: (row: IAliasKey, index: number | undefined) => (
        <div className="flex items-center gap-0">
          <button
            onClick={() => handleshowKeyDetail(row)}
            className="flex items-center justify-center p-1.5 text-blue-600 hover:text-white hover:bg-blue-500 rounded-md transition-all duration-200 group relative"
            title="View Details"
          >
            <FiEye size={16} />
          </button>
          <button
            onClick={() => navigate(`/api-history/${row._id}`)}
            className="p-1.5 text-purple-600 hover:text-purple-700  hover:bg-purple-400 rounded-lg transition-colors"
            title="History"
          >
            <FiList className="w-4 h-4" />
          </button>
        </div>
      ),
      sortable: false,
      width: "100px",
      minWidth: "100px",
      grow: 0,
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

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          {/* LEFT */}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {/* Search */}
            <div className="relative w-full sm:w-60 md:w-56">
              <input
                ref={searchRef}
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full py-2 text-sm border border-gray-300 rounded-lg shadow-sm pl-9 pr-9 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
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
                  <MdClose size={16} />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
              <select
                value={keyStatusFilter}
                onChange={(e) => {
                  setKeyStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="border border-gray-300 rounded-lg px-2.5 py-2 text-xs sm:text-sm"
              >
                <option value="">All Key Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <input
                type="date"
                value={startDate}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="border border-gray-300 rounded-lg px-2.5 py-2 text-xs sm:text-sm"
              />

              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                disabled={!startDate}
                className={`border border-gray-300 rounded-lg px-2.5 py-2 text-xs sm:text-sm ${
                  !startDate ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />

              <button
                type="button"
                disabled={!startDate || !endDate}
                onClick={() => {
                  setAppliedStartDate(startDate);
                  setAppliedEndDate(endDate);
                  setPage(1);
                }}
                className={`px-2.5 py-2 text-xs font-medium rounded-lg border ${
                  startDate && endDate
                    ? "text-primary border-primary bg-white hover:bg-primary hover:text-white"
                    : "text-gray-400 bg-gray-200 cursor-not-allowed"
                }`}
              >
                Filter
              </button>

              <button
                type="button"
                onClick={() => {
                  setKeyStatusFilter("");
                  setAppliedStartDate(""); // ✅ add this
                  setAppliedEndDate("");
                  setStartDate("");
                  setEndDate("");
                  setSearch("");
                  searchRef.current?.focus();
                  setPage(1);
                }}
                className="px-2.5 py-2 text-xs font-medium text-primary border border-primary bg-white hover:bg-primary hover:text-white rounded-lg"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden">
          <div className="overflow-hidden shadow-sm rounded-xl">
            <div className="w-full data-table-responsive">
              <DataTable
                columns={columns}
                data={apiData}
                progressPending={loading}
                pagination
                paginationServer
                paginationTotalRows={total}
                paginationDefaultPage={page}
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
                customStyles={{
                  ...customTableStyles,
                  table: {
                    style: {
                      width: "100%",
                    },
                  },
                }}
                responsive
                onRowClicked={(row) => navigate(`/api-history/${row._id}`)}
              />
            </div>
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
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
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

            {/* Header - Unchanged */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">
                Key Details
              </h2>
            </div>

            {/* Content - Clean & Readable */}
            <div className="flex-1 px-8 py-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
              {/* Key Information Section */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-4 rounded-full bg-secondary"></div>
                  <h3 className={heading_label_style}>
                    Key & User Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={label_style}>Key</span>
                      <button
                        onClick={() => handleCopy(selectedRow?.alias_key || "")}
                        className="text-gray-400 transition-colors hover:text-gray-600"
                      >
                        <FiCopy className="w-4 h-4" />
                      </button>
                    </div>
                    <div
                      className={`${input_style} bg-gray-50 p-2 rounded border border-gray-100 break-all`}
                    >
                      {selectedRow?.alias_key || "-"}
                    </div>
                  </div>

                  <div>
                    <div className={label_style}>Domain Name</div>
                    <div className={input_style}>
                      {selectedRow?.domain_name || "-"}
                    </div>
                  </div>

                  <div>
                    <div className={label_style}>Project Name</div>
                    <div className={input_style}>
                      {selectedRow?.project_name || "-"}
                    </div>
                  </div>

                  <div>
                    <div className={label_style}>Requested By</div>
                    <div className={input_style}>
                      {selectedRow.user?.first_name ||
                        selectedRow.user?.name ||
                        "-"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status & Dates Section */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-4 rounded-full bg-secondary"></div>
                  <h3 className={heading_label_style}>Status & Timeline</h3>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {/* Status */}
                  <div>
                    <div className={label_style}>Status</div>
                    <span className={`inline-block px-3 py-1 text-sm`}>
                      <StatusBadge
                        status={
                          selectedRow.proxy?.is_deleted === true
                            ? "deleted"
                            : selectedRow.key_status
                        }
                      />
                    </span>
                  </div>
                  <div>
                    <div className={label_style}>Approval Status</div>
                    <span className={`inline-block px-3 py-1 text-sm`}>
                      <StatusBadge status={selectedRow.approval_status} />
                    </span>
                  </div>

                  {/* Created Date */}
                  <div>
                    <div className={label_style}>Created Date</div>
                    <div className={input_style}>
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
                    </div>
                  </div>

                  {/* ✅ Full width rejection reason */}
                  {selectedRow?.approval_status === "Rejected" &&
                    selectedRow?.rejection_reason && (
                      <div className="md:col-span-2">
                        {/* ✅ Label (separate, consistent) */}
                        <div className={label_style}>Reason for Rejection</div>

                        {/* ✅ Value (styled box) */}
                        <div className="p-3 mt-1 text-gray-700 break-words border border-gray-200 rounded-md bg-gray-50">
                          {selectedRow.rejection_reason}
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* Quota & Cost Section */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-4 rounded-full bg-secondary"></div>
                  <h3 className={heading_label_style}>Quota & Cost</h3>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <div className={label_style}>Total Quota</div>
                    <div className={input_style}>
                      {selectedRow?.total_quota || "-"}
                    </div>
                  </div>

                  <div>
                    <div className={label_style}>Total Estimated Cost</div>
                    <div className={input_style}>
                      {selectedRow?.total_estimated_cost
                        ? `$${selectedRow.total_estimated_cost}`
                        : "-"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Details - Only if they exist */}
              {selectedRow?.cost_calculation && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 rounded-full bg-secondary"></div>
                    <h3 className={heading_label_style}>Cost Calculation</h3>
                  </div>
                  <div className={input_style_with_gray_border}>
                    {selectedRow.cost_calculation}
                  </div>
                </div>
              )}

              {selectedRow?.description && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 rounded-full bg-secondary"></div>
                    <h3 className={heading_label_style}>Purpose</h3>
                  </div>
                  <div className={input_style_with_gray_border}>
                    {selectedRow.description}
                  </div>
                </div>
              )}

              {/* Proxy Configuration - Only if exists and active */}
              {selectedRow?.proxy &&
                ["Approved"].includes(selectedRow.approval_status) && (
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-4 rounded-full bg-secondary"></div>
                      <h3 className={heading_label_style}>
                        Proxy Configuration
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <div>
                        <div className={label_style}>Proxy Name</div>
                        <span className={input_style}>
                          {selectedRow.proxy.proxy_name || "-"}
                        </span>
                      </div>
                      {liveUrl && (
                        <div>
                          <div className={label_style}>Method</div>
                          <span className={input_style}>{liveUrl.method}</span>
                          {/* <button
                                           onClick={() =>
                                             handleCopy(liveUrl?.curlCommand || "")
                                           }
                                           className="text-gray-400 transition-colors hover:text-gray-600"
                                         >
                                           <FiCopy className="w-4 h-4" />
                                         </button> */}
                        </div>
                      )}
                    </div>

                    {liveUrl && (
                      <div>
                        {liveUrl && (
                          <div>
                            {/* Header row */}
                            <div className="flex items-center justify-between mt-5 mb-2">
                              <div className={label_style}>Curl URL</div>

                              <button
                                onClick={() =>
                                  handleCopy(liveUrl?.curlCommand || "")
                                }
                                className="text-gray-400 transition-colors hover:text-gray-600"
                                title="Copy"
                              >
                                <FiCopy className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Curl content */}
                            <div className={input_style_with_gray_border}>
                              {liveUrl?.curlCommand}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

              {/* Proxy Deleted Warning - Clean version */}
              {selectedRow.proxy?.is_deleted === true && (
                <div className="mb-8">
                  <div className="p-3 border border-red-200 rounded bg-red-50">
                    <div className="flex items-center gap-2">
                      <FiAlertCircle className="w-4 h-4 text-red-500" />
                      <span className="p-0 text-sm text-red-700 rounded-lg bg-red-50">
                        This proxy has been deleted and is no longer available
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Proxy Permission */}
              {selectedRow?.proxy_permission_required && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 rounded-full bg-secondary"></div>
                    <h3 className={heading_label_style}>
                      Additional Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                      <div className={label_style}>Proxy Permission</div>
                      <span className={input_style}>
                        {selectedRow.proxy_permission_required}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100"></div>

            {/* Footer - Unchanged */}
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

export default KeyMonitorActive;
