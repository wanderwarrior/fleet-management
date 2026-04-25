import { Link } from "react-router-dom";

export default function Approve() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950">
      <div className="text-center space-y-3">
        <p className="text-gray-400 text-sm">This page is no longer in use.</p>
        <Link to="/login" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
          Go to Login
        </Link>
      </div>
    </div>
  );
}
