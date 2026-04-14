import { Link, useLocation } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";

const routeNameMap: Record<string, string> = {
  admin: "Admin",
  dashboard: "Dashboard",
  "alias-key": "Alias Key",
  "api-history": "API History",
  add: "Add",
  update_profile: "Update Profile",
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

  return (
    <nav className="flex items-center mb-4 text-lg text-gray-500">
      <ol className="flex flex-wrap items-center gap-1">
        {pathnames.map((value, index) => {
          const to = "/" + pathnames.slice(0, index + 1).join("/");
          const isLast = index === pathnames.length - 1;

          let label = routeNameMap[value] || value;

          // Convert add/:id → Edit
          if (
            value === "add" &&
            index < pathnames.length - 1 &&
            pathnames[index + 1]
          ) {
            label = "Edit";
          }

          // Replace ID with alias name
          if (isMongoId(value)) {
            label = aliasName || "Details";
          }

          return (
            <li key={to} className="flex items-center gap-1">
              {!isLast ? (
                <Link to={to} className="font-medium hover:text-gray-800">
                  {label}
                </Link>
              ) : (
                <span className="font-semibold text-gray-800">{label}</span>
              )}
              {!isLast && <FiChevronRight size={14} />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
