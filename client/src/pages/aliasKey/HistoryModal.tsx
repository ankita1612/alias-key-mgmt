import { MdArrowForward } from "react-icons/md";
import React, { useState, useEffect } from "react";
import { MdClose, MdExpandMore, MdExpandLess } from "react-icons/md";
import {
  model_divider,
  model_botton_container,
  close_cancel_button,
} from "../../utils/CommonFn";
import { AiFillCheckCircle, AiFillCloseCircle } from "react-icons/ai";
import { MdInfo } from "react-icons/md";
import { FaTrash, FaPen, FaPlus } from "react-icons/fa";

interface LogStyleInput {
  action?: string;
  desc?: string;
}

export const getLogStyle = ({ action, desc }: LogStyleInput) => {
  const act = action?.toUpperCase();

  // ✅ PRIORITY: action-based
  if (act === "CREATE") {
    return {
      icon: <FaPlus className="w-4 h-4 text-green-500" />,
      color: "text-green-600",
      bg: "bg-green-50",
    };
  }

  if (act === "UPDATE") {
    return {
      icon: <FaPen className="w-4 h-4 text-blue-500" />,
      color: "text-blue-600",
      bg: "bg-blue-50",
    };
  }

  if (act === "DELETE") {
    return {
      icon: <FaTrash className="w-4 h-4 text-red-500" />,
      color: "text-red-600",
      bg: "bg-red-50",
    };
  }

  // ✅ SECONDARY: desc-based (for special cases)
  const text = desc?.toLowerCase() || "";

  if (text.includes("approved")) {
    return {
      icon: <AiFillCheckCircle className="w-4 h-4 text-green-500" />,
      color: "text-green-600",
      bg: "bg-green-50",
    };
  }

  if (text.includes("rejected")) {
    return {
      icon: <AiFillCloseCircle className="w-4 h-4 text-red-500" />,
      color: "text-red-600",
      bg: "bg-red-50",
    };
  }

  // ✅ fallback
  return {
    icon: <MdInfo className="w-3 h-3 text-gray-500" />,
    color: "text-gray-600",
    bg: "bg-gray-50",
  };
};

interface Props {
  open: boolean;
  onClose: () => void;
  data: any[];
  title: string;
}

const HistoryModal: React.FC<Props> = ({ open, onClose, data, title }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  useEffect(() => {
    if (open) {
      setExpandedIndex(null);
    }
  }, [open]);
  if (!open) return null;

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 bg-black/60 backdrop-blur-md"
      onClick={onClose} // 👈 closes on outside click
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden transition-all duration-300 transform bg-white shadow-2xl rounded-2xl animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()} // 👈 prevents inside click from closing
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute z-10 flex items-center justify-center w-10 h-10 transition-all duration-200 bg-white top-4 right-4 hover:text-gray-600 group"
        >
          <MdClose className="w-5 h-5 transition-transform group-hover:scale-110" />
        </button>

        {/* Header */}

        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
        </div>
        {/* Body */}
        <div className="px-8 py-6 overflow-y-auto max-h-[65vh] custom-scrollbar">
          {data.length === 0 ? (
            <p className="text-sm text-center text-gray-500">
              No history available
            </p>
          ) : (
            <div className="relative pl-6 space-y-6 border-l border-gray-200">
              {data.map((log, index) => {
                const style = getLogStyle({
                  action: log.action,
                  desc: log.desc,
                });
                const isOpen = expandedIndex === index;

                return (
                  <div key={index} className="relative group">
                    {/* Timeline Dot */}
                    <span className="absolute -left-[40px] w-7 h-7 flex items-center justify-center bg-white border-2 border-gray-200 rounded-full shadow-sm group-hover:scale-110 transition">
                      {style.icon}
                    </span>

                    {/* Card */}
                    <div className="p-4 transition bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md">
                      {/* Top */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className={`font-semibold ${style.color}`}>
                            {log.desc}
                          </h4>

                          <div className="mt-1 text-xs text-gray-500">
                            By{" "}
                            <span className="font-medium text-gray-700">
                              {log.user_id?.first_name || "System"}
                            </span>
                          </div>
                        </div>

                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {new Date(log.created_date).toLocaleDateString()}{" "}
                          {new Date(log.created_date).toLocaleTimeString()}
                        </span>
                      </div>

                      {/* Meta Toggle */}
                      {log.meta && Object.keys(log.meta).length > 0 && (
                        <div className="mt-3">
                          <button
                            onClick={() => toggleExpand(index)}
                            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                          >
                            {isOpen ? "Hide changes" : "View changes"}
                            {isOpen ? <MdExpandLess /> : <MdExpandMore />}
                          </button>

                          {/* Expanded Meta */}
                          {isOpen && (
                            <div className="mt-3 space-y-2 text-xs">
                              {Object.entries(log.meta).map(
                                ([key, value]: any) => {
                                  const isDiff =
                                    typeof value === "object" && value !== null;

                                  return (
                                    <div
                                      key={key}
                                      className="flex items-center justify-between p-2 border rounded-lg bg-gray-50"
                                    >
                                      <span className="font-medium text-gray-600 capitalize">
                                        {key.replace(/_/g, " ")}
                                      </span>

                                      <div className="flex items-center gap-2 text-gray-700">
                                        {key !== "rejection_reason" &&
                                          isDiff && (
                                            <>
                                              <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded">
                                                {value.old ?? "-"}
                                              </span>

                                              <MdArrowForward className="text-gray-400" />
                                            </>
                                          )}

                                        <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded">
                                          {isDiff
                                            ? (value.new ?? "-")
                                            : (value ?? "-")}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                },
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={model_divider}></div>

        <div className={model_botton_container}>
          <button onClick={onClose} className={close_cancel_button}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
