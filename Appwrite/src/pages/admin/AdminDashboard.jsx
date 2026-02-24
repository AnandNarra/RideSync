import React from 'react';
import { useGetAdminStats } from "../../api's/admin/admin.query";
import { Users, UserCheck, Car, XCircle, Loader2, ArrowUpRight } from "lucide-react";

const StatCard = ({ title, value, description, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${color.bg}`}>
                <Icon className={`w-6 h-6 ${color.text}`} />
            </div>
            <span className="flex items-center text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-lg">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                Live
            </span>
        </div>
        <div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
            <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
            {description && <p className="text-xs text-gray-400 mt-2">{description}</p>}
        </div>
    </div>
);

const AdminDashboard = () => {
    const { data, isError } = useGetAdminStats();

    if (isError) {
        return (
            <div className="min-h-[400px] flex items-center justify-center p-8">
                <div className="text-center max-w-sm">
                    <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Failed to load statistics</h2>
                    <p className="text-gray-500 mt-2 text-sm">Please check your connection and try again.</p>
                </div>
            </div>
        );
    }

    const stats = data?.data || {};

    const cardData = [
        {
            title: "Total Users",
            value: stats.totalUsers || "0",
            description: "Registered community members",
            icon: Users,
            color: { bg: "bg-blue-50", text: "text-blue-600" }
        },
        {
            title: "Verified Drivers",
            value: stats.totalDrivers || "0",
            description: "Active partners on platform",
            icon: UserCheck,
            color: { bg: "bg-green-50", text: "text-green-600" }
        },
        {
            title: "Total Bookings",
            value: stats.totalRides || "0",
            description: "Completed and active rides",
            icon: Car,
            color: { bg: "bg-purple-50", text: "text-purple-600" }
        },
        {
            title: "Cancellations",
            value: stats.cancelledRides || "0",
            description: "Rides marked as cancelled",
            icon: XCircle,
            color: { bg: "bg-red-50", text: "text-red-600" }
        },
    ];

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen bg-gray-50/30">
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight"> Admin Dashboard  </h1>
                    <p className="text-gray-500 mt-1 text-sm">Real-time metrics for your platform's health.</p>
                </div>
                <div className="flex gap-2">
                    <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all shadow-sm">
                        Download Report
                    </button>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-all shadow-sm">
                        Manage Users
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {cardData.map((card, index) => (
                    <StatCard key={index} {...card} />
                ))}
            </div>

            <div className="mt-12 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-2">Performance Insights</h2>
                <p className="text-sm text-gray-500 mb-8">System performance across all modules is stable today.</p>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                    <p className="text-gray-400 text-sm italic">Growth charts and analytics coming soon...</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

