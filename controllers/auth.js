const User = require('../models/userSchema');


const sendTokenResponse = (user, statusCode, res) => {  
    const token = user.getSignedJwtToken();

    const options = {
        httpOnly: true,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 
    };

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token,
    });
};

register = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const user = await User.create({
            name,
            email,
            password,
            role,
        });

        sendTokenResponse(user, 201, res);
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
} ;

login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Please provide an email and password' });
    }

    try {
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        sendTokenResponse(user, 200, res);
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

const getMe = async (req, res) => {
    try {
        // req.user is set by your authenticateUser middleware
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.status(200).json({
            success: true,
            name: user.name,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// 2. Update module.exports to include getMe
module.exports = { register, login, getMe };