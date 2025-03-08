import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const Profile = ({ onProfileImageUpdate }) => {
    const [userData, setUserData] = useState({
        name: '',
        contact: '',
        email: '',
        role: '',
        station: null,
        profileImage: 'https://via.placeholder.com/100',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [newImage, setNewImage] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('User not authenticated. Please log in.');
                navigate('/login');
                return;
            }

            try {
                const decoded = jwtDecode(token);
                const userId = decoded.user_id;

                const response = await fetch(`http://localhost:8000/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch user details');
                }

                const data = await response.json();
                console.log('Profile Fetch Response:', data); // Log initial data
                setUserData({
                    name: data.name || '',
                    contact: data.contact || '',
                    email: data.email || '',
                    role: data.role || '',
                    station: data.station || null,
                    profileImage: data.profileImage || 'https://via.placeholder.com/100',
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Please upload a valid image file.');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size must be less than 5MB.');
                return;
            }
            setNewImage(file);
            setUserData((prev) => ({
                ...prev,
                profileImage: URL.createObjectURL(file), // Preview locally
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const token = localStorage.getItem('token');
        if (!token) {
            setError('Authentication token missing. Please log in again.');
            navigate('/login');
            return;
        }

        const decoded = jwtDecode(token);
        const userId = decoded.user_id;

        const formData = new FormData();
        if (userData.name) formData.append('name', userData.name);
        if (userData.contact) formData.append('contact', userData.contact);
        if (newImage) formData.append('profileImage', newImage);

        if (!userData.name && !userData.contact && !newImage) {
            setError('No changes provided to update.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/users/${userId}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const result = await response.json();
            console.log('Profile Update Response:', result); // Log server response

            if (!response.ok) {
                throw new Error(result.error || 'Failed to update profile');
            }

            setSuccess('Profile updated successfully!');
            setUserData((prev) => ({
                ...prev,
                name: result.user.name || prev.name,
                contact: result.user.contact || prev.contact,
                profileImage: result.user.profileImage || prev.profileImage,
            }));

            // Notify App/Header of the updated profile image
            if (onProfileImageUpdate && result.user.profileImage) {
                console.log('Calling onProfileImageUpdate with:', result.user.profileImage);
                onProfileImageUpdate(result.user.profileImage);
            } else {
                console.log('No profile image returned or callback missing');
            }

            setNewImage(null);
        } catch (err) {
            console.error('Update error:', err);
            setError(err.message);
        }
    };

    if (loading) return <div className="text-center text-xl font-semibold">Loading...</div>;
    if (error && !userData.role) return <div className="text-center text-red-500">{error}</div>;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10"
        >
            <h1 className="text-3xl font-bold mb-6 text-blue-700 text-center">Edit Profile</h1>
            <div className="flex justify-center mb-6">
                <div className="relative">
                    <img
                        src={userData.profileImage}
                        alt="Profile"
                        className="w-32 h-32 rounded-full border-4 border-blue-200 object-cover"
                        onError={(e) => (e.target.src = 'https://via.placeholder.com/100')}
                    />
                    <label
                        htmlFor="profileImage"
                        className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-all"
                    >
                        <span className="text-sm">Change</span>
                        <input
                            type="file"
                            id="profileImage"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                        />
                    </label>
                </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Form fields unchanged */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                    <input type="text" id="name" name="name" value={userData.name} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" required />
                </div>
                <div>
                    <label htmlFor="contact" className="block text-sm font-medium text-gray-700">Contact</label>
                    <input type="text" id="contact" name="contact" value={userData.contact} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" required />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" id="email" name="email" value={userData.email} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-100 text-gray-500" disabled />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed.</p>
                </div>
                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                    <input type="text" id="role" name="role" value={userData.role === 'Admin' ? 'Administrator' : 'Police Officer'} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-100 text-gray-500" disabled />
                </div>
                {userData.role === 'Police' && (
                    <div>
                        <label htmlFor="station" className="block text-sm font-medium text-gray-700">Station</label>
                        <input type="text" id="station" name="station" value={userData.station?.name || 'Not Assigned'} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-100 text-gray-500" disabled />
                    </div>
                )}
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                {success && <p className="text-green-500 text-sm text-center">{success}</p>}
                <div className="flex justify-center">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md shadow-md hover:bg-blue-700 transition-all" disabled={loading}>
                        Save Changes
                    </motion.button>
                </div>
            </form>
        </motion.div>
    );
};

export default Profile;