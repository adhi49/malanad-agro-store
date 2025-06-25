// File: src/routes/AdminRoutes.js
import RentedItemsListCard from "../components/Order/List-Cards/RentedItemsListCard";
import RentOrderListCard from "../components/Order/List-Cards/RentOrderListCard";
import DashboardSidebar from "../layout/DashboardSidebar";
import Dashboard from "../pages/Dashboard";
import Inventory from "../pages/Inventory";
import OrderPage from "../pages/OrderPage";
import ProtectedRoute from "../pages/auth/ProtectedRoute";
import Login from "../pages/auth/Login"; // Fixed import - use your custom Login component

const AdminRoutes = {
  path: "/",
  children: [
    // ✅ PUBLIC ROUTES (No Sidebar)
    {
      path: "/login",
      element: <Login />, // Login page without sidebar
    },

    // ✅ PROTECTED ROUTES (With Sidebar)
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <DashboardSidebar />
        </ProtectedRoute>
      ),
      children: [
        {
          path: "/dashboard",
          index: true, // This makes it the default route for "/"
          element: <Dashboard />,
        },
        {
          path: "inventory",
          element: <Inventory />,
        },
        {
          path: "orders",
          element: <OrderPage />,
        },
        {
          path: "pending-rentals",
          element: <RentOrderListCard />,
        },
        {
          path: "pending-sales",
          element: <RentedItemsListCard />,
        },
      ],
    },
  ],
};

export default AdminRoutes;
