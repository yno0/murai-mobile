import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserInfo from '../models/userInfoModel.js';
import User from '../models/userModel.js';

// Placeholder for sending OTP email
async function sendOtpEmail(email, otp) {
    // Implement actual email sending logic here
    console.log(`Send OTP ${otp} to email: ${email}`);
}

// Generate a 6-digit OTP
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (!user.password) {
            return res.status(400).json({ message: 'User has no password set. Please register again or use a different login method.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
        return res.status(200).json({ token, user: { email: user.email, role: user.role, name: user.name } });
    } catch (err) {
        console.error('login error: ', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Step 1: Register with name, email, password, confirmPassword, send OTP
const registerStep1 = async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;
    try {
        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const otp = generateOtp();
        const user = new User({ name, email, password: hashedPassword, otp, isVerified: false });
        await user.save();
        await sendOtpEmail(email, otp);
        return res.status(201).json({ message: 'OTP sent to email. Please verify.' });
    } catch (err) {
        console.error('register step 1 error: ', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Step 2: Verify OTP
const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
        user.isVerified = true;
        user.otp = undefined;
        await user.save();
        return res.status(200).json({ message: 'OTP verified. You can now complete your profile.' });
    } catch (err) {
        console.error('verify otp error: ', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Step 3: Complete user info after OTP verification
const completeProfile = async (req, res) => {
    const { email, name, phoneNumber } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !user.isVerified) {
            return res.status(400).json({ message: 'User not verified or not found' });
        }
        user.name = name;
        await user.save();
        const userInfo = new UserInfo({
            userId: user._id,
            phoneNumber
        });
        await userInfo.save();
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
        return res.status(200).json({ token });
    } catch (err) {
        console.error('complete profile error: ', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Google OAuth: Find or create user
export async function findOrCreateGoogleUser(profile) {
    let user = await User.findOne({ email: profile.emails[0].value });
    if (!user) {
        // Try to get first and last name from profile
        let firstName = '';
        let lastName = '';
        if (profile.name) {
            firstName = profile.name.givenName || '';
            lastName = profile.name.familyName || '';
        } else if (profile.displayName) {
            const nameParts = profile.displayName.split(' ');
            firstName = nameParts[0] || '';
            lastName = nameParts.slice(1).join(' ') || '';
        }
        user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            isVerified: true,
            firstName,
            lastName
        });
        console.log('Created new Google user:', user);
    } else {
        console.log('Found existing user:', user);
    }
    return user;
}

export { completeProfile, login, registerStep1, verifyOtp };
