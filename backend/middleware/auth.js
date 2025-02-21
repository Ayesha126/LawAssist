const jwt = require('jsonwebtoken');
const JWT_SECRET = 'Shhh'; // In production, use environment variable

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

const isPolice = (req, res, next) => {
    if (!['Admin', 'Police'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Police access required' });
    }
    next();
};

module.exports = { auth, isAdmin, isPolice };