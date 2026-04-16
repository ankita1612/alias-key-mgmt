import { Link, useLocation } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";

const routeNameMap: Record<string, string> = {
  admin: "Admin",
  dashboard: "Dashboard",
  "alias-key": "Key",
  "api-history": "API History",
  add: "Add",
  proxy: "Proxy",
  change_password: "Change Password",
};

export default function Breadcrumb() {
  const location = useLocation();

  const isMongoId = (value: string) => /^[0-9a-fA-F]{24}$/.test(value);

  const pathnames = location.pathname
    .split("/")
    .filter(Boolean)
    .filter((v) => v !== "admin");

  const aliasName = location.state?.aliasName;

  // ✅ ADD THIS BLOCK HERE 👇
  if (pathnames[0] === "api-history" && pathnames[1]) {
    return (
      <nav className="flex items-center mb-4 text-lg text-gray-500">
        <ol className="flex items-center gap-1">
          {/* API History (no link) */}
          <li className="flex items-center gap-1">
            <span className="font-medium text-gray-700">API History</span>
            <FiChevronRight size={14} />
          </li>

          <li className="flex items-center gap-1">
            <Link to="/alias-key" className="font-medium hover:text-gray-800">
              Key
            </Link>
            <FiChevronRight size={14} />
          </li>

          {/* ID */}
          <li className="flex items-center gap-1">
            <span className="font-semibold text-gray-800">
              {aliasName || pathnames[1]}
            </span>
          </li>
        </ol>
      </nav>
    );
  }
  // ✅ END HERE

  // ⬇️ KEEP YOUR EXISTING RETURN AS IT IS
  return (
    <nav className="flex items-center mb-4 text-lg text-gray-500">
      <ol className="flex flex-wrap items-center gap-1">
        {pathnames.map((value, index) => {
          let to = "/" + pathnames.slice(0, index + 1).join("/");
          const isLast = index === pathnames.length - 1;

          let label = routeNameMap[value] || value;

          if (
            value === "add" &&
            index < pathnames.length - 1 &&
            pathnames[index + 1]
          ) {
            label = "Edit";

            // 🔥 dynamic parent route (proxy / alias-key)
            to = `/${pathnames[0]}`;
          }

          if (isMongoId(value) && pathnames[0] !== "api-history") {
            label = aliasName || value;
          }

          return (
            <li key={to} className="flex items-center gap-1">
              {isLast ? (
                <span className="font-medium text-gray-700">{label}</span>
              ) : (
                <Link to={to} className="font-medium hover:text-gray-800">
                  {label}
                </Link>
              )}
              {!isLast && <FiChevronRight size={14} />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
