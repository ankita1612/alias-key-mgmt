import { Link, useLocation } from "react-router-dom";

import { FaHome } from "react-icons/fa";
export default function Breadcrumb() {
  const location = useLocation();
  const historyParentId = location.state?.historyParentId;
  const path = location.pathname;
  const from = location.state?.from;
  const HOME_ROUTE = "/dashboard";

  // 🧠 Breadcrumb Logic
  const breadcrumbItems = (() => {
    const items: any[] = [
      {
        label: "",
        to: HOME_ROUTE,
        clickable: true,
        icon: <FaHome size={16} />,
      },
    ];

    // ✅ DASHBOARD
    if (path === "/dashboard") {
      items.push({ label: "Main", clickable: false });
      items.push({ label: "Dashboard", clickable: false });
    } else {
      //  ✅ COMMON ROOT
      items.push({
        label: "ACT-Key Management",
        clickable: false,
      });

      // ✅ PROXY
      if (path.startsWith("/proxy")) {
        if (path === "/proxy") {
          items.push({ label: "Proxy", clickable: false });
        } else if (path === "/proxy/add") {
          items.push({ label: "Proxy", to: "/proxy", clickable: true });
          items.push({ label: "Add Proxy", clickable: false });
        } else if (path === "/proxy/archived-proxy") {
          //items.push({ label: "Proxy", to: "/proxy", clickable: true });
          items.push({ label: "Archived Proxy", clickable: false });
        } else if (/^\/proxy\/add\/[0-9a-fA-F]{24}$/.test(path)) {
          items.push({ label: "Proxy", to: "/proxy", clickable: true });
          items.push({ label: "Edit Proxy", clickable: false });
        } else if (/^\/proxy\/view\/[0-9a-fA-F]{24}$/.test(path)) {
          if (from === "archived-proxy") {
            items.push({
              label: "Deleted Proxy",
              to: "/proxy/archived-proxy",
              clickable: true,
            });
          } else {
            items.push({
              label: "Proxy",
              to: "/proxy",
              clickable: true,
            });
          }

          items.push({ label: "Proxy View", clickable: false });
        }
      }

      // ✅ ALIAS KEY
      if (path.startsWith("/alias-key")) {
        if (path === "/alias-key") {
          items.push({ label: "Key Management", clickable: false });
        } else if (path === "/alias-key/add") {
          items.push({
            label: "Key Management",
            to: "/alias-key",
            clickable: true,
          });
          items.push({ label: "Add Key", clickable: false });
        } else if (/^\/alias-key\/add\/[0-9a-fA-F]{24}$/.test(path)) {
          items.push({
            label: "Key Management",
            to: "/alias-key",
            clickable: true,
          });
          items.push({ label: "Key Edit", clickable: false });
        } else if (path === "/alias-key/archived-alias-key") {
          items.push({ label: "Archived Key", clickable: false });
        }
      }
      if (path.startsWith("/key-monitor")) {
        if (path === "/key-monitor") {
          items.push({ label: "Key Monitor", clickable: false });
        }
      }
      // ✅ API HISTORY
      const isMongoId = (val: string) => /^[0-9a-fA-F]{24}$/.test(val);

      if (path.startsWith("/api-history")) {
        const parts = path.split("/").filter(Boolean);

        // ✅ /api-history
        if (path === "/api-history") {
          items.push({ label: "Key Monitor", clickable: false });
        }

        // ✅ /api-history/:id
        else if (parts.length === 2 && isMongoId(parts[1])) {
          items.push({
            label: "Key Monitor",
            to: "/key-monitor", // ✅ redirect here
            clickable: true,
          });

          items.push({
            label: "Key Monitor History",
            clickable: false,
          });
        } else if (parts.length === 3 && isMongoId(parts[2])) {
          items.push({
            label: "Key Monitor",
            to: "/key-monitor", // ✅ redirect here
            clickable: true,
          });
          items.push({
            label: "Key Monitor History",
            to: historyParentId
              ? `/api-history/${historyParentId}`
              : "/key-monitor", // fallback
            clickable: true,
          });
          items.push({
            label: "Key Monitor View",
            clickable: false,
          });
        }
      }
    }

    // ✅ Mark last item
    items.forEach((item, index) => {
      item.isLast = index === items.length - 1;
    });

    return items;
  })();

  // ✅ Page Title
  const lastItem = breadcrumbItems[breadcrumbItems.length - 1];

  return (
    <div className="mb-4">
      {/* 🔥 PAGE TITLE */}
      <h2 className="mb-2 text-xl font-semibold text-slate-900">
        {lastItem?.label}
      </h2>

      {/* 🔥 BREADCRUMB */}
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 py-2 text-sm text-slate-600">
          {breadcrumbItems.map((item, index) => {
            return (
              <li key={index} className="flex items-center gap-2">
                {/* ✅ Home Icon */}
                {item.icon && (
                  <Link
                    to={HOME_ROUTE}
                    className="transition hover:text-primary"
                  >
                    {item.icon}
                  </Link>
                )}

                {/* ✅ Label */}
                {item.label && (
                  <>
                    {item.clickable && !item.isLast ? (
                      <Link
                        to={item.to}
                        className="text-slate-600 hover:text-primary"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span
                        className={`${
                          item.isLast
                            ? "font-semibold text-slate-900" // ✅ bold last
                            : "text-slate-600"
                        }`}
                      >
                        {item.label}
                      </span>
                    )}
                  </>
                )}

                {/* ✅ Separator */}
                {index != 0 && index < breadcrumbItems.length - 1 && (
                  <span className="text-slate-400">/</span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
