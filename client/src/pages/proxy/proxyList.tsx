import React, { useEffect, useState, useRef } from "react";
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiEye } from "react-icons/fi";
import { customTableStyles } from "../datatableDesign";

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

const ProxyList = () => {
  const navigate = useNavigate();

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
      <button
        onClick={() => navigate(`/proxy/add/${row._id}`)}
        className="flex items-center justify-center p-1.5 text-blue-600 hover:text-white hover:bg-blue-500 rounded-md transition-all duration-200 group relative"
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

      <button
        onClick={() => handleActionClick(row)}
        className="flex items-center justify-center p-1.5 text-gray-600 hover:text-white hover:bg-gray-500 rounded-md transition-all duration-200 group relative"
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
      width: "70px",
    },
    {
      name: "Proxy Name",
      selector: (row: any) => row.proxy_name,
      sortable: true,
      width: "250px",
      sortField: "proxy_name",

      grow: 1,
      cell: (row) => (
        <span className="break-words whitespace-normal">
          {row.proxy_name || "-"}
        </span>
      ),
    },
    {
      name: "Curl",
      selector: (row: any) => row.curl,
      sortable: true,
      sortField: "curl",
      grow: 3,
      width: "500px",
      wrap: true,
      cell: (row) => (
        <span className="break-all whitespace-normal ">{row.curl || "-"}</span>
      ),
    },
    {
      name: "Credit",
      selector: (row: any) => row.credit,
      sortable: true,
      sortField: "credit",
      width: "120px",
    },
    {
      name: "Created",
      selector: (row: any) => row.createdAt,
      sortable: true,
      width: "120px",

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
    {
      name: "Actions",
      ignoreRowClick: true,
      cell: ActionColumn,
      width: "120px",
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
            <h5 className=" sm:text-xl text-white/60">Proxy</h5>
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

            {/* Proxy Details - Modern Layout */}
            <div className="flex-1 px-6 py-5 overflow-y-auto max-h-[55vh] custom-scrollbar">
              {/* Two column grid for better space utilization */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Proxy Name
                    </label>
                    <p className="text-sm font-medium text-gray-800 break-words">
                      {selectedRow?.proxy_name || "-"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase break-words">
                      Project Name
                    </label>
                    <p className="text-sm text-gray-600 break-words">
                      {selectedRow?.project_name || "-"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Credit
                    </label>
                    <p className="text-lg font-bold text-indigo-600">
                      {selectedRow?.credit || "0"}
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
                    <p className="text-sm text-gray-600 break-words">
                      {selectedRow?.domain_name || "-"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Proxy Token
                    </label>
                    <div className="flex items-center gap-2">
                      <p className="flex-1 p-2 font-mono text-sm text-gray-700 break-all whitespace-pre-wrap border border-gray-200 rounded-md bg-gray-50">
                        {selectedRow?.proxy_token || "-"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Token for Curl
                    </label>
                    <div className="flex items-center gap-2">
                      <p className="flex-1 p-2 font-mono text-sm text-gray-700 break-all border border-indigo-200 rounded-md bg-indigo-50">
                        {selectedRow?.curl_token || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Curl Command - Full Width with Copy */}
              <div className="pt-4 mt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Curl Command
                  </label>
                </div>
                <pre className="font-mono text-xs text-black break-words whitespace-pre-wrap bg-gray-100 rounded-lg ">
                  <code className="">{selectedRow?.curl || "-"}</code>
                </pre>
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
};

export default ProxyList;
