import { useState, useRef } from "react";
import { FiCopy } from "react-icons/fi";
import { MdClose } from "react-icons/md";

const CurlModal = ({ isOpen, onClose, curl }) => {
  const [copied, setCopied] = useState(false);
  const curlModalRef = useRef(null);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(curl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleBackdropClick = (e) => {
    if (curlModalRef.current && !curlModalRef.current.contains(e.target)) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 bg-black/60 backdrop-blur-md"
    >
      {/* Modal */}
      <div
        ref={curlModalRef}
        className="relative w-full max-w-3xl overflow-hidden transition-all duration-300 transform bg-white shadow-2xl rounded-2xl animate-in fade-in zoom-in-95"
      >
        {/* Close Icon */}
        <button
          onClick={onClose}
          className="absolute z-10 flex items-center justify-center w-10 h-10 transition-all duration-200 bg-white top-4 right-4 hover:text-gray-600 group"
        >
          <MdClose className="w-5 h-5 transition-transform group-hover:scale-110" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">Curl Command</h2>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 py-4 overflow-y-auto">
          <p className="text-sm ">{curl}</p>
        </div>

        {/* Divider */}
        <div className="px-6 py-2 border-t border-slate-200"></div>

        {/* Actions */}
        <div className="flex justify-end gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 transition bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CurlModal;
