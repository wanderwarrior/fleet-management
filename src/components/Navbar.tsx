import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, LogOut, Menu } from "lucide-react";
import { logout } from "../hooks/useAuth";

interface NavbarProps {
  title: string;
  onMenuClick?: () => void;
}

export default function Navbar({ title, onMenuClick }: NavbarProps) {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <>
      <header className="flex items-center justify-between h-[60px] px-4 sm:px-6 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-colors lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>

        <div className="relative hidden sm:block w-full max-w-md mx-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search vehicle ID..."
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button className="relative p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500" />
          </button>

          <div className="hidden sm:flex h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 items-center justify-center text-xs font-semibold text-white cursor-pointer ring-2 ring-gray-800">
            YS
          </div>

          <button
            onClick={() => setShowConfirm(true)}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-colors"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-sm mx-4 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Logout</h2>
            <p className="text-sm text-gray-400">
              Are you sure you want to logout?
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-sm font-medium text-white transition-colors"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
