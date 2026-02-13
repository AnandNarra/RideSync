import React from 'react';
import { useGetAdminStats } from "../../api's/admin/admin.query";
import { Users, UserCheck, Car, XCircle, Loader2, ArrowUpRight } from "lucide-react";

const StatCard = ({ title, value, description }) => (
    <div className="group relative bg-[#1c1c1c] border border-white/5 p-8 rounded-[2rem] transition-all duration-300 hover:border-white/10">
        <div className="relative z-10">
            <h3 className="text-white/40 text-xs font-bold mb-2 uppercase tracking-widest">{title}</h3>
            <p className="text-5xl font-black text-white tracking-tighter leading-none italic">{value}</p>
            {description && <p className="text-sm text-white/20 mt-4 font-medium">{description}</p>}
        </div>
    </div>
);

const AdminDashboard = () => {
    const { data, isError } = useGetAdminStats();

    if (isError) {
        return (
            <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-3xl m-8">
                <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-red-100">Failed to load statistics</h2>
                <p className="text-red-400/60 mt-2">Please check your connection and try again.</p>
            </div>
        );
    }

    const stats = data?.data || {};

    const cardData = [
        {
            title: "Platform Growth",
            value: stats.totalUsers || "0",
            description: "Total community members"
        },
        {
            title: "Active Partners",
            value: stats.totalDrivers || "0",
            description: "Verified driver accounts"
        },
        {
            title: "System Volume",
            value: stats.totalRides || "0",
            description: "Cumulative bookings processed"
        },
        {
            title: "Resolution Rate",
            value: stats.cancelledRides || "0",
            description: "Rides marked as cancelled"
        },
    ];

    return (
        <div className="p-10 max-w-7xl mx-auto min-h-screen">
            <div className="mb-14">
                <h1 className="text-4xl font-black text-black tracking-tighter italic uppercase leading-none">
                    Admin <span className="text-black/40">Dashboard</span>
                </h1>
                <p className="text-black/60 mt-6 max-w-xl text-lg font-medium leading-relaxed">
                    Overview of system metrics and platform growth.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {cardData.map((card, index) => (
                    <StatCard key={index} {...card} />
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;

