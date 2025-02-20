const express = require('express');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 8000;
const DATA_FILE = './LawAssistData.json';

// Middleware
app.use(express.json());
app.use(cors());

// Load JSON Data
let lawAssistData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));

// Utility function to save data
const saveData = (data, res) => {
    fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to save data' });
        }
    });
};

// ===================== USER ROUTES =====================

// 1. Add a new User - POST /users
app.post('/users', (req, res) => {
    const { name, contact, role, email, password } = req.body;

    if (!name || !contact || !role || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const userId = lawAssistData.users.length + 1;
    const newUser = { userId, name, contact, role, email, password };

    lawAssistData.users.push(newUser);
    saveData(lawAssistData, res);
    return res.status(201).json({ message: 'User added successfully', user: newUser });
});

// 2. List all Users - GET /users
app.get('/users', (req, res) => {
    return res.status(200).json(lawAssistData.users);
});

// 3. Get a specific User - GET /users/:userId
app.get('/users/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);
    const user = lawAssistData.users.find((u) => u.userId === userId);

    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.status(200).json(user);
});

app.delete('/users/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const index = lawAssistData.users.findIndex((u) => u.userId === userId);

  if (index === -1) return res.status(404).json({ error: 'User not found' });

  lawAssistData.users.splice(index, 1);
  saveData(lawAssistData, res);
  return res.status(200).json({ message: 'User deleted successfully' });
});

// ===================== COMPLAINT ROUTES =====================

// 4. Add a new Complaint - POST /complaints
app.post('/complaints', (req, res) => {
  const { description, filed_by, user } = req.body;

  if (!description || !filed_by || !user) {
      return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check if the user exists
  const existingUser = lawAssistData.users.find((u) => u.userId === user);
  if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
  }

  const complaintId = lawAssistData.complaints.length + 1;
  const newComplaint = { 
      complaintId, 
      description, 
      filed_by, 
      user, 
      date_filed: new Date() 
  };

  lawAssistData.complaints.push(newComplaint);
  saveData(lawAssistData, res);
  
  return res.status(201).json({ message: 'Complaint added successfully', complaint: newComplaint });
});


// 5. List all Complaints - GET /complaints
app.get('/complaints', (req, res) => {
    return res.status(200).json(lawAssistData.complaints);
});

// 6. Get a specific Complaint - GET /complaints/:complaintId
app.get('/complaints/:complaintId', (req, res) => {
    const complaintId = parseInt(req.params.complaintId);
    const complaint = lawAssistData.complaints.find((c) => c.complaintId === complaintId);

    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    return res.status(200).json(complaint);
});
app.delete('/complaints/:complaintId', (req, res) => {
  const complaintId = parseInt(req.params.complaintId);
  const index = lawAssistData.complaints.findIndex((c) => c.complaintId === complaintId);

  if (index === -1) return res.status(404).json({ error: 'Complaint not found' });

  lawAssistData.complaints.splice(index, 1);
  saveData(lawAssistData, res);
  return res.status(200).json({ message: 'Complaint deleted successfully' });
});
// ===================== FIR ROUTES =====================

// 7. Add a new FIR - POST /firs
app.post('/firs', (req, res) => {
  const { complaint, sections, user, status } = req.body;

  if (!complaint || !sections || !user || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check if the complaint exists
  const existingComplaint = lawAssistData.complaints.find((c) => c.complaintId === complaint);
  if (!existingComplaint) {
      return res.status(404).json({ error: 'Complaint not found' });
  }

  // Check if the user exists
  const existingUser = lawAssistData.users.find((u) => u.userId === user);
  if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
  }

  // Ensure sections is an array
  if (!Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({ error: 'Sections must be a non-empty array' });
  }

  // Check if all provided section IDs exist
  const invalidSections = sections.filter(sec => !lawAssistData.ipcSections.find(s => s.section === sec));
  if (invalidSections.length > 0) {
      return res.status(404).json({ error: `Sections not found: ${invalidSections.join(', ')}` });
  }

  // Generate new FIR ID
  const firId = lawAssistData.firs.length + 1;
  const newFIR = { firId, complaint, sections, user, status };

  lawAssistData.firs.push(newFIR);
  saveData(lawAssistData, res);
  
  return res.status(201).json({ message: 'FIR added successfully', fir: newFIR });
});




// 8. List all FIRs - GET /firs
app.get('/firs', (req, res) => {
    return res.status(200).json(lawAssistData.firs);
});

// 9. Get a specific FIR - GET /firs/:firId
app.get('/firs/:firId', (req, res) => {
    const firId = parseInt(req.params.firId);
    const fir = lawAssistData.firs.find((f) => f.firId === firId);

    if (!fir) return res.status(404).json({ error: 'FIR not found' });

    return res.status(200).json(fir);
});
app.delete('/firs/:firId', (req, res) => {
  const firId = parseInt(req.params.firId);
  const index = lawAssistData.firs.findIndex((f) => f.firId === firId);

  if (index === -1) return res.status(404).json({ error: 'FIR not found' });

  lawAssistData.firs.splice(index, 1);
  saveData(lawAssistData, res);
  return res.status(200).json({ message: 'FIR deleted successfully' });
});
// ===================== IPC SECTION ROUTES =====================

// 10. Add a new IPC Section - POST /ipc-sections
app.post('/sections', (req, res) => {
  const { section, description, offense, punishment, cognizable, bailable, court } = req.body;

  if (!section || !description || !offense || !punishment || !cognizable || !bailable || !court) {
      return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check if section already exists
  const existingSection = lawAssistData.ipcSections.find(s => s.section === section);
  if (existingSection) {
      return res.status(400).json({ error: 'Section already exists' });
  }

  // Create new IPC Section
  const newSection = { section, description, offense, punishment, cognizable, bailable, court };

  lawAssistData.ipcSections.push(newSection);
  saveData(lawAssistData, res);

  return res.status(201).json({ message: 'IPC Section added successfully', section: newSection });
});


// 11. List all IPC Sections - GET /ipc-sections
app.get('/ipc-sections', (req, res) => {
    return res.status(200).json(lawAssistData.ipcSections);
});

// 12. Get a specific IPC Section - GET /ipc-sections/:section
app.get('/ipc-sections/:section', (req, res) => {
    const section = req.params.section;
    const ipcSection = lawAssistData.ipcSections.find((s) => s.section === section);

    if (!ipcSection) return res.status(404).json({ error: 'IPC Section not found' });

    return res.status(200).json(ipcSection);
});
app.delete('/sections/:section', (req, res) => {
  const section = req.params.section;
  const index = lawAssistData.ipcSections.findIndex((s) => s.section === section);

  if (index === -1) return res.status(404).json({ error: 'IPC Section not found' });

  lawAssistData.ipcSections.splice(index, 1);
  saveData(lawAssistData, res);
  return res.status(200).json({ message: 'IPC Section deleted successfully' });
});
app.put('/users/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const userIndex = lawAssistData.users.findIndex((u) => u.userId === userId);

  if (userIndex === -1) return res.status(404).json({ error: 'User not found' });

  // Only update fields provided in the request
  lawAssistData.users[userIndex] = { 
      ...lawAssistData.users[userIndex], 
      ...req.body 
  };

  saveData(lawAssistData, res);
  return res.status(200).json({ message: 'User updated successfully', user: lawAssistData.users[userIndex] });
});

// ===================== COMPLAINT ROUTES =====================

// Update a Complaint - PUT /complaints/:complaintId
app.put('/complaints/:complaintId', (req, res) => {
  const complaintId = parseInt(req.params.complaintId);
  const complaintIndex = lawAssistData.complaints.findIndex((c) => c.complaintId === complaintId);

  if (complaintIndex === -1) return res.status(404).json({ error: 'Complaint not found' });

  // Only update fields provided in the request
  lawAssistData.complaints[complaintIndex] = { 
      ...lawAssistData.complaints[complaintIndex], 
      ...req.body 
  };

  saveData(lawAssistData, res);
  return res.status(200).json({ message: 'Complaint updated successfully', complaint: lawAssistData.complaints[complaintIndex] });
});

// ===================== FIR ROUTES =====================

// Update a FIR - PUT /firs/:firId
app.put('/firs/:firId', (req, res) => {
  const firId = parseInt(req.params.firId);
  const firIndex = lawAssistData.firs.findIndex((f) => f.firId === firId);

  if (firIndex === -1) return res.status(404).json({ error: 'FIR not found' });

  // Only update fields provided in the request
  lawAssistData.firs[firIndex] = { 
      ...lawAssistData.firs[firIndex], 
      ...req.body 
  };

  saveData(lawAssistData, res);
  return res.status(200).json({ message: 'FIR updated successfully', fir: lawAssistData.firs[firIndex] });
});

// ===================== IPC SECTION ROUTES =====================

// Update an IPC Section - PUT /sections/:section
app.put('/sections/:section', (req, res) => {
  const section = req.params.section;
  const sectionIndex = lawAssistData.ipcSections.findIndex((s) => s.section === section);

  if (sectionIndex === -1) return res.status(404).json({ error: 'IPC Section not found' });

  // Only update fields provided in the request
  lawAssistData.ipcSections[sectionIndex] = { 
      ...lawAssistData.ipcSections[sectionIndex], 
      ...req.body 
  };

  saveData(lawAssistData, res);
  return res.status(200).json({ message: 'IPC Section updated successfully', section: lawAssistData.ipcSections[sectionIndex] });
});

// ===================== ERROR HANDLING MIDDLEWARE =====================
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong! Please try again later.' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
