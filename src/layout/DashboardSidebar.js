import { useState } from "react";
import { ChevronLeft, Dashboard, Inventory, ShoppingCart, Menu as MenuIcon } from "@mui/icons-material";
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Chip,
  Button,
} from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { LogOut, User } from "lucide-react";

const drawerWidth = 200;

const DashboardSidebar = () => {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  const menuItems = [
    { text: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
    { text: "Inventory", icon: <Inventory />, path: "/inventory" },
    { text: "Orders", icon: <ShoppingCart />, path: "/orders" },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      {/* App Header */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: 1201,
          backgroundColor: "#1976d2",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          {/* Left side - Menu and Title */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton color="inherit" edge="start" onClick={() => setIsCollapsed(!isCollapsed)}>
              {isCollapsed ? <ChevronLeft /> : <MenuIcon />}
            </IconButton>
            <Typography variant="h6" sx={{ ml: 1 }}>
              Malanad Agro Store
            </Typography>
          </Box>

          {/* Right side - User Info and Logout */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <User size={20} color="white" />
              <Typography variant="body2" sx={{ color: "white" }}>
                {user?.userName}
              </Typography>
              <Chip
                label={user?.role}
                size="small"
                sx={{
                  backgroundColor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontSize: "0.75rem",
                  cursor: "auto",
                }}
                onClick={() => true}
              />
            </Box>
            <Button
              color="inherit"
              onClick={handleLogout}
              startIcon={<LogOut size={16} />}
              sx={{
                textTransform: "none",
                fontSize: "0.875rem",
              }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: isCollapsed ? drawerWidth : 60,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: isCollapsed ? drawerWidth : 60,
            boxSizing: "border-box",
            transition: "width 0.3s",
            overflowX: "hidden",
          },
        }}
      >
        <Toolbar /> {/* Spacer for AppBar */}
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => navigate(item.path)}
              sx={{
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              {isCollapsed && <ListItemText primary={item.text} />}
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: "#f5f5f5",
          minHeight: "100vh",
        }}
      >
        <Toolbar /> {/* Push content below AppBar */}
        <Outlet /> {/* This renders Dashboard, Inventory, Orders, etc. */}
      </Box>
    </Box>
  );
};

export default DashboardSidebar;
