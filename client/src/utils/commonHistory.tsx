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
      icon: <FaPlus className="w-3 h-3 text-green-500" />,
      color: "text-green-600",
      bg: "bg-green-50",
    };
  }

  if (act === "UPDATE") {
    return {
      icon: <FaPen className="w-3 h-3 text-blue-500" />,
      color: "text-blue-600",
      bg: "bg-blue-50",
    };
  }

  if (act === "DELETE") {
    return {
      icon: <FaTrash className="w-3 h-3 text-red-500" />,
      color: "text-red-600",
      bg: "bg-red-50",
    };
  }

  // ✅ SECONDARY: desc-based (for special cases)
  const text = desc?.toLowerCase() || "";

  if (text.includes("approved")) {
    return {
      icon: <AiFillCheckCircle className="w-3.5 h-3.5 text-green-500" />,
      color: "text-green-600",
      bg: "bg-green-50",
    };
  }

  if (text.includes("rejected")) {
    return {
      icon: <AiFillCloseCircle className="w-3.5 h-3.5 text-red-500" />,
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
