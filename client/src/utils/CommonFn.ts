export const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

export const getStatusStyle = (status?: string) => {
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
export const model_body_part = "flex-1 px-6 py-4 overflow-y-auto";
export const model_divider = "px-6 py-2 border-t border-slate-200";
export const model_botton_container = "flex justify-end gap-3 px-6 pb-6";
export const close_cancel_button =
  "px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 over:border-gray-400 hover:shadow-md hover:-translate-y-0.5 active:scale-95 active:translate-y-0 transition-all duration-200 ease-in-out";
export const char_max_len_listing = 60;
export const heading_label_style = "text-base font-semibold text-gray-700";
export const label_style = "text-gray-900";
export const input_style = "text-gray-500 break-all";
export const input_style_with_gray_border =
  input_style + " bg-gray-50 p-3 rounded border border-gray-100";
export const label_style_bold = "text-gray-900 font-semibold";
const API_URL = import.meta.env.VITE_BACKEND_URL + "/api/get-proxy-response";
export function generatePostProxyData(curl: string, curl_token: string) {
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

      const bodyString = JSON.stringify(json, null, 2);

      const curlCommand = `curl --location --request POST \
-H "Content-Type: application/json" \
--data '${bodyString}' \
'${url}'`;

      return {
        method: "POST",
        url,
        body: bodyString,
        curlCommand: curlCommand,
      };
    } catch {
      return { url, body: jsonStr };
    }
  } catch {
    return { url: "", body: "" };
  }
}
export function generateGetProxyUrl(curl: string, curl_token: string) {
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
    const newUrl = `${API_URL}?${newParams.toString()}`;
    const curlCommand = `curl --location --request GET '${newUrl}'`;

    // ✅ Final proxy URL
    return {
      method: "GET",
      curlCommand: curlCommand,
    };
  } catch (err) {
    console.error("Error generating proxy URL");
    return "";
  }
}
export function generateProxyUrl(curl: string, curl_token: string) {
  if (!curl) return "";

  const lowerCurl = curl.toLowerCase();

  // ✅ Detect POST
  if (lowerCurl.includes("--request post") || lowerCurl.includes("--data")) {
    return generatePostProxyData(curl, curl_token);
  }

  // ✅ Default = GET
  return generateGetProxyUrl(curl, curl_token);
}
export const capitalize = (text?: string) =>
  text ? text.charAt(0).toUpperCase() + text.slice(1) : "-";

export const getStatusConfig = (status: string) => {
  switch (status) {
    case "Active":
    case "success":
      return {
        bg: "bg-green-50",
        text: "text-green-700",
        dot: "bg-green-500",
        border: "border-green-200",
      };
    case "Pending":
      return {
        bg: "bg-yellow-50",
        text: "text-yellow-700",
        dot: "bg-yellow-500",
        border: "border-yellow-200",
      };
    case "fail":
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

export const handleCopy = (text: string) => {
  if (!text) return;

  // Try modern API first
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Copied to clipboard"))
      .catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
};

export const fallbackCopy = (text: string) => {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed"; // avoid scroll jump
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    document.execCommand("copy");
    toast.success("Copied to clipboard");
  } catch (err) {
    toast.error("Copy failed");
  }

  document.body.removeChild(textarea);
};
