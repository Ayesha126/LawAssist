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
const Station = require("./Models/Station");
const Citizen = require("./Models/Citizen");
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
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { 
                user_id: user.user_id, 
                role: user.role,
                email: user.email,
                station:user.station

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
                email: user.email,
                station:user.station
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post("/suggest-sections", async (req, res) => {
    const { description } = req.body;
    if (!description) return res.status(400).json({ error: "Description is required" });
  
    try {
      const collection = await connectDB();
      const sections = await collection.find().toArray();
  
      // Simple rule-based NLP (replace with a proper NLP model like BERT or spaCy)
      const keywords = description.toLowerCase().split(" ");
      const suggested = sections.filter(section => {
        const descLower = section.description.toLowerCase();
        return keywords.some(keyword => descLower.includes(keyword));
      }).map(section => section.section).slice(0, 3); // Limit to top 3 suggestions
  
      res.json({ sections: suggested });
    } catch (error) {
      console.error("Error suggesting sections:", error);
      res.status(500).json({ error: "Failed to suggest sections" });
    }
  });
  
// ===================== USER ROUTES =====================
//--------------------------------------------------------
// Add Station
app.post("/stations", auth, isAdmin, async (req, res) => {
    try {
        const { name, address, contact, jurisdiction_area, status = "Active" } = req.body;

        if (!name || !address || !contact || !jurisdiction_area) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Validate address fields
        const { building_number, street, area, city, state, postal_code } = address;
        if (!building_number || !street || !area || !city || !state || !postal_code) {
            return res.status(400).json({ error: "Incomplete address details" });
        }

        // Auto-increment station_id
        const lastStation = await Station.findOne().sort({ station_id: -1 });
        const station_id = lastStation ? lastStation.station_id + 1 : 1;

        const newStation = new Station({
            station_id,
            name: name.trim(),
            address,
            contact,
            jurisdiction_area,
            status,
        });

        await newStation.save();
        res.status(201).json({ message: "Police Station added successfully", station: newStation });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Get All Active Police Stations
app.get("/stations", auth, async (req, res) => {
    try {
        const stations = await Station.find({ status: "Active" }).sort({ station_id: 1 });
        res.status(200).json(stations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Get Specific Police Station by ID
app.get("/stations/:stationId", auth, async (req, res) => {
    try {
        const stationId = parseInt(req.params.stationId);
        const station = await Station.findOne({ station_id: stationId, status: "Active" });

        if (!station) return res.status(404).json({ error: "Police Station not found" });

        res.status(200).json(station);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Update Police Station
app.put("/stations/:stationId", auth, isAdmin, async (req, res) => {
    try {
        const stationId = parseInt(req.params.stationId);
        const updateData = { ...req.body };

        // Validate address fields if updating address
        if (updateData.address) {
            const { building_number, street, area, city, state, postal_code } = updateData.address;
            if (!building_number || !street || !area || !city || !state || !postal_code) {
                return res.status(400).json({ error: "Incomplete address details" });
            }
        }

        const station = await Station.findOneAndUpdate(
            { station_id: stationId, status: "Active" },
            updateData,
            { new: true }
        );

        if (!station) return res.status(404).json({ error: "Police Station not found" });

        res.status(200).json({ message: "Police Station updated successfully", station });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Soft Delete (Deactivate) Police Station
app.delete("/stations/:stationId", auth, isAdmin, async (req, res) => {
    try {
        const stationId = parseInt(req.params.stationId);
        const station = await Station.findOneAndUpdate(
            { station_id: stationId, status: "Active" },
            { status: "Inactive" },
            { new: true }
        );

        if (!station) return res.status(404).json({ error: "Police Station not found" });

        res.status(200).json({ message: "Police Station deactivated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//add-citizen
app.post("/citizen", async (req, res) => {
    try {
        const { name, contact, address, emergency_contacts, email, password, status = "Active" } = req.body;

        if (!name || !contact || !address || !email || !password) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Validate email
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        // Check email uniqueness
        const existingCitizen = await Citizen.findOne({ email: email.toLowerCase() });
        if (existingCitizen) {
            return res.status(400).json({ error: "Email already exists" });
        }

        // Validate emergency contacts (max 3)
        if (emergency_contacts && emergency_contacts.length > 3) {
            return res.status(400).json({ error: "A citizen can have a maximum of 3 emergency contacts" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Auto-increment `c_id`
        const lastCitizen = await Citizen.findOne().sort({ c_id: -1 });
        const c_id = lastCitizen ? lastCitizen.c_id + 1 : 1;

        const newCitizen = new Citizen({
            c_id,
            name: name.trim(),
            contact,
            address,
            emergency_contacts: emergency_contacts || [],
            email: email.toLowerCase(),
            password: hashedPassword,
            status,
        });

        await newCitizen.save();

        const { password: _, ...citizenWithoutPassword } = newCitizen.toObject();
        res.status(201).json({ message: "Citizen created successfully", citizen: citizenWithoutPassword });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * ✅ Get All Active Citizens
 */
app.get("/citizen", auth,  async (req, res) => {
    try {
        const citizens = await Citizen.find({ status: "Active" }).select("-password");
        res.status(200).json(citizens);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get("/citizen/:contact", auth, async (req, res) => {
    try {
      const { contact } = req.params;
      const citizen = await Citizen.findOne({ contact });
      if (!citizen) return res.status(404).json({ error: "Citizen not found" });
      res.status(200).json(citizen);
    } catch (error) {
      console.error("Error fetching citizen:", error);
      res.status(500).json({ error: "Failed to fetch citizen" });
    }
  });
/**
 * ✅ Get Specific Citizen by c_id
 */
app.get("/citizen/:c_id", auth,  async (req, res) => {
    try {
        const c_id = parseInt(req.params.c_id);
        const citizen = await Citizen.findOne({ c_id, status: "Active" }).select("-password");

        if (!citizen) return res.status(404).json({ error: "Citizen not found" });

        res.status(200).json(citizen);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * ✅ Update Citizen (Handles Password Change & Emergency Contacts Limit)
 */
app.put("/citizen/:c_id", auth, isAdmin, async (req, res) => {
    try {
        const c_id = parseInt(req.params.c_id);
        const updateData = { ...req.body };

        // Hash new password if provided
        if (updateData.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        }

        // Validate emergency contacts (max 3)
        if (updateData.emergency_contacts && updateData.emergency_contacts.length > 3) {
            return res.status(400).json({ error: "A citizen can have a maximum of 3 emergency contacts" });
        }

        const citizen = await Citizen.findOneAndUpdate(
            { c_id, status: "Active" },
            updateData,
            { new: true }
        ).select("-password");

        if (!citizen) return res.status(404).json({ error: "Citizen not found" });

        res.status(200).json({ message: "Citizen updated successfully", citizen });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * ✅ Soft Delete Citizen (Marks as Inactive)
 */
app.delete("/citizen/:c_id", auth, isAdmin, async (req, res) => {
    try {
        const c_id = parseInt(req.params.c_id);
        const citizen = await Citizen.findOneAndUpdate(
            { c_id, status: "Active" },
            { status: "Inactive" },
            { new: true }
        );

        if (!citizen) return res.status(404).json({ error: "Citizen not found" });

        res.status(200).json({ message: "Citizen deactivated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/users", auth, isAdmin, async (req, res) => {
    try {
        const { name, contact, role, email, password, station, status = "Active" } = req.body;

        if (!name || !contact || !role || !email || !password) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Validate role
        if (!["Admin", "Police"].includes(role)) {
            return res.status(400).json({ error: "Invalid role" });
        }

        // Validate email
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        // Check email uniqueness
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ error: "Email already exists" });
        }

        // Check station validity for Police users
        let stationRef = null;
        if (role === "Police") {
            if (!station) return res.status(400).json({ error: "Station is required for Police users" });

            // 🔥 Convert station number to ObjectId
            const existingStation = await Station.findOne({ station_id: station }); 
            if (!existingStation) return res.status(404).json({ error: "Station not found" });

            stationRef = existingStation._id;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Auto-increment user_id
        const lastUser = await User.findOne().sort({ user_id: -1 });
        const user_id = lastUser ? lastUser.user_id + 1 : 1;

        const newUser = new User({
            user_id,
            name: name.trim(),
            contact,
            role,
            email: email.toLowerCase(),
            password: hashedPassword,
            station: stationRef,
            status,
        });

        await newUser.save();

        const { password: _, ...userWithoutPassword } = newUser.toObject();
        res.status(201).json({ message: "User created successfully", user: userWithoutPassword });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ List all Active Users (Include Station Data for Police Users)
app.get("/users", auth, async (req, res) => {
    try {
        const users = await User.find({ status: "Active" })
            .select("-password")
            .populate("station", "station_id name address"); // Populate station details

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Get Specific User by user_id
app.get("/users/:userId", auth, async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const user = await User.findOne({ user_id: userId, status: "Active" })
            .select("-password")
            .populate("station", "station_id name address"); // Populate station details

        if (!user) return res.status(404).json({ error: "User not found" });

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Update User (Handle Station Field)
app.put("/users/:userId", auth, isAdmin, async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const updateData = { ...req.body };

        if (updateData.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        }

        // Validate station for Police users
        if (updateData.role === "Police" && updateData.station) {
            const stationExists = await Station.findOne({ station_id: updateData.station });
            if (!stationExists) return res.status(404).json({ error: "Station not found" });

            updateData.station = stationExists._id;
        }

        const user = await User.findOneAndUpdate(
            { user_id: userId, status: "Active" },
            updateData,
            { new: true }
        ).select("-password").populate("station", "station_id name address");

        if (!user) return res.status(404).json({ error: "User not found" });

        res.status(200).json({ message: "User updated successfully", user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Soft Delete User
app.delete("/users/:userId", auth, isAdmin, async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const user = await User.findOneAndUpdate(
            { user_id: userId, status: "Active" },
            { status: "Inactive" },
            { new: true }
        );

        if (!user) return res.status(404).json({ error: "User not found" });

        res.status(200).json({ message: "User deactivated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// ===================== COMPLAINT ROUTES =====================
// Add new Complaint

app.post("/complaints", auth, isPolice, async (req, res) => {
    try {
      const { description, assigned_station, citizen, citizen_name, citizen_address, citizen_email, sections, evidence = [] } = req.body;
  
      // Validate required fields
      if (!description || !assigned_station || !citizen || !citizen_name || !citizen_address || !citizen_email) {
        return res.status(400).json({ error: "Missing required fields" });
      }
  
      // Fetch Station ObjectId
      const station = await Station.findOne({ station_id: assigned_station });
      if (!station) return res.status(404).json({ error: "Invalid Station" });
  
      // Check if Citizen Exists
      let citizenData = await Citizen.findOne({ contact: citizen });
      if (!citizenData) {
        const lastCitizen = await Citizen.findOne().sort({ c_id: -1 });
        const c_id = lastCitizen ? lastCitizen.c_id + 1 : 1;
        const defaultPassword = await bcrypt.hash("Citizen@123", 10);
  
        const newCitizen = new Citizen({
          c_id,
          name: citizen_name.trim(),
          contact: citizen,
          address: citizen_address.trim(),
          email: citizen_email.toLowerCase(),
          password: defaultPassword,
          status: "Active",
        });
        citizenData = await newCitizen.save();
      }
  
      // Fetch & Validate IPC Sections
      let sectionDetails = [];
      if (sections && sections.length > 0) {
        for (const section of sections) {
          // Try exact match first, then numeric part
          let ipcSection = await IPCSection.findOne({ section });
          if (!ipcSection) {
            const numericSection = section.replace(/\D/g, ""); // Extract numbers (e.g., "304" from "IPC 304")
            ipcSection = await IPCSection.findOne({ section: `IPC ${numericSection}` });
          }
          if (!ipcSection) return res.status(404).json({ error: `Section ${section} not found` });
  
          sectionDetails.push({
            section_id: ipcSection._id,
            cognizable: ipcSection.cognizable,
          });
        }
      }
  
      // Get last complaint ID and increment
      const lastComplaint = await Complaint.findOne().sort({ complaint_id: -1 });
      const complaint_id = lastComplaint ? lastComplaint.complaint_id + 1 : 1;
  
      // Create new Complaint
      const newComplaint = new Complaint({
        complaint_id,
        description: description.trim(),
        assigned_station: station._id,
        citizen: citizenData.contact,
        sections: sectionDetails,
        evidence,
        status: "Active",
      });
  
      const savedComplaint = await newComplaint.save();
      res.status(201).json({ message: "Complaint created successfully", complaint: savedComplaint });
    } catch (error) {
      console.error("Error creating complaint:", error);
      res.status(500).json({ error: "Failed to create complaint" });
    }
  });

// ✅ Fetch all complaints with pagination & optional filters
app.get("/complaints", auth, isPolice, async (req, res) => {
    try {
        let { station, citizen, status } = req.query;
        
        let query = { status: "Active" };

        if (station) {
            const stationObj = await Station.findOne({ station_id: station });
            if (!stationObj) return res.status(404).json({ error: "Invalid station" });
            query.assigned_station = stationObj._id;
        }

        if (citizen) {
            const citizenObj = await Citizen.findOne({ contact: citizen });
            if (!citizenObj) return res.status(404).json({ error: "Citizen not found" });
            query.citizen = citizenObj.contact;
        }

        if (status) query.status = status;

        const complaints = await Complaint.find(query)
            .populate("assigned_station", "station_name location")
            .populate("sections.section_id", "section description")
            .sort({ updatedAt: -1 });

        res.status(200).json(complaints);
    } catch (error) {
        console.error("Error fetching complaints:", error);
        res.status(500).json({ error: "Failed to fetch complaints" });
    }
});


// ✅ Fetch complaint by ID
app.get("/complaints/:complaintId", auth, isPolice, async (req, res) => {
    try {
        const { complaintId } = req.params;

        const complaint = await Complaint.findOne({ complaint_id: complaintId, status: "Active" })
            .populate("assigned_station", "station_name location")
            .populate("sections.section_id", "section description cognizable");

        if (!complaint) return res.status(404).json({ error: "Complaint not found" });

        // Fetch citizen details separately using contact reference
        const citizenData = await Citizen.findOne({ contact: complaint.citizen }, "name contact address email");
        complaint._doc.citizen = citizenData || {};

        res.status(200).json(complaint);
    } catch (error) {
        console.error("Error fetching complaint:", error);
        res.status(500).json({ error: "Failed to fetch complaint" });
    }
});

// ✅ Update complaint
// ✅ Update complaint
app.put("/complaints/:complaintId", auth, isPolice, async (req, res) => {
    try {
      const { complaintId } = req.params;
      const {
        description,
        assigned_station,
        citizen,
        citizen_name,
        citizen_address,
        citizen_email,
        sections,
        evidence,
        status = "Active", // Default to "Active" to prevent accidental status changes
      } = req.body;
  
      // Find the complaint (ensure it's active)
      const complaint = await Complaint.findOne({ complaint_id: complaintId, status: "Active" });
      if (!complaint) return res.status(404).json({ error: "Complaint not found or inactive" });
  
      // Update description if provided
      if (description) complaint.description = description.trim();
  
      // Update assigned station if provided
      if (assigned_station) {
        const station = await Station.findOne({ station_id: assigned_station });
        if (!station) return res.status(404).json({ error: "Invalid station ID" });
        complaint.assigned_station = station._id;
      }
  
      // Update citizen details if provided
      if (citizen || citizen_name || citizen_address || citizen_email) {
        // Validate and update citizen data
        const citizenObj = await Citizen.findOne({ contact: citizen || complaint.citizen });
        if (!citizenObj && citizen) return res.status(404).json({ error: "Citizen not found" });
  
        complaint.citizen = citizen || complaint.citizen;
        complaint.citizen_name = citizen_name || complaint.citizen_name;
        complaint.citizen_address = citizen_address || complaint.citizen_address;
        complaint.citizen_email = citizen_email || complaint.citizen_email;
      }
  
      // Update sections if provided
      if (sections && Array.isArray(sections)) {
        let sectionDetails = [];
        for (const section of sections) {
          // Normalize section format (handle both "IPC 304" and "304")
          const normalizedSection = section.startsWith("IPC ") ? section : `IPC ${section.trim()}`;
          const ipcSection = await IPCSection.findOne({ section: normalizedSection });
          if (!ipcSection) return res.status(404).json({ error: `Section ${normalizedSection} not found` });
  
          sectionDetails.push({
            section_id: ipcSection._id,
            cognizable: ipcSection.cognizable,
          });
        }
        complaint.sections = sectionDetails;
      }
  
      // Update evidence if provided
      if (evidence) {
        complaint.evidence = Array.isArray(evidence) ? evidence.map(e => e.trim()) : [evidence.trim()];
      }
  
      // Ensure status remains "Active" unless explicitly changed (optional)
      if (status && ["Active", "Inactive"].includes(status)) {
        complaint.status = status;
      }
  
      // Update timestamp
      complaint.updatedAt = new Date();
  
      // Save and return updated complaint
      const updatedComplaint = await complaint.save();
      res.status(200).json({
        message: "Complaint updated successfully",
        complaint: updatedComplaint,
      });
    } catch (error) {
      console.error("Error updating complaint:", error);
      res.status(500).json({ error: "Failed to update complaint" });
    }
  });

// ✅ Soft delete complaint
app.delete("/complaints/:complaintId", auth, isPolice, async (req, res) => {
    try {
        const { complaintId } = req.params;

        const complaint = await Complaint.findOneAndUpdate(
            { complaint_id: complaintId, status: "Active" },
            { status: "Inactive", updatedAt: new Date() },
            { new: true }
        );

        if (!complaint) return res.status(404).json({ error: "Complaint not found" });

        res.status(200).json({ message: "Complaint deleted successfully" });
    } catch (error) {
        console.error("Error deleting complaint:", error);
        res.status(500).json({ error: "Failed to delete complaint" });
    }
});


// 🔹 Create Complaint (Handles Citizen Entry Too)
// app.post("/complaints", auth, isPolice, async (req, res) => {
//     try {
//         const { description, assigned_station, citizen, citizen_name, citizen_address, citizen_email, sections, evidence = [] } = req.body;

//         if (!description || !assigned_station || !citizen) {
//             return res.status(400).json({ error: "Missing required fields" });
//         }

//         // Fetch or Create Citizen
//         let citizenData = await Citizen.findOne({ contact: citizen });
//         if (!citizenData) {
//             const lastCitizen = await Citizen.findOne().sort({ c_id: -1 });
//             const newCitizenId = lastCitizen ? lastCitizen.c_id + 1 : 1;

//             citizenData = new Citizen({
//                 c_id: newCitizenId,
//                 name: citizen_name,
//                 contact: citizen,
//                 address: citizen_address,
//                 email: citizen_email,
//                 password: "Citizen@123", // Default password
//                 status: "Active"
//             });
//             await citizenData.save();
//         }

//         // Fetch Station ObjectId
//         const station = await Station.findOne({ station_id: assigned_station });
//         if (!station) return res.status(404).json({ error: "Invalid Station" });

//         // Fetch & Validate IPC Sections
//         let sectionDetails = [];
//         if (sections && sections.length > 0) {
//             for (const section of sections) {
//                 const ipcSection = await IPCSection.findOne({ section: section });
//                 if (!ipcSection) return res.status(404).json({ error: `Section ${section} not found` });

//                 sectionDetails.push({
//                     section_id: ipcSection._id,
//                     cognizable: ipcSection.cognizable
//                 });
//             }
//         }

//         // Get last complaint ID and increment
//         const lastComplaint = await Complaint.findOne().sort({ complaint_id: -1 });
//         const complaint_id = lastComplaint ? lastComplaint.complaint_id + 1 : 1;

//         // Create new Complaint
//         const newComplaint = new Complaint({
//             complaint_id,
//             description: description.trim(),
//             assigned_station: station._id,
//             citizen: citizenData.contact, // Storing citizen contact
//             sections: sectionDetails,
//             evidence,
//             status: "Active"
//         });

//         await newComplaint.save();
//         res.status(201).json({ message: "Complaint created successfully", complaint: newComplaint });

//     } catch (error) {
//         console.error("Error creating complaint:", error);
//         res.status(500).json({ error: "Failed to create complaint" });
//     }
// });
// ===================== FIR ROUTES =====================
// Add new FIR
// app.post('/firs', auth, isPolice, async (req, res) => {
//     try {
//         const { complaint, description, citizen, sections, assigned_officer, status = 'Open', evidence } = req.body;

//         // Validate sections as an array
//         if (!Array.isArray(sections) || sections.length === 0) {
//             return res.status(400).json({ error: 'Sections must be a non-empty array' });
//         }

//         // Validate status
//         if (!['Open', 'In Progress', 'Closed'].includes(status)) {
//             return res.status(400).json({ error: 'Invalid status' });
//         }

//         let complaintDoc = null;
//         let citizenData = null;

//         if (complaint) {
//             // ✅ Check if Complaint Exists and is Active
//             complaintDoc = await Complaint.findOne({ complaint_id: complaint, status: 'Active' }).populate('sections');

//             if (!complaintDoc) {
//                 return res.status(404).json({ error: 'Complaint not found' });
//             }

//             // ✅ Ensure FIR is Not Already Filed for This Complaint
//             const existingFIR = await FIR.findOne({ complaint: complaintDoc._id });
//             if (existingFIR) {
//                 return res.status(400).json({ error: 'FIR has already been filed for this complaint' });
//             }

//             // ✅ Ensure at least one section is "Cognizable"
//             const isCognizable = complaintDoc.sections.some(sec => sec.cognizable === 'Cognizable');

//             if (!isCognizable) {
//                 return res.status(400).json({ error: 'FIR cannot be filed for a non-cognizable complaint' });
//             }

//             // ✅ If FIR is based on a complaint, fetch citizen data
//             citizenData = complaintDoc.complainant;
//         } else {
//             // ✅ If direct FIR, Ensure Mandatory Fields Exist
//             if (!description || !assigned_officer) {
//                 return res.status(400).json({ error: 'Description and assigned officer are required for direct FIR' });
//             }
//         }

//         // ✅ Fetch Sections from Database (Based on "section" Field)
//         const sectionDocs = await IPCSection.find({ section: { $in: sections } });

//         if (sectionDocs.length !== sections.length) {
//             return res.status(404).json({ error: 'One or more sections not found' });
//         }

//         // ✅ Fetch Assigned Officer (Police User)
//         const assignedOfficer = await User.findOne({ user_id: assigned_officer, status: 'Active', role: 'Police' });

//         if (!assignedOfficer) {
//             return res.status(404).json({ error: 'Invalid or inactive assigned officer' });
//         }

//         // ✅ Generate FIR ID (Numeric)
//         const lastFIR = await FIR.findOne().sort({ fir_id: -1 });
//         const fir_id = lastFIR ? lastFIR.fir_id + 1 : 1;

//         // ✅ Create FIR Object
//         const newFIR = new FIR({
//             fir_id,
//             complaint: complaintDoc ? complaintDoc._id : null,
//             description,
//             citizen: citizenData || null, // Citizen from complaint, if applicable
//             sections: sectionDocs.map(doc => doc._id),
//             user: assignedOfficer._id, // Assigned police officer
//             status,
//             evidence
//         });

//         const savedFIR = await newFIR.save();

//         // ✅ Populate Response with All References
//         const populatedFIR = await FIR.findById(savedFIR._id)
//             .populate('complaint')
//             .populate('sections')
//             .populate('user', '-password');

//         res.status(201).json({ message: 'FIR created successfully', fir: populatedFIR });
//     } catch (error) {
//         console.error('Error creating FIR:', error);
//         res.status(500).json({ error: 'Failed to create FIR' });
//     }
// });

// // ✅ List All FIRs (Excluding Closed)
// app.get('/firs', auth, isPolice, async (req, res) => {
//     try {
//         const firs = await FIR.find({ status: { $ne: 'Closed' } })
//             .populate('complaint')
//             .populate('user', 'name contact');
//         res.status(200).json(firs);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // ✅ Get a specific FIR by FIR ID
// app.get('/firs/:firId', auth, isPolice, async (req, res) => {
//     try {
//         const firId = parseInt(req.params.firId);
//         const fir = await FIR.findOne({ fir_id: firId, status: { $ne: 'Closed' } })
//             .populate('complaint')
//             .populate('sections')
//             .populate('user', 'name contact');

//         if (!fir) return res.status(404).json({ error: 'FIR not found' });

//         res.status(200).json(fir);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // ✅ Update an FIR
// app.put('/firs/:firId', auth, isPolice, async (req, res) => {
//     try {
//         const firId = parseInt(req.params.firId);
//         const { description, sections, assigned_officer, status, evidence } = req.body;

//         // Find the FIR first
//         const existingFir = await FIR.findOne({ fir_id: firId });

//         if (!existingFir) {
//             return res.status(404).json({ error: 'FIR not found' });
//         }

//         if (existingFir.status === 'Closed') {
//             return res.status(400).json({ error: 'Cannot update a closed FIR' });
//         }

//         // Prepare update object
//         const updateData = {};

//         // Update Description
//         if (description) updateData.description = description;

//         // Update Sections
//         if (sections) {
//             if (!Array.isArray(sections)) {
//                 return res.status(400).json({ error: 'Sections must be an array' });
//             }
//             const sectionDocs = await IPCSection.find({ section: { $in: sections } });
//             if (sectionDocs.length !== sections.length) {
//                 return res.status(404).json({ error: 'One or more sections not found' });
//             }
//             updateData.sections = sectionDocs.map(doc => doc._id);
//         }

//         // Update Assigned Officer
//         if (assigned_officer) {
//             const userDoc = await User.findOne({ user_id: assigned_officer, status: 'Active' });
//             if (!userDoc) {
//                 return res.status(404).json({ error: 'Assigned officer not found' });
//             }
//             updateData.user = userDoc._id;
//         }

//         // Update Status
//         if (status) {
//             if (!['Open', 'In Progress', 'Closed'].includes(status)) {
//                 return res.status(400).json({ error: 'Invalid status' });
//             }
//             updateData.status = status;
//         }

//         // Update Evidence
//         if (evidence) updateData.evidence = evidence;

//         // Perform update
//         const updatedFir = await FIR.findOneAndUpdate(
//             { fir_id: firId },
//             updateData,
//             { new: true, runValidators: true }
//         )
//             .populate('complaint')
//             .populate('sections')
//             .populate('user', '-password');

//         res.status(200).json({ message: 'FIR updated successfully', fir: updatedFir });
//     } catch (error) {
//         res.status(500).json({ error: 'Failed to update FIR' });
//     }
// });

// // ✅ Soft Delete FIR (Change status to Closed)
// app.delete('/firs/:firId', auth, isPolice, async (req, res) => {
//     try {
//         const firId = parseInt(req.params.firId);
//         const fir = await FIR.findOneAndUpdate(
//             { fir_id: firId, status: { $ne: 'Closed' } },
//             { status: 'Closed' },
//             { new: true }
//         );

//         if (!fir) return res.status(404).json({ error: 'FIR not found' });

//         res.status(200).json({ message: 'FIR closed successfully' });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });
app.post('/firs', auth, isPolice, async (req, res) => {
    try {
      const { complaint, description, citizen, sections, assigned_officer, status = 'Open', evidence } = req.body;
  
      // Validate sections as an array
      if (!Array.isArray(sections) || sections.length === 0) {
        return res.status(400).json({ error: 'Sections must be a non-empty array' });
      }
  
      // Validate status
      if (!['Open', 'In Progress', 'Closed'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
  
      let complaintDoc = null;
      let citizenId = null;
  
      // Handle complaint-based FIR
      if (complaint) {
        complaintDoc = await Complaint.findOne({ complaint_id: complaint, status: 'Active' }).populate('sections');
        if (!complaintDoc) {
          return res.status(404).json({ error: 'Complaint not found' });
        }
  
        // Check if FIR already exists
        const existingFIR = await FIR.findOne({ complaint: complaintDoc._id });
        if (existingFIR) {
          return res.status(400).json({ error: 'FIR has already been filed for this complaint' });
        }
  
        // Ensure at least one section is cognizable
        const isCognizable = complaintDoc.sections.some((sec) => sec.cognizable === 'Cognizable');
        if (!isCognizable) {
          return res.status(400).json({ error: 'FIR cannot be filed for a non-cognizable complaint' });
        }
  
        // Resolve citizen from complaint's contact string
        const citizenContact = complaintDoc.citizen;
        const citizenDoc = await Citizen.findOne({ contact: citizenContact });
        if (!citizenDoc) {
          return res.status(404).json({ error: `Citizen with contact ${citizenContact} not found` });
        }
        citizenId = citizenDoc._id;
      } else {
        // Direct FIR: require description and assigned_officer
        if (!description || !assigned_officer) {
          return res.status(400).json({ error: 'Description and assigned officer are required for direct FIR' });
        }
  
        // Resolve citizen if provided (optional for direct FIR)
        if (citizen) {
          const citizenDoc = await Citizen.findOne(
            mongoose.Types.ObjectId.isValid(citizen) ? { _id: citizen } : { contact: citizen }
          );
          if (!citizenDoc) {
            return res.status(404).json({ error: `Citizen not found` });
          }
          citizenId = citizenDoc._id;
        }
      }
  
      // Fetch IPC sections
      const sectionDocs = await IPCSection.find({ section: { $in: sections } });
      if (sectionDocs.length !== sections.length) {
        return res.status(404).json({ error: 'One or more sections not found' });
      }
  
      // Fetch assigned officer
      const assignedOfficer = await User.findOne({ user_id: assigned_officer, status: 'Active', role: 'Police' });
      if (!assignedOfficer) {
        return res.status(404).json({ error: 'Invalid or inactive assigned officer' });
      }
  
      // Generate FIR ID
      const lastFIR = await FIR.findOne().sort({ fir_id: -1 });
      const fir_id = lastFIR ? lastFIR.fir_id + 1 : 1;
  
      // Create FIR object
      const newFIR = new FIR({
        fir_id,
        complaint: complaintDoc ? complaintDoc._id : null,
        description: description || complaintDoc?.description,
        citizen: citizenId || null, // Store Citizen._id
        sections: sectionDocs.map((doc) => doc._id),
        user: assignedOfficer._id,
        status,
        evidence,
      });
  
      const savedFIR = await newFIR.save();
  
      // Populate response
      const populatedFIR = await FIR.findById(savedFIR._id)
        .populate('complaint')
        .populate('sections')
        .populate('user', '-password')
        .populate('citizen'); // Populate citizen for full details
  
      res.status(201).json({ message: 'FIR created successfully', fir: populatedFIR });
    } catch (error) {
      console.error('Error creating FIR:', error);
      res.status(500).json({ error: 'Failed to create FIR' });
    }
  });
  
  // List all FIRs (excluding Closed)
  app.get('/firs', auth, isPolice, async (req, res) => {
    try {
      const firs = await FIR.find({ status: { $ne: 'Closed' } })
        .populate('complaint')
        .populate('sections')
        .populate('user')
        .populate({ path: 'citizen', model: 'Citizen' }); // Explicitly specify model  
        // console.log("Populated FIRs:", firs.map(fir => ({ fir_id: fir.fir_id, citizen: fir.citizen })));
        res.status(200).json(firs);
    } catch (error) {
      console.error('Error fetching FIRs:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get a specific FIR by FIR ID
  app.get('/firs/:firId', auth, isPolice, async (req, res) => {
    try {
      const firId = parseInt(req.params.firId);
      const fir = await FIR.findOne({ fir_id: firId, status: { $ne: 'Closed' } })
        .populate('complaint')
        .populate('sections')
        .populate('user', 'name contact')
        .populate('citizen');
  
      if (!fir) return res.status(404).json({ error: 'FIR not found' });
  
      res.status(200).json(fir);
    } catch (error) {
      console.error('Error fetching FIR:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Update an FIR
  app.put('/firs/:firId', auth, isPolice, async (req, res) => {
    try {
      const firId = parseInt(req.params.firId);
      const { description, sections, assigned_officer, status, evidence, citizen } = req.body;
  
      const existingFir = await FIR.findOne({ fir_id: firId });
      if (!existingFir) {
        return res.status(404).json({ error: 'FIR not found' });
      }
  
      if (existingFir.status === 'Closed') {
        return res.status(400).json({ error: 'Cannot update a closed FIR' });
      }
  
      const updateData = {};
  
      if (description) updateData.description = description;
      if (evidence) updateData.evidence = evidence;
  
      // Update sections
      if (sections) {
        if (!Array.isArray(sections)) {
          return res.status(400).json({ error: 'Sections must be an array' });
        }
        const sectionDocs = await IPCSection.find({ section: { $in: sections } });
        if (sectionDocs.length !== sections.length) {
          return res.status(404).json({ error: 'One or more sections not found' });
        }
        updateData.sections = sectionDocs.map((doc) => doc._id);
      }
  
      // Update assigned officer
      if (assigned_officer) {
        const userDoc = await User.findOne({ user_id: assigned_officer, status: 'Active', role: 'Police' });
        if (!userDoc) {
          return res.status(404).json({ error: 'Assigned officer not found' });
        }
        updateData.user = userDoc._id;
      }
  
      // Update status
      if (status) {
        if (!['Open', 'In Progress', 'Closed'].includes(status)) {
          return res.status(400).json({ error: 'Invalid status' });
        }
        updateData.status = status;
      }
  
      // Update citizen if provided
      if (citizen) {
        const citizenDoc = await Citizen.findOne(
          mongoose.Types.ObjectId.isValid(citizen) ? { _id: citizen } : { contact: citizen }
        );
        if (!citizenDoc) {
          return res.status(404).json({ error: 'Citizen not found' });
        }
        updateData.citizen = citizenDoc._id;
      }
  
      const updatedFir = await FIR.findOneAndUpdate(
        { fir_id: firId },
        updateData,
        { new: true, runValidators: true }
      )
        .populate('complaint')
        .populate('sections')
        .populate('user', '-password')
        .populate('citizen');
  
      res.status(200).json({ message: 'FIR updated successfully', fir: updatedFir });
    } catch (error) {
      console.error('Error updating FIR:', error);
      res.status(500).json({ error: 'Failed to update FIR' });
    }
  });
  
  // Soft Delete FIR (Change status to Closed)
  app.delete('/firs/:firId', auth, isPolice, async (req, res) => {
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
      console.error('Error deleting FIR:', error);
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