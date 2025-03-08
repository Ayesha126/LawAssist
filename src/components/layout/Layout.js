
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ userRole, onLogout }) => {
    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar userRole={userRole} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header onLogout={onLogout} userRole={userRole} />
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;