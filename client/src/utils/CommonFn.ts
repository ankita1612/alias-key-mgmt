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

    // ✅ Final proxy URL
    return `${API_URL}?${newParams.toString()}`;
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