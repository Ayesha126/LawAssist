const jwt = require('jsonwebtoken');
const { auth, isAdmin, isPolice } = require('./middleware/auth');
const JWT_SECRET = 'Shhh'; // In production, use environment variable



const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const User = require('./Models/User');
const Complaint = require('./Models/Complaint');
const FIR = require('./Models/Fir');  // If you have this model
const IPCSection = require('./Models/IPCSection');

const app = express();
const PORT = 8000;

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb+srv://the_umersaiyad:Umer2003@cluster0.dktji.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await User.findOne({ email: email.toLowerCase(), status: 'Active' });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { 
                user_id: user.user_id, 
                role: user.role,
                email: user.email
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ 
            message: 'Login successful',
            token,
            user: {
                user_id: user.user_id,
                name: user.name,
                role: user.role,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// ===================== USER ROUTES =====================

// Add a new User
app.post('/users', auth,isAdmin,async (req, res) => {
    try {
        const { name, contact, role, email, password, status = 'Active' } = req.body;

        if (!name || !contact || !role || !email || !password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate role
        if (!['Admin', 'Police'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        // Validate email
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Check email uniqueness
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const lastUser = await User.findOne().sort({ user_id: -1 });
        const user_id = lastUser ? lastUser.user_id + 1 : 1;

        const newUser = new User({
            user_id,
            name: name.trim(),
            contact,
            role,
            email: email.toLowerCase(),
            password: hashedPassword,
            status
        });

        await newUser.save();

        const { password: _, ...userWithoutPassword } = newUser.toObject();
        res.status(201).json({ message: 'User created successfully', user: userWithoutPassword });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// List all Active Users
app.get('/users', auth,isAdmin, async (req, res) => {
    try {
        const users = await User.find({ status: 'Active' }).select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get specific User
app.get('/users/:userId',  auth,isAdmin,async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const user = await User.findOne({ user_id: userId, status: 'Active' }).select('-password');

        if (!user) return res.status(404).json({ error: 'User not found' });

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update User
app.put('/users/:userId', auth,isAdmin, async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const updateData = { ...req.body };

        if (updateData.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        }

        const user = await User.findOneAndUpdate(
            { user_id: userId, status: 'Active' },
            updateData,
            { new: true }
        ).select('-password');

        if (!user) return res.status(404).json({ error: 'User not found' });

        res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Soft Delete User
app.delete('/users/:userId', auth,isAdmin, async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const user = await User.findOneAndUpdate(
            { user_id: userId, status: 'Active' },
            { status: 'Inactive' },
            { new: true }
        );

        if (!user) return res.status(404).json({ error: 'User not found' });

        res.status(200).json({ message: 'User deactivated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===================== COMPLAINT ROUTES =====================

// Add new Complaint
app.post('/complaints', auth,isPolice, async (req, res) => {
    try {
        const {
            description,
            complainant_name,
            complainant_contact,
            complainant_address,
            assigned_officer,
            evidence = []
        } = req.body;

        // Validate required fields
        if (!description || !complainant_name || !complainant_contact || !complainant_address || !assigned_officer) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Find the assigned officer
        const officer = await User.findOne({ 
            user_id: assigned_officer,
            status: 'Active',
            role: 'Police'
        });
        
        if (!officer) {
            return res.status(404).json({ error: 'Invalid or inactive assigned officer' });
        }

        // Find the last complaint to generate the next complaint_id
        const lastComplaint = await Complaint.findOne().sort({ complaint_id: -1 });
        const complaint_id = lastComplaint ? 
            lastComplaint.complaint_id + 1 : 1;

        const newComplaint = new Complaint({
            complaint_id,
            description: description.trim(),
            complainant_name: complainant_name.trim(),
            complainant_contact: complainant_contact.trim(),
            complainant_address: complainant_address.trim(),
            assigned_officer: officer._id,  // Store the MongoDB ObjectId reference
            evidence,
            status: 'Active'
        });

        const savedComplaint = await newComplaint.save();
        res.status(201).json({ 
            message: 'Complaint created successfully', 
            complaint: savedComplaint 
        });
    } catch (error) {
        console.error('Error adding complaint:', error);
        res.status(500).json({ error: 'Failed to add complaint' });
    }
});
// List all Active Complaints
app.get('/complaints',auth,isPolice, async (req, res) => {
    try {
        const complaints = await Complaint.find({ status: 'Active' })
            .populate('assigned_officer', 'name contact');
        res.status(200).json(complaints);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get specific Complaint
app.get('/complaints/:complaintId', auth,isPolice,async (req, res) => {
    try {
        const complaintId = parseInt(req.params.complaintId);
        const complaint = await Complaint.findOne({ 
            complaint_id: complaintId,
            status: 'Active'
        }).populate('assigned_officer', 'name contact');

        if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

        res.status(200).json(complaint);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Complaint
app.put('/complaints/:complaintId',auth,isPolice, async (req, res) => {
    try {
        const complaintId = parseInt(req.params.complaintId);
        const complaint = await Complaint.findOneAndUpdate(
            { complaint_id: complaintId, status: 'Active' },
            req.body,
            { new: true }
        ).populate('assigned_officer', 'name contact');

        if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

        res.status(200).json({ message: 'Complaint updated successfully', complaint });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Soft Delete Complaint
app.delete('/complaints/:complaintId',auth,isPolice, async (req, res) => {
    try {
        const complaintId = parseInt(req.params.complaintId);
        const complaint = await Complaint.findOneAndUpdate(
            { complaint_id: complaintId, status: 'Active' },
            { status: 'Inactive' },
            { new: true }
        );

        if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

        res.status(200).json({ message: 'Complaint deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===================== FIR ROUTES =====================

// Add new FIR
app.post('/firs', auth,isPolice,async (req, res) => {
    try {
        const { complaint, sections, user, status = 'Open' } = req.body;

        // Validate required fields
        if (!complaint || !sections || !user) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate sections is an array
        if (!Array.isArray(sections)) {
            return res.status(400).json({ error: 'Sections must be an array' });
        }

        // Validate status
        if (!['Open', 'In Progress', 'Closed'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        // Find the complaint
        const complaintDoc = await Complaint.findOne({ 
            complaint_id: complaint,
            status: 'Active',
        });
        if (!complaintDoc) {
            return res.status(404).json({ error: 'Complaint not found' });
        }

        // Find all the sections
        const sectionDocs = await IPCSection.find({ 
            section: { $in: sections }
        });
        if (sectionDocs.length !== sections.length) {
            return res.status(404).json({ error: 'One or more sections not found' });
        }

        // Find the user
        const userDoc = await User.findOne({ 
            user_id: user,
            status: 'Active',
            role: 'Police'
        });
        if (!userDoc) {
            return res.status(404).json({ error: 'Invalid or inactive assigned officer/User' });
        }

        // Generate next FIR ID
        const lastFIR = await FIR.findOne().sort({ fir_id: -1 });
        const fir_id = lastFIR ? lastFIR.fir_id + 1 : 1;

        const newFIR = new FIR({
            fir_id,
            complaint: complaintDoc._id,
            sections: sectionDocs.map(doc => doc._id),  // Array of section ObjectIds
            user: userDoc._id,
            status
        });

        const savedFIR = await newFIR.save();

        // Populate the response with all references
        const populatedFIR = await FIR.findById(savedFIR._id)
            .populate('complaint')
            .populate('sections')
            .populate('user', '-password');

        res.status(201).json({ 
            message: 'FIR created successfully', 
            fir: populatedFIR 
        });
    } catch (error) {
        console.error('Error creating FIR:', error);
        res.status(500).json({ error: 'Failed to create FIR' });
    }
});

// List all FIRs (excluding Closed)
app.get('/firs',auth,isPolice, async (req, res) => {
    try {
        const firs = await FIR.find({ status: { $ne: 'Closed' } })
            .populate('complaint')
            .populate('user', 'name contact');
        res.status(200).json(firs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get specific FIR
app.get('/firs/:firId',auth,isPolice, async (req, res) => {
    try {
        const firId = parseInt(req.params.firId);
        const fir = await FIR.findOne({ 
            fir_id: firId,
            status: { $ne: 'Closed' }
        })
            .populate('complaint')
            .populate('user', 'name contact');

        if (!fir) return res.status(404).json({ error: 'FIR not found' });

        res.status(200).json(fir);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update FIR
app.put('/firs/:firId',auth,isPolice, async (req, res) => {
    try {
        const firId = parseInt(req.params.firId);
        const { complaint, sections, user, status } = req.body;

        // Find the FIR first to check if it exists and isn't closed
        const existingFir = await FIR.findOne({ fir_id: firId });
        if (!existingFir) {
            return res.status(404).json({ error: 'FIR not found' });
        }
        if (existingFir.status === 'Closed') {
            return res.status(400).json({ error: 'Cannot update a closed FIR' });
        }

        // Prepare update object
        const updateData = {};

        // Handle complaint update
        if (complaint) {
            const complaintDoc = await Complaint.findOne({ complaint_id: complaint });
            if (!complaintDoc) {
                return res.status(404).json({ error: 'Complaint not found' });
            }
            updateData.complaint = complaintDoc._id;
        }

        // Handle sections update
        if (sections) {
            if (!Array.isArray(sections)) {
                return res.status(400).json({ error: 'Sections must be an array' });
            }
            const sectionDocs = await IPCSection.find({ section: { $in: sections } });
            if (sectionDocs.length !== sections.length) {
                return res.status(404).json({ error: 'One or more sections not found' });
            }
            updateData.sections = sectionDocs.map(doc => doc._id);
        }

        // Handle user update
        if (user) {
            const userDoc = await User.findOne({ 
                user_id: user,
                status: 'Active'
            });
            if (!userDoc) {
                return res.status(404).json({ error: 'User not found' });
            }
            updateData.user = userDoc._id;
        }

        // Handle status update
        if (status) {
            if (!['Open', 'In Progress', 'Closed'].includes(status)) {
                return res.status(400).json({ error: 'Invalid status' });
            }
            updateData.status = status;
        }

        // Update the FIR
        const updatedFir = await FIR.findOneAndUpdate(
            { fir_id: firId },
            updateData,
            { 
                new: true,
                runValidators: true
            }
        )
        .populate('complaint')
        .populate('sections')
        .populate('user', '-password');

        res.status(200).json({ 
            message: 'FIR updated successfully', 
            fir: updatedFir 
        });
    } catch (error) {
        console.error('Error updating FIR:', error);
        res.status(500).json({ error: 'Failed to update FIR' });
    }
});
// Soft Delete FIR (Change status to Closed)
app.delete('/firs/:firId',auth,isPolice, async (req, res) => {
    try {
        const firId = parseInt(req.params.firId);
        const fir = await FIR.findOneAndUpdate(
            { fir_id: firId, status: { $ne: 'Closed' } },
            { status: 'Closed' },
            { new: true }
        );

        if (!fir) return res.status(404).json({ error: 'FIR not found' });

        res.status(200).json({ message: 'FIR closed successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add new IPC Section
app.post('/ipc-sections',auth,isAdmin, async (req, res) => {
    try {
        const {
            section,
            description,
            offense,
            punishment,
            cognizable,
            bailable,
            court
        } = req.body;

        // Validate required fields
        if (!section || !description || !offense || !punishment || !cognizable || !bailable || !court) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate cognizable and bailable values
        if (!['Cognizable', 'Non-Cognizable'].includes(cognizable)) {
            return res.status(400).json({ error: 'Invalid cognizable value' });
        }

        if (!['Bailable', 'Non-Bailable'].includes(bailable)) {
            return res.status(400).json({ error: 'Invalid bailable value' });
        }

        // Check if section already exists
        const existingSection = await IPCSection.findOne({ section });
        if (existingSection) {
            return res.status(400).json({ error: 'IPC Section already exists' });
        }

        const newIPCSection = new IPCSection({
            section,
            description,
            offense,
            punishment,
            cognizable,
            bailable,
            court
        });

        await newIPCSection.save();
        res.status(201).json({ 
            message: 'IPC Section created successfully', 
            ipcSection: newIPCSection 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// List all IPC Sections
app.get('/ipc-sections',auth, async (req, res) => {
    try {
        const ipcSections = await IPCSection.find()
            .sort({ section: 1 }); // Sort by section number
        res.status(200).json(ipcSections);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get specific IPC Section
app.get('/ipc-sections/:section',auth, async (req, res) => {
    try {
        const section = req.params.section;
        const ipcSection = await IPCSection.findOne({ section });

        if (!ipcSection) {
            return res.status(404).json({ error: 'IPC Section not found' });
        }

        res.status(200).json(ipcSection);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update IPC Section
app.put('/ipc-sections/:section',auth,isAdmin, async (req, res) => {
    try {
        const section = req.params.section;
        const updateData = req.body;

        // Validate cognizable and bailable if they're being updated
        if (updateData.cognizable && !['Cognizable', 'Non-Cognizable'].includes(updateData.cognizable)) {
            return res.status(400).json({ error: 'Invalid cognizable value' });
        }

        if (updateData.bailable && !['Bailable', 'Non-Bailable'].includes(updateData.bailable)) {
            return res.status(400).json({ error: 'Invalid bailable value' });
        }

        const ipcSection = await IPCSection.findOneAndUpdate(
            { section },
            updateData,
            { new: true }
        );

        if (!ipcSection) {
            return res.status(404).json({ error: 'IPC Section not found' });
        }

        res.status(200).json({ 
            message: 'IPC Section updated successfully', 
            ipcSection 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete IPC Section
app.delete('/ipc-sections/:section',auth,isAdmin, async (req, res) => {
    try {
        const section = req.params.section;
        const ipcSection = await IPCSection.findOneAndDelete({ section });

        if (!ipcSection) {
            return res.status(404).json({ error: 'IPC Section not found' });
        }

        res.status(200).json({ 
            message: 'IPC Section deleted successfully' 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Search IPC Sections
app.get('/ipc-sections/search/:query',auth, async (req, res) => {
    try {
        const query = req.params.query;
        const ipcSections = await IPCSection.find({
            $or: [
                { section: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { offense: { $regex: query, $options: 'i' } }
            ]
        }).sort({ section: 1 });

        res.status(200).json(ipcSections);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});