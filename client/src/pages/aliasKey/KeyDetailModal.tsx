import React, { useRef } from "react";
import { MdClose } from "react-icons/md";
import { FiCopy, FiAlertCircle } from "react-icons/fi";
import StatusBadge from "../../utils/StatusBadge";
import {
  model_divider,
  model_botton_container,
  close_cancel_button,
  heading_label_style,
  label_style,
  input_style,
  input_style_with_gray_border,
  handleCopy,
} from "../../utils/CommonFn";

interface Props {
  open: boolean;
  onClose: () => void;
  selectedRow: any;
  liveUrl: any;
}

const KeyDetailModal: React.FC<Props> = ({
  open,
  onClose,
  selectedRow,
  liveUrl,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  if (!open || !selectedRow) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      onClick={(e) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-4xl overflow-hidden bg-white shadow-2xl rounded-2xl"
      >
        {/* Close */}
        <button onClick={onClose} className="absolute right-4 top-4">
          <MdClose />
        </button>

        {/* Header */}
        <div className="px-6 py-5 border-b">
          <h2 className="text-lg font-semibold">Key Details</h2>
        </div>

        {/* Content */}
        <div className="flex-1 px-8 py-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
          {/* Key Information Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 rounded-full bg-secondary"></div>
              <h3 className={heading_label_style}>Key & User Information</h3>
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
              <div
                className={`${input_style_with_gray_border} max-h-40 overflow-y-auto whitespace-pre-wrap`}
              >
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
              {/* <div className={input_style_with_gray_border}>
                    {selectedRow.description}
                  </div> */}
              <div
                className={`prose max-w-none ${input_style_with_gray_border} max-h-40 overflow-y-auto whitespace-pre-wrap`}
                dangerouslySetInnerHTML={{
                  __html: selectedRow.description,
                }}
              />
            </div>
          )}

          {/* Proxy Configuration - Only if exists and active */}
          {selectedRow?.proxy &&
            ["Approved"].includes(selectedRow.approval_status) && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 rounded-full bg-secondary"></div>
                  <h3 className={heading_label_style}>Proxy Configuration</h3>
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
                <h3 className={heading_label_style}>Additional Information</h3>
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

export default KeyDetailModal;
