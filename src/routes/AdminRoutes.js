import RentedItemsListCard from "../components/Order/List-Cards/RentedItemsListCard";
import RentOrderListCard from "../components/Order/List-Cards/RentOrderListCard";
import DashboardSidebar from "../layout/DashboardSidebar";
import Dashboard from "../pages/Dashboard";
import Inventory from "../pages/Inventory";
import OrderPage from "../pages/OrderPage";

const AdminRoutes = {
  path: "/",
  element: <DashboardSidebar />,
  children: [
    {
      path: "inventory",
      element: <Inventory />,
    },
    {
      path: "orders",
      element: <OrderPage />,
    },
    {
      path: "/",
      element: <Dashboard />,
    },
    {
      path: "pending-rentals",
      element: <RentOrderListCard />,
    },
    {
      path: "/pending-sales",
      element: <RentedItemsListCard />,
    },
  ],
};

export default AdminRoutes;
