import React, { useEffect, useState, useRef } from "react";
import {
  model_divider,
  model_botton_container,
  close_cancel_button,
  getStatusStyle,
  char_max_len_listing,
  generateProxyUrl,
  handleCopy,
  fallbackCopy,
  heading_label_style,
  label_style,
  input_style,
  input_style_with_gray_border,
} from "../../utils/CommonFn";
import {
  FiSearch,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiExternalLink,
} from "react-icons/fi";
import { customTableStyles } from "../datatableDesign";
import CurlModal from "./CurlModal";

import DataTable from "react-data-table-component";
import apiClient from "../../services/apiClient";
import toast from "react-hot-toast";
import { MdClose } from "react-icons/md";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiArrowUp,
  FiArrowDown,
} from "react-icons/fi";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

import { FiChevronDown, FiChevronUp, FiCopy, FiCheck } from "react-icons/fi";

function CurlCell({ curl }: { curl: string }) {
  const [expanded, setExpanded] = useState(false);

  if (!curl) return <span className="text-gray-400">-</span>;

  const isLong = curl.length > 70;
  const truncated = curl.substring(0, 70);

  return (
    <div className="text-gray-800 break-all whitespace-pre-wrap ">
      {!expanded && isLong ? (
        <>
          {truncated}
          <span className="items-center ">
            ...{" "}
            <button
              onClick={() => setExpanded(true)}
              className="ml-1 text-black align-middle hover:text-gray-700"
            >
              <FiChevronDown size={14} />
            </button>
          </span>
        </>
      ) : (
        <>
          {curl}
          {isLong && (
            <button
              onClick={() => setExpanded(false)}
              className="ml-1 text-gray-500 align-middle hover:text-gray-700"
            >
              <FiChevronUp size={14} />
            </button>
          )}
        </>
      )}
    </div>
  );
}

type Props = {
  status: string;
};

const ProxyList = ({ status }: Props) => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCurl, setSelectedCurl] = useState("");

  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [apiData, setApiData] = useState<IProxy[]>([]);
  const location = useLocation();

  const searchRef = useRef<HTMLInputElement>(null);

  const [sortField, setSortField] = useState("_id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedRow, setSelectedRow] = useState<IProxy | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showActiveInactiveModal, setShowActiveInactiveModal] = useState(false);
  const [newStatus, setNewStatus] = useState(false);

  const [mobileView, setMobileView] = useState(false);
  const deleteModalRef = useRef<HTMLDivElement>(null);
  const actionModalRef = useRef<HTMLDivElement>(null);
  const [sort, setSort] = useState({
    field: "createdAt",
    order: "desc" as "asc" | "desc",
  });
  const handleActionClick = (row: IProxy) => {
    setSelectedRow(row);
    setShowModal(true);
  };
  const openCurlModal = (curl) => {
    setSelectedCurl(curl);
    setModalOpen(true);
  };

  const closeCurlModal = () => {
    setModalOpen(false);
    setSelectedCurl("");
  };
  const controllerRef = useRef<AbortController | null>(null);
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
    } catch (error: unknown) {
      const err = error as Error & {
        response?: { data?: { message?: string } };
      };
      setApiData(previousData);
      toast.error(err?.response?.data?.message || "Delete failed");
    } finally {
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };
  // 🔥 Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);
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
  // 🔥 Fetch data
  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    const controller = new AbortController();
    controllerRef.current = controller;

    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await apiClient.get(BACKEND_URL + "/api/proxy", {
          signal: controller.signal,
          params: {
            page,
            limit,
            search: debouncedSearch,
            sortField: sort.field,
            sortOrder: sort.order,
            is_deleted: status === "deleted" ? true : false,
          },
        });

        setApiData(data.data);
        setTotal(data.pagination.total);
      } catch (err: any) {
        if (err.name !== "CanceledError") {
          toast.error(err?.message || "Error fetching data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, [page, limit, debouncedSearch, sort.field, sort.order]);

  // 🔥 Handle sort
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

  const ActionColumn = (row: IProxy) => (
    <div className="flex items-center gap-1">
      {status === "active" && (
        <>
          <button
            onClick={() => navigate(`/proxy/add/${row._id}`)}
            className="flex items-center justify-center p-1.5 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-all duration-200"
            title="Edit"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleDeleteClick(row._id)}
            className="flex items-center justify-center p-1.5 text-red-600 hover:text-white hover:bg-red-500 rounded-md transition-all duration-200 group relative"
            title="Delete"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </>
      )}
      <button
        onClick={() => navigate(`/proxy/view/${row._id}`)}
        className="flex items-center justify-center p-1.5 text-blue-600 hover:text-white hover:bg-blue-500 rounded-md transition-all duration-200 group relative"
        title="View"
      >
        <FiEye className="w-4 h-4" />
      </button>
    </div>
  );
  // 🔥 Columns
  const columns = [
    {
      name: "No.",
      cell: (_: any, index: number) => (page - 1) * limit + index + 1,
      minWidth: "70px",
      width: "70px",
    },
    {
      name: "Proxy Name",
      selector: (row: any) => row.proxy_name,
      sortable: true,
      grow: 1,
      minWidth: "150px",
      sortField: "proxy_name",

      cell: (row, index) => {
        const name = row.proxy_name || "-";
        const maxLength = char_max_len_listing;

        const isTopRow = index === 0;
        const isLastRow = index === apiData.length - 1;

        const truncateText = (text, length) => {
          if (text.length <= length) return text;
          return text.substring(0, length) + "...";
        };

        return (
          <div className="relative font-semibold text-gray-900 group">
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
      name: "Curl",
      selector: (row: any) => row.curl,
      sortable: true,
      sortField: "curl",
      cell: (row) => (
        <div className="flex items-center w-full">
          <div className="flex-1 min-w-0 text-left rounded">
            {/* Responsive truncation based on screen size */}
            <span className="hidden text-left sm:inline">
              {row.curl?.substring(0, 80)}...
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openCurlModal(row.curl);
                }}
                className="inline-flex p-1 ml-2 transition-colors rounded hover:bg-gray-100"
                title="View full curl"
              >
                <FiExternalLink size={14} className="text-blue-500" />
              </button>
            </span>
            <span className="inline text-left sm:hidden">
              {row.curl?.substring(0, 40)}...
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openCurlModal(row.curl);
                }}
                className="inline-flex p-1 ml-2 transition-colors rounded hover:bg-gray-100"
                title="View full curl"
              >
                <FiExternalLink size={14} className="text-blue-500" />
              </button>
            </span>
          </div>
        </div>
      ),
      minWidth: "180px",
      width: "auto",
      grow: 2,
    },
    {
      name: "Credit",
      selector: (row: any) => row.credit,
      sortable: true,
      sortField: "credit",
      width: "100px", // Keep as is, it's small
      minWidth: "100px",
    },
    {
      name: "Created",
      selector: (row: any) => row.createdAt,
      sortable: true,
      width: "130px",
      minWidth: "130px",

      sortField: "createdAt",
      cell: (row) =>
        row.createdAt
          ? new Date(row.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "-",
    },
    ...(status === "deleted"
      ? [
          {
            name: "Deleted",
            sortable: true,
            width: "130px",
            sortField: "deleted_at",
            cell: (row: any) =>
              row.deleted_at
                ? new Date(row.deleted_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "-",
          },
        ]
      : []),
    {
      name: "Actions",
      ignoreRowClick: true,
      cell: ActionColumn,
      width: "120px",
      minWidth: "120px",
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
            <h5 className=" sm:text-xl text-white/60">
              {status === "deleted" ? "Deleted Proxy" : "Proxy"}{" "}
            </h5>
          </div>
        </div>
      </div>
      <div className="p-5 sm:p-6">
        {/* Search + Action Row */}
        <div className="flex flex-col gap-3 mb-5 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <input
              ref={searchRef}
              type="text"
              placeholder="Search proxy, curl, credit"
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
          {status === "active" && (
            <Link
              to="/proxy/add"
              className="whitespace-nowrap inline-flex items-center justify-center gap-2 bg-primary hover:bg-primaryHover text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm"
            >
              <FiPlus className="w-4 h-4" />
              Create Proxy
            </Link>
          )}
        </div>

        {/* CONTENT (Table / List / etc.) */}
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
                  rows: {
                    style: {
                      cursor: "pointer",
                    },
                  },
                  cells: {
                    style: {
                      pointerEvents: "auto", // ✅ ensures clicks bubble
                    },
                  },
                }}
                responsive
                onRowClicked={(row) => navigate(`/proxy/view/${row._id}`)}
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
            <div className={model_divider}></div>

            {/* Actions */}
            <div className={model_botton_container}>
              <button
                onClick={() => setShowDeleteModal(false)}
                className={close_cancel_button}
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
            <div className="flex items-center justify-between px-6 py-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">
                Proxy Details
              </h2>
            </div>

            {/* Proxy Details - Modern Layout */}
            {/* Content - Clean & Readable */}
            <div className="flex-1 px-8 py-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
              {/* Basic Information Section */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-4 rounded-full bg-secondary"></div>
                  <h3 className="text-base font-medium text-gray-700">
                    Basic Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <div className="mb-1 text-xs text-gray-500">Proxy Name</div>
                    <div className="text-sm text-gray-900">
                      {selectedRow?.proxy_name || "-"}
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 text-xs text-gray-500">
                      Project Name
                    </div>
                    <div className="text-sm text-gray-900">
                      {selectedRow?.project_name || "-"}
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 text-xs text-gray-500">
                      Domain Name
                    </div>
                    <div className="text-sm text-gray-900 break-all">
                      {selectedRow?.domain_name || "-"}
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 text-xs text-gray-500">
                      Created Date
                    </div>
                    <div className="text-sm text-gray-900">
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
                </div>
              </div>

              {/* Credit Information Section */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-4 rounded-full bg-secondary"></div>
                  <h3 className="text-base font-medium text-gray-700">
                    Credit Information
                  </h3>
                </div>

                <div>
                  <div className="mb-1 text-xs text-gray-500">Credit</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {selectedRow?.credit?.toLocaleString() || "0"}
                  </div>
                </div>
              </div>

              {/* Tokens Section */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-4 rounded-full bg-secondary"></div>
                  <h3 className="text-base font-medium text-gray-700">
                    Access Tokens
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="mb-1 text-xs text-gray-500">
                      Proxy Token
                    </div>
                    <div className="p-2 font-mono text-sm text-gray-900 break-all border border-gray-100 rounded bg-gray-50">
                      {selectedRow?.proxy_token || "-"}
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 text-xs text-gray-500">
                      Token for Curl
                    </div>
                    <div className="p-2 font-mono text-sm text-gray-900 break-all border border-gray-100 rounded bg-gray-50">
                      {selectedRow?.curl_token || "-"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Curl Command Section - Full Width */}
              {selectedRow?.curl && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 rounded-full bg-secondary"></div>
                    <h3 className="text-base font-medium text-gray-700">
                      Curl Command
                    </h3>
                  </div>
                  <div className="p-3 border border-gray-100 rounded bg-gray-50">
                    <pre className="font-mono text-xs text-gray-700 break-all whitespace-pre-wrap">
                      {selectedRow.curl}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Divider - Simplified */}
            <div className="border-t border-gray-100"></div>

            {/* Actions - Kept as requested but improved button */}
            <div className="flex justify-end gap-3 px-6 pb-6">
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
      <CurlModal
        isOpen={modalOpen}
        onClose={closeCurlModal}
        curl={selectedCurl}
      />
      {loading && (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default ProxyList;
