import React, { useEffect, useState } from "react";
import { TrendingUp, Package, ShoppingCart, Home, Clock, DollarSign, Loader2, AlertCircle } from "lucide-react";
import {
  fetchTotalProfit,
  fetchAvailableInventories,
  fetchTotalSoldItems,
  fetchTotalRentedItems,
  fetchPendingRentItems,
  fetchPendingSales,
} from "../api/dashboard";
import { useNavigate } from "react-router-dom";

// Mock API functions for demo - replace with your actual imports
// const fetchTotalProfit = () => new Promise((resolve) => setTimeout(() => resolve(125000), 1000));
// const fetchAvailableInventories = () => new Promise((resolve) => setTimeout(() => resolve(450), 1200));
// const fetchTotalSoldItems = () => new Promise((resolve) => setTimeout(() => resolve(89), 800));
// const fetchTotalRentedItems = () => new Promise((resolve) => setTimeout(() => resolve(67), 900));
// const fetchPendingRentItems = () => new Promise((resolve) => setTimeout(() => resolve(23), 1100));

const Dashboard = () => {
  const [stats, setStats] = useState({
    pendingSales: 0,
    profit: 0,
    available: 0,
    sold: 0,
    rented: 0,
    pendingRents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate()
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const [profit, available, sold, rented, pendingRents, pendingSales] = await Promise.all([
          fetchTotalProfit(),
          fetchAvailableInventories(),
          fetchTotalSoldItems(),
          fetchTotalRentedItems(),
          fetchPendingRentItems(),
          fetchPendingSales()
        ]);

        setStats({ profit, available, sold, rented, pendingRents, pendingSales });
        setError(null);
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const cardData = [
    {
      title: "Total Profit",
      subtitle: "Last 30 days",
      value: `₹${stats.profit.toLocaleString()}`,
      icon: DollarSign,
      iconColor: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      accentColor: "bg-green-500",
    },
    {
      title: "Available Inventory",
      subtitle: "Current stock",
      value: stats.available.toLocaleString(),
      icon: Package,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      accentColor: "bg-blue-500",
    },
    {
      title: "Items Sold",
      subtitle: "Last 30 days",
      value: stats.sold.toLocaleString(),
      icon: ShoppingCart,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      accentColor: "bg-purple-500",
    },
    {
      title: "Items Rented",
      subtitle: "Last 30 days",
      value: stats.rented.toLocaleString(),
      icon: Home,
      iconColor: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      accentColor: "bg-orange-500",
      button: {
        label: "View All",
        onClick: () => {
          navigate("/rented-items")
        }
      }
    },
    {
      title: "Pending Rentals",
      subtitle: "Awaiting return",
      value: stats.pendingRents.toLocaleString(),
      icon: Clock,
      iconColor: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      accentColor: "bg-amber-500",
      button: {
        label: "View All",
        onClick: () => {
          navigate("/pending-rentals")
        }
      }
    },
    {
      title: "Pending Sales",
      subtitle: "Awaiting payment",
      value: stats.pendingSales?.toLocaleString() ?? "0",
      icon: Clock,
      iconColor: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      accentColor: "bg-amber-500",
      button: {
        label: "View All",
        onClick: () => {
          navigate("/pending-sales")
        }
      }
    }
  ];

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <div>
            <h3 className="font-medium text-red-800">Error Loading Dashboard</h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-500 rounded-lg">
            <TrendingUp className="text-white" size={24} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        </div>
        <p className="text-gray-600">Monitor your business performance and inventory status</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {cardData.map((card, index) => (
          <StatsCard key={index} {...card} loading={loading} />
        ))}
      </div>
    </div>
  );
};

const StatsCard = ({ title, subtitle, value, icon: Icon, iconColor, bgColor, borderColor, accentColor, loading, button }) => {
  return (
    <div
      className={`
            bg-white rounded-xl shadow-sm border ${borderColor} 
            transition-all duration-300 ease-in-out
            hover:shadow-lg hover:-translate-y-1 hover:border-gray-300
            cursor-pointer group relative overflow-hidden
        `}
    >
      {/* Accent border at bottom */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 ${accentColor}`} />

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
            <p className="text-xs text-gray-400">{subtitle}</p>
          </div>
          <div
            className={`
                        p-3 rounded-lg ${bgColor} 
                        transition-transform duration-300
                        group-hover:scale-110
                    `}
          >
            <Icon className={`${iconColor} transition-colors duration-300`} size={20} />
          </div>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="text-gray-400 animate-spin" size={18} />
              <span className="text-lg font-semibold text-gray-400">Loading...</span>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-900 transition-colors duration-300">{value}</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp size={12} className="mr-1" />
                <span>Updated now</span>
              </div>
              {button && (
                <div className="pt-2">
                  <button onClick={button.onClick} className="text-sm text-blue-600 hover:underline font-medium">
                    {button.label}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
