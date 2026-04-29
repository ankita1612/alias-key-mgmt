import React, { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";
import { ArchiveRestore } from "lucide-react";
import { PlusCircle } from "lucide-react";

import {
  model_divider,
  model_botton_container,
  close_cancel_button,
  input_style,
  label_style,
} from "../../utils/CommonFn";
import { AiFillCheckCircle, AiFillCloseCircle } from "react-icons/ai";
import { MdInfo } from "react-icons/md";
import { FaTrash, FaPen, FaPlus } from "react-icons/fa";
import { TrendingDown } from "lucide-react";
import { PlayCircle, PauseCircle } from "lucide-react";

interface LogStyleInput {
  action?: string;
  desc?: string;
}

export const getLogStyle = ({ action, desc }: LogStyleInput) => {
  const text = desc?.toLowerCase() || "";
  console.log(text);
  if (text.includes("approved")) {
    return {
      icon: <AiFillCheckCircle className="w-4 h-4 text-green-500" />,
      color: "text-green-600",
      bg: "bg-green-50",
    };
  } else if (text.includes("rejected")) {
    return {
      icon: <AiFillCloseCircle className="w-4 h-4 text-red-500" />,
      color: "text-red-600",
      bg: "bg-red-50",
    };
  } else if (text.includes("deducted")) {
    return {
      icon: <TrendingDown className="w-4 h-4 text-red-500" />,
      color: "text-red-600",
      bg: "bg-red-50",
    };
  } else if (text.includes("inactive to active")) {
    return {
      icon: <PlayCircle className="w-4 h-4 text-blue-500" />,
      color: "text-red-600",
      bg: "bg-red-50",
    };
  } else if (text.includes("active to inactive")) {
    return {
      icon: <PauseCircle className="w-4 h-4 text-gray-500" />,
      color: "text-red-600",
      bg: "bg-red-50",
    };
  } else if (text.includes("credit added")) {
    return {
      icon: <PlusCircle className="w-4 h-4 text-blue-500" />,
      color: "text-red-600",
      bg: "bg-red-50",
    };
  }

  const act = action?.toUpperCase();

  // ✅ PRIORITY: action-based
  if (act === "CREATE") {
    return {
      icon: <FaPlus className="w-4 h-4 text-green-500" />,
      color: "text-green-600",
      bg: "bg-green-50",
    };
  } else if (act === "UPDATE") {
    return {
      icon: <FaPen className="w-4 h-4 text-blue-500" />,
      color: "text-blue-600",
      bg: "bg-blue-50",
    };
  } else if (act === "DELETE") {
    return {
      icon: <FaTrash className="w-4 h-4 text-red-500" />,
      color: "text-red-600",
      bg: "bg-red-50",
    };
  } else if (act === "RESTORE") {
    return {
      icon: <ArchiveRestore className="w-4 h-4 text-blue-500" />,
      color: "text-blue-600",
      bg: "bg-blue-50",
    };
  }

  // ✅ SECONDARY: desc-based (for special cases)

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
            <div className="relative pl-6 space-y-2">
              {data.map((log, index) => {
                const isLast = index === data.length - 1;
                const style = getLogStyle({
                  action: log.action,
                  desc: log.desc,
                });
                const isOpen = expandedIndex === index;

                const isCreate = log.action?.toUpperCase() === "CREATE";
                const isLongText = (val: any) =>
                  typeof val === "string" && val.length > 40;
                return (
                  <div key={index} className="relative group">
                    {/* Timeline Dot */}
                    {/* Vertical line (only if NOT last) */}
                    {!isLast && (
                      <span className="absolute left-[-28px] top-7 w-px h-full bg-gray-200" />
                    )}
                    <span className="absolute -left-[42px] w-7 h-7 flex items-center justify-center bg-white border-2 border-gray-200 rounded-full shadow-sm group-hover:scale-110 transition">
                      {style.icon}
                    </span>

                    {/* Card */}
                    <div className="px-2 py-2 transition bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md">
                      {/* Top */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className={label_style}>{log.desc}</h4>

                          <div className="mt-0 text-sm text-gray-500">
                            By{" "}
                            <span className={input_style}>
                              {log.user_id?.first_name || "System"}
                            </span>
                          </div>
                        </div>

                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {new Date(log.created_date).toLocaleDateString()}{" "}
                          {new Date(log.created_date).toLocaleTimeString()}
                        </span>
                      </div>
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
