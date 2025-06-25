import { useState } from "react";
import { ChevronLeft, Dashboard, Inventory, ShoppingCart, Menu as MenuIcon } from "@mui/icons-material"
import { AppBar, Box, Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography } from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";

const drawerWidth = 200;
const DashboardSidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const navigate = useNavigate()

    const menuItems = [
        { text: "Dashboard", icon: <Dashboard />, path: "/" },
        { text: "Inventory", icon: <Inventory />, path: "/inventory" },
        { text: "Orders", icon: <ShoppingCart />, path: "/orders" },
    ]
    return (

        <Box sx={{ display: "flex" }}>
            {/* app header */}
            <AppBar position="fixed" sx={{ zIndex: 1201, backgroundColor: "#1976d2" }}>
                <Toolbar>
                    <IconButton color="inherit" edge="start" onClick={() => setIsCollapsed(!isCollapsed)}>
                        {isCollapsed ? <ChevronLeft /> : <MenuIcon />}
                    </IconButton>

                    <Typography variant="h6"> Malanad Agro Store</Typography>
                </Toolbar>
            </AppBar>

            {/* sidebar */}
            <Drawer variant="permanent" sx={{
                width: isCollapsed ? drawerWidth : 60,
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                    width: isCollapsed ? drawerWidth : 60,
                    boxSizing: "border-box",
                    transition: "width 0.3s",
                    overflowX: "hidden",
                },
            }}>
                {/* sidebar content */}
                <Toolbar />
                <List>
                    {menuItems.map((item) => (
                        <ListItem
                            button
                            key={item.text}
                            onClick={() => navigate(item.path)}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            {!isCollapsed && <ListItemText primary={item.text} />}
                        </ListItem>
                    ))}
                </List>

            </Drawer>

            {/* Main content */}
            <Box component="main"
                sx={{ flexGrow: 1, p: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}
            >
                <Toolbar />{/* push content below AppBar */}
                <Outlet />{/* Show Dashboard / Orders / Inventory here */}
            </Box>
        </Box>
    )
}
export default DashboardSidebar
