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
          let to = "/" + pathnames.slice(0, index + 1).join("/");
          const isLast = index === pathnames.length - 1;

          let label = routeNameMap[value] || value;

          // Convert add/:id → Edit AND fix its link
          if (
            value === "add" &&
            index < pathnames.length - 1 &&
            pathnames[index + 1]
          ) {
            label = "Edit";
            to = "/alias-key"; // 👈 force redirect to listing page
          }

          // Replace ID with alias name
          if (isMongoId(value) && pathnames[0] !== "api-history") {
            label = aliasName || value;
          }

          return (
            <li key={to} className="flex items-center gap-1">
              {index === 0 || isLast ? (
                // ❌ First item + last item → NOT clickable
                <span className="font-medium text-gray-700"> {label}</span>
              ) : (
                // ✅ Only middle items clickable
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
