'use client';

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { jwtDecode } from 'jwt-decode';
import DashboardSkeleton from "../common/DashboardSkeleton";


const PoliceDashboard = () => {
    const [stats, setStats] = useState({ pendingFIRs: 0, totalFIRsToday: 0, totalFIRsThisMonth: 0 });
    const [recentFIRs, setRecentFIRs] = useState([]);
    const [pendingComplaints, setPendingComplaints] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userName, setUserName] = useState('');
    const navigate = useNavigate();

    // Get logged-in user's details from token
    const getLoggedInUser = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('User not authenticated. Please log in.');
            navigate('/login');
            return null;
        }
        try {
            const decoded = jwtDecode(token);
            if (!decoded.user_id || decoded.role !== 'Police') {
                setError('Invalid user or role. Please log in as a police officer.');
                navigate('/login');
                return null;
            }
            return decoded;
        } catch (err) {
            console.error('Error decoding token:', err);
            setError('Failed to decode user information. Please log in again.');
            navigate('/login');
            return null;
        }
    };

    // Fetch user details
    const fetchUserDetails = async (userId) => {
        try {
            const response = await fetch(`http://localhost:8000/users/${userId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            if (!response.ok) throw new Error('Failed to fetch user details');
            const userData = await response.json();
            setUserName(userData.name || 'Police Officer');
            return userData.station; // Return station ID for further use
        } catch (err) {
            console.error('Error fetching user details:', err);
            setError(err.message);
            return null;
        }
    };

    // Fetch dashboard data
    const fetchDashboardData = async (userId, stationId) => {
        try {
            const [complaintsResponse, firsResponse] = await Promise.all([
                fetch('http://localhost:8000/complaints', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                }),
                fetch('http://localhost:8000/firs', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                }),
            ]);

            if (!complaintsResponse.ok || !firsResponse.ok) {
                throw new Error('Failed to fetch dashboard data');
            }

            const complaintsData = await complaintsResponse.json();
            const firsData = await firsResponse.json();

            // Filter data based on station
            const stationComplaints = complaintsData.filter(
                (complaint) => complaint.assigned_station?._id === stationId && complaint.status === 'Active'
            );
            const stationFirs = firsData.filter(
                (fir) => (fir.user?.station?._id === stationId || fir.complaint?.assigned_station?._id === stationId) && fir.status !== 'Closed'
            );

            // Calculate stats
            const today = new Date();
            const pendingFIRs = stationFirs.filter((fir) => fir.status === 'Open').length;
            const totalFIRsToday = stationFirs.filter(
                (fir) => new Date(fir.createdAt).toDateString() === today.toDateString()
            ).length;
            const totalFIRsThisMonth = stationFirs.filter(
                (fir) => new Date(fir.createdAt).getMonth() === today.getMonth() && new Date(fir.createdAt).getFullYear() === today.getFullYear()
            ).length;

            setStats({ pendingFIRs, totalFIRsToday, totalFIRsThisMonth });
            setRecentFIRs(stationFirs.slice(0, 5)); // Top 5 recent FIRs
            setPendingComplaints(stationComplaints);

            // Prepare chart data (FIRs per month for the last 6 months)
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(today.getMonth() - 5);
            const monthlyFIRs = Array.from({ length: 6 }, (_, i) => {
                const monthDate = new Date(sixMonthsAgo);
                monthDate.setMonth(sixMonthsAgo.getMonth() + i);
                const monthName = monthDate.toLocaleString('default', { month: 'short' });
                const firCount = stationFirs.filter(
                    (fir) =>
                        new Date(fir.createdAt).getMonth() === monthDate.getMonth() &&
                        new Date(fir.createdAt).getFullYear() === monthDate.getFullYear()
                ).length;
                return { month: monthName, firCount };
            });
            setChartData(monthlyFIRs);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError(err.message);
        }
    };

    useEffect(() => {
        const initializeDashboard = async () => {
            setLoading(true);
            const user = getLoggedInUser();
            if (!user) {
                setLoading(false);
                return;
            }

            const station = await fetchUserDetails(user.user_id);
            if (station) {
                await fetchDashboardData(user.user_id, station._id);
            }
            setLoading(false);
        };

        initializeDashboard();
    }, [navigate]);

    if (loading) return <DashboardSkeleton />;


    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="p-6"
        >
            <h1 className="text-3xl font-bold mb-6 text-blue-700">Police Officer Dashboard</h1>
            <h2 className="text-xl mb-4">Welcome, {userName}!</h2>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {Object.entries(stats).map(([key, value], index) => (
                    <motion.div
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        className="bg-white p-6 shadow-lg rounded-lg text-center"
                    >
                        <h3 className="text-lg font-semibold capitalize">
                            {key.replace(/([A-Z])/g, ' $1')}
                        </h3>
                        <p className="text-3xl font-bold text-blue-600">{value}</p>
                    </motion.div>
                ))}
            </div>

            {/* FIR Trends Chart */}
            <div className="bg-white p-6 shadow-lg rounded-lg mb-8">
                <h2 className="text-xl font-semibold mb-4">FIR Trends (Last 6 Months)</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="firCount" fill="#3182CE" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default PoliceDashboard;