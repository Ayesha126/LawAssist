import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bar, BarChart as ReBarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Line, LineChart as ReLineChart } from 'recharts';
import { FilePlus, CheckCircle, AlertTriangle, Scale, Users } from 'lucide-react';
import DashboardSkeleton from "../common/DashboardSkeleton";

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalOfficers: 0,
        activeOfficers: 0,
        totalStations: 0,
        totalSections: 0,
    });

    // const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    //Skeleton

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        setTimeout(() => {
            // Simulating data fetching
            setData({
                officers: 2,
                activeOfficers: 2,
                stations: 2,
                ipcSections: 443,
                complaintsServed: "10k+",
            });
            setLoading(false);
        }, 2000);
    }, []);


    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem("token");

                const [officersRes, stationsRes, sectionsRes] = await Promise.all([
                    fetch("http://localhost:8000/users", { headers: { Authorization: `Bearer ${token}` } }),
                    fetch("http://localhost:8000/stations", { headers: { Authorization: `Bearer ${token}` } }),
                    fetch("http://localhost:8000/ipc-sections", { headers: { Authorization: `Bearer ${token}` } }),
                ]);

                if (!officersRes.ok || !stationsRes.ok || !sectionsRes.ok) throw new Error("Failed to fetch data");

                const officers = await officersRes.json();
                const stations = await stationsRes.json();
                const sections = await sectionsRes.json();

                const policeOfficers = officers.filter(user => user.role === "Police");
                setStats({
                    totalOfficers: policeOfficers.length,
                    activeOfficers: policeOfficers.filter(o => o.status === "Active").length,
                    totalStations: stations.length,
                    totalSections: sections.length,
                });
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);
    if (loading) return <DashboardSkeleton />;

    const statistics = [
        { icon: <FilePlus size={28} className="text-blue-500" />, count: stats.totalOfficers, label: "Total Officers" },
        { icon: <CheckCircle size={28} className="text-green-500" />, count: stats.activeOfficers, label: "Active Officers" },
        { icon: <AlertTriangle size={28} className="text-red-500" />, count: stats.totalStations, label: "Total Stations" },
        { icon: <Scale size={28} className="text-yellow-500" />, count: stats.totalSections, label: "Total IPC Sections" },
        { icon: <Users size={28} className="text-purple-500" />, count: "10k+", label: "Complainants Served" },
    ];

    const userData = [
        { name: 'Jan', users: 400 },
        { name: 'Feb', users: 600 },
        { name: 'Mar', users: 800 },
        { name: 'Apr', users: 700 },
        { name: 'May', users: 1000 },
    ];

    return (
        <div className="p-6 bg-gradient-to-br from-gray-100 to-blue-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

            {loading ? <p>Loading statistics...</p> : error ? <p className="text-red-500">{error}</p> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    {statistics.map((stat, index) => (
                        <motion.div key={index} className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center border-t-4 border-blue-500 hover:shadow-2xl transition duration-300" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: index * 0.1 }}>
                            {stat.icon}
                            <h2 className="text-3xl font-bold mt-2 text-gray-700">{stat.count}</h2>
                            <p className="text-gray-600">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <motion.div className="bg-white shadow-lg rounded-xl p-6" whileHover={{ scale: 1.02 }}>
                    <h2 className="text-lg font-semibold mb-3">User Growth</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <ReBarChart data={userData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="users" fill="url(#gradBlue)" />
                            <defs>
                                <linearGradient id="gradBlue" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="#4F46E5" />
                                    <stop offset="100%" stopColor="#3B82F6" />
                                </linearGradient>
                            </defs>
                        </ReBarChart>
                    </ResponsiveContainer>
                </motion.div>

                <motion.div className="bg-white shadow-lg rounded-xl p-6" whileHover={{ scale: 1.02 }}>
                    <h2 className="text-lg font-semibold mb-3">Case Status</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <ReLineChart data={userData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="users" stroke="url(#gradPurple)" strokeWidth={3} />
                            <defs>
                                <linearGradient id="gradPurple" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="#8B5CF6" />
                                    <stop offset="100%" stopColor="#EC4899" />
                                </linearGradient>
                            </defs>
                        </ReLineChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminDashboard;
