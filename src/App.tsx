import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Drivers from "./pages/Drivers";
import VehicleDetail from "./pages/VehicleDetail";
import DriverDetail from "./pages/DriverDetail";
import TripDetail from "./pages/TripDetail";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Approve from "./pages/Approve";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/approve" element={<Approve />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vehicles/:id"
          element={
            <ProtectedRoute>
              <MainLayout title="Vehicle Details">
                <VehicleDetail />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/drivers"
          element={
            <ProtectedRoute>
              <MainLayout title="Drivers">
                <Drivers />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/drivers/:id"
          element={
            <ProtectedRoute>
              <MainLayout title="Driver Details">
                <DriverDetail />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips/:id"
          element={
            <ProtectedRoute>
              <MainLayout title="Trip Details">
                <TripDetail />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <MainLayout title="Reports">
                <Reports />
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
