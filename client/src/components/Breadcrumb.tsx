import { Link, useLocation } from "react-router-dom";
import { FiChevronRight, FiHome } from "react-icons/fi";

const routeNameMap: Record<string, string> = {
  admin: "Admin",
  dashboard: "Dashboard",
  "alias-key": "Keys",
  "api-history": "API History",
  add: "Add",
  proxy: "Proxies",
  change_password: "Change Password",
};

const formatSegment = (segment: string) => {
  if (routeNameMap[segment]) return routeNameMap[segment];
  return segment
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function Breadcrumb() {
  const location = useLocation();

  const isMongoId = (value: string) => /^[0-9a-fA-F]{24}$/.test(value);

  const pathnames = location.pathname
    .split("/")
    .filter(Boolean)
    .filter((value) => value !== "admin");

  const aliasName = location.state?.aliasName;

  const apiHistoryId =
    pathnames[0] === "api-history" && pathnames[1] ? pathnames[1] : null;

  const breadcrumbItems = apiHistoryId
    ? [
        {
          label: "",
          to: "/dashboard",
          isLast: false,
          clickable: true,
          icon: <FiHome size={14} className="text-slate-500" />,
        },
        {
          label: "Keys",
          to: "/alias-key",
          isLast: false,
          clickable: true,
        },
        {
          label: "API History",
          to: "/api-history",
          isLast: false,
          clickable: true,
        },
        {
          label: aliasName || apiHistoryId,
          to: `/api-history/${apiHistoryId}`,
          isLast: true,
          clickable: false,
        },
      ]
    : [
        {
          label: "",
          to: "/dashboard",
          isLast: pathnames.length === 0,
          clickable: pathnames.length > 0,
          icon: <FiHome size={14} className="text-slate-500" />,
        },
        ...pathnames.map((value, index) => {
          const isLast = index === pathnames.length - 1;
          const to = "/" + pathnames.slice(0, index + 1).join("/");

          let label = formatSegment(value);
          let clickable = !isLast && value !== "add";
          let href = to;

          if (value === "add") {
            label = isLast ? "Add New" : "Edit";
            if (!isLast) {
              href = `/${pathnames[0]}`;
            }
          }

          if (isMongoId(value)) {
            label = aliasName || value;
            clickable = false;
          }

          if (value === "api-history" && pathnames.length > 1 && !isLast) {
            clickable = true;
          }

          return {
            label,
            to: href,
            isLast,
            clickable,
          };
        }),
      ];

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-2 px-3 py-2 text-sm border shadow-sm rounded-2xl border-slate-200 bg-slate-50/80 text-slate-600">
        {breadcrumbItems.map((item, index) => (
          <li
            key={`${item.label}-${index}`}
            className="flex items-center gap-2"
          >
            <div className="flex items-center gap-2">
              {item.icon}
              {item.clickable ? (
                <Link
                  to={item.to}
                  className="font-medium text-slate-700 hover:text-slate-900"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={`font-medium ${item.isLast ? "text-slate-900" : "text-slate-700"}`}
                >
                  {item.label}
                </span>
              )}
            </div>
            {index < breadcrumbItems.length - 1 && (
              <FiChevronRight size={14} className="text-slate-400" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
