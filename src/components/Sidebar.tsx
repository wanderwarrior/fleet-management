import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileBarChart,
  User,
  X,
  type LucideIcon,
} from "lucide-react";

interface MenuItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

const menuItems: MenuItem[] = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Drivers", path: "/drivers", icon: User },
  { label: "Reports", path: "/reports", icon: FileBarChart },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-gray-950 border-r border-gray-800 text-gray-300 transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Fleet Manager
          </h1>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-colors lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-1 px-3 mt-2">
          {menuItems.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={label}
              to={path}
              end={path === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600/15 text-blue-400"
                    : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
