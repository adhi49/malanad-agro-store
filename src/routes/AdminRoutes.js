import Dashboard from "../pages/Dashboard";
import Inventory from "../pages/Inventory";
import OrderPage from "../pages/OrderPage";

const AdminRoutes = {
    path: '/',
    children: [
        {
            path: 'inventory',
            element: <Inventory />
        },
        {
            path: 'orders',
            element: <OrderPage />
        },
        {
            path: 'dashboard',
            element: <Dashboard />
        }
    ]
};

export default AdminRoutes;
