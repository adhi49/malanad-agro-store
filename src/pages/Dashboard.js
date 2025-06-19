import React, { useEffect, useState } from "react";
import {
    fetchTotalProfit,
    fetchAvailableInventories,
    fetchTotalSoldItems,
    fetchTotalRentedItems,
    fetchPendingRentItems,
} from "../api/dashboard";

const Dashboard = () => {
    const [stats, setStats] = useState({
        profit: 0,
        available: 0,
        sold: 0,
        rented: 0,
        pendingRents: 0,
    });



    useEffect(() => {
        const loadStats = async () => {
            try {
                const [
                    profit,
                    available,
                    sold,
                    rented,
                    pendingRents,
                ] = await Promise.all([
                    fetchTotalProfit(),
                    fetchAvailableInventories(),
                    fetchTotalSoldItems(),
                    fetchTotalRentedItems(),
                    fetchPendingRentItems(),
                ]);

                setStats({ profit, available, sold, rented, pendingRents });
            } catch (error) {
                console.error("Failed to load dashboard stats", error);
            }
        };

        loadStats();
    }, []);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
            <Card title="Total Profit (30 days)" value={`₹${stats.profit}`} />
            <Card title="Available Inventories" value={stats.available} />
            <Card title="Items Sold (30 days)" value={stats.sold} />
            <Card title="Items Rented (30 days)" value={stats.rented} />
            <Card title="Pending Rent Items" value={stats.pendingRents} />
        </div>
    );
};

const Card = ({ title, value }) => (
    <div className="bg-white shadow rounded-xl p-4 text-center">
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-2xl font-bold">{value}</div>
    </div>
);

export default Dashboard;
