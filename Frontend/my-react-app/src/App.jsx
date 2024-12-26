// App.jsx
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "./components/Header";

// Pages
import GeneralRegistration from "./pages/RegisterPages/GeneralRegistration";
import RegisterStaff from "./pages/RegisterPages/RegisterStaff";
import RegisterGuest from "./pages/RegisterPages/RegisterGuest";
import PasswordCreation from "./pages/RegisterPages/PasswordCreation";
import PasswordGuest from "./pages/RegisterPages/PasswordGuest";
import LoginGuest from "./pages/RegisterPages/LoginGuest";
import LoginStaff from "./pages/RegisterPages/LoginStaff";
import CityHotels from "./pages/ClientPages/CityHotels";
import SysAdminMain from "./pages/SysAdmin/SysAdminMain";
import TableDetails from "./pages/SysAdmin/TableDetails";
import Dashboard from "./pages/ManagerPage/Dashboard";
import RoomBoyMain from "./pages/RoomBoyPage/RoomBoyMain";
import DetailsRoomBoy from "./pages/RoomBoyPage/DetailsRoomBoy";
import AssistantMain from "./pages/AssistantPage/AssistantMain";
import ClientMain from "./pages/ClientPages/ClientMain";
import BookingRequest from "./pages/ManagerPage/BookingRequest";
import RequestDetails from "./pages/ManagerPage/RequestDetails";
import Checkin from "./pages/ManagerPage/Checkin";
import CheckinDetails from "./pages/ManagerPage/CheckinDetails";
import Checkout from "./pages/ManagerPage/Checkout";
import CheckoutDetails from "./pages/ManagerPage/CheckoutDetails";
import HotelInfo from "./pages/ClientPages/HotelInfo";
import BookingPage from "./pages/ClientPages/BookingPage";
import PaymentPage from "./pages/ClientPages/PaymentPage";
import ApprovalPage from "./pages/ClientPages/ApprovalPage";

// -------------------------------------
// ProtectedRoute for Staff-Only Access
// -------------------------------------
function ProtectedRoute({ children, allowedRoles, userRole }) {
  // If no userRole => user is a guest => not allowed
  if (!userRole) {
    return <Navigate to="/generalregistration" replace />;
  }

  // If allowedRoles is provided, verify userRole
  const rolesArray = Array.isArray(allowedRoles)
    ? allowedRoles
    : [allowedRoles];
  if (!rolesArray.includes(userRole)) {
    return <Navigate to="/generalregistration" replace />;
  }

  return children;
}

// -------------------------------------
// Main App Component
// -------------------------------------
export default function App() {
  const navigate = useNavigate();

  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true); // <-- NEW LOADING STATE

  useEffect(() => {
    // Simulate loading from localStorage
    const role = localStorage.getItem("userRole");
    if (role) {
      setUserRole(role);
    }
    setLoading(false); // Loading is done, we know the userRole or it's null
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("userRole");
    setUserRole(null);
    // Redirect to GeneralRegistration
    navigate("/generalregistration", { replace: true });
  };

  // Decide how to handle the home route
  // 1) If user has role => staff => redirect to staff route
  // 2) Otherwise => guest => go to GeneralRegistration
  const getHomeElement = () => {
    if (userRole) {
      // Staff route
      switch (userRole) {
        case "SysAdmin":
          return <Navigate to="/sysadmin" replace />;
        case "Hotel Manager":
          return <Navigate to="/dashboard" replace />;
        case "RoomBoy":
          return <Navigate to="/roomboy" replace />;
        case "Manager Assistant":
          return <Navigate to="/assistant" replace />;
        default:
          // If no known staff role, go to general registration
          return <Navigate to="/" replace />;
      }
    } else {
      // No role => guest => GeneralRegistration
      return <GeneralRegistration setUserRole={setUserRole} />;
    }
  };

  // If we are still "loading" (haven't read from localStorage yet), show a spinner or message
  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "3rem" }}>Loading...</div>
    );
  }

  return (
    <>
      <Header
        handleLogout={handleLogout}
        userRole={userRole}
        setUserRole={setUserRole}
        title="Booking Portal"
      />

      <Routes>
        {/* 
          HOME ROUTE => uses getHomeElement() to decide 
          where to send the user
        */}
        <Route path="/" element={getHomeElement()} />

        {/* Public (Guest) Routes */}
        <Route path="/cityhotels/:cityName" element={<CityHotels />} />
        <Route path="/hotel/:id" element={<HotelInfo />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/approval" element={<ApprovalPage />} />
        <Route path="/clientmain" element={<ClientMain />} />

        {/* Staff-Only Routes => Protected */}
        {/* SysAdmin */}
        <Route
          path="/sysadmin"
          element={
            <ProtectedRoute allowedRoles="SysAdmin" userRole={userRole}>
              <SysAdminMain />
            </ProtectedRoute>
          }
        />
        <Route
          path="/table/:tableName"
          element={
            <ProtectedRoute allowedRoles="SysAdmin" userRole={userRole}>
              <TableDetails />
            </ProtectedRoute>
          }
        />

        {/* Hotel Manager */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles="Hotel Manager" userRole={userRole}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking-requests"
          element={
            <ProtectedRoute allowedRoles="Hotel Manager" userRole={userRole}>
              <BookingRequest />
            </ProtectedRoute>
          }
        />
        <Route
          path="/request-details/:id"
          element={
            <ProtectedRoute allowedRoles="Hotel Manager" userRole={userRole}>
              <RequestDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/check-in-details"
          element={
            <ProtectedRoute allowedRoles="Hotel Manager" userRole={userRole}>
              <Checkin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/check-in-details/:id"
          element={
            <ProtectedRoute allowedRoles="Hotel Manager" userRole={userRole}>
              <CheckinDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/check-out-details"
          element={
            <ProtectedRoute allowedRoles="Hotel Manager" userRole={userRole}>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/check-out-details/:id"
          element={
            <ProtectedRoute allowedRoles="Hotel Manager" userRole={userRole}>
              <CheckoutDetails />
            </ProtectedRoute>
          }
        />

        {/* RoomBoy */}
        <Route
          path="/roomboy"
          element={
            <ProtectedRoute allowedRoles="RoomBoy" userRole={userRole}>
              <RoomBoyMain />
            </ProtectedRoute>
          }
        />
        <Route
          path="/room-details/:id"
          element={
            <ProtectedRoute allowedRoles="RoomBoy" userRole={userRole}>
              <DetailsRoomBoy />
            </ProtectedRoute>
          }
        />

        {/* Manager Assistant */}
        <Route
          path="/assistant"
          element={
            <ProtectedRoute
              allowedRoles="Manager Assistant"
              userRole={userRole}
            >
              <AssistantMain />
            </ProtectedRoute>
          }
        />

        {/* Public: GeneralRegistration */}
        <Route path="/generalregistration" element={<GeneralRegistration />} />

        {/* Registration & Login => If user is staff, they shouldn’t see these */}
        <Route
          path="/registerstaff"
          element={
            userRole ? (
              <Navigate to="/" replace />
            ) : (
              <RegisterStaff setUserRole={setUserRole} />
            )
          }
        />
        <Route
          path="/registerguest"
          element={
            userRole ? (
              <Navigate to="/" replace />
            ) : (
              <RegisterGuest setUserRole={setUserRole} />
            )
          }
        />
        <Route
          path="/password-creation/:id"
          element={
            userRole ? (
              <Navigate to="/" replace />
            ) : (
              <PasswordCreation setUserRole={setUserRole} />
            )
          }
        />
        <Route
          path="/password-guest/:id"
          element={
            userRole ? (
              <Navigate to="/" replace />
            ) : (
              <PasswordGuest setUserRole={setUserRole} />
            )
          }
        />
        <Route
          path="/loginguest"
          element={
            userRole ? (
              <Navigate to="/" replace />
            ) : (
              <LoginGuest setUserRole={setUserRole} />
            )
          }
        />
        <Route
          path="/loginstaff"
          element={
            userRole ? (
              <Navigate to="/" replace />
            ) : (
              <LoginStaff setUserRole={setUserRole} />
            )
          }
        />

        {/* Fallback Route => If no match, go home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
