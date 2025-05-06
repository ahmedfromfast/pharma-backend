const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendVerificationEmail = require('../utils/senverificationemail');
const sendResetEmail = require('../utils/senrestmail');
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const verificationCode = Math.floor(1000 + Math.random() * 9000).toString(); // 4 digit code
        const verificationCodeExpires = new Date(Date.now() + 60 * 1000); // 60 seconds from now

        const user = new User({
            name,
            email,
            password,
            role,
            verificationCode,
            verificationCodeExpires
        });
        await user.save();
        await sendVerificationEmail(email, verificationCode); // Send verification email

        res.status(201).json({ message: 'User registered successfully. Please verify your email.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        // if (!user.isVerified) {
        //     return res.status(400).json({ message: 'Please verify your email before logging in' });
        // }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        const token = jwt.sign({ id: user._id, name: user.name, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.status(200).json({
            message: 'Login successful', token,
            userId: user._id,
            role: user.role,
            isVerified: user.isVerified
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.verifyEmail = async (req, res) => {
    try {
        const { email, verificationCode } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        if (user.isVerified) {
            return res.status(400).json({ message: 'Email already verified' });
        }
        console.log(verificationCode)
        console.log(user.verificationCode)
        if (user.verificationCode !== verificationCode) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }
        if (user.verificationCodeExpires < Date.now()) {
            return res.status(400).json({ message: 'Verification code expired' });
        }

        user.isVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}
exports.resendVerificationCode = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        if (user.isVerified) {
            return res.status(400).json({ message: 'Email already verified' });
        }
        const verificationCode = Math.floor(1000 + Math.random() * 9000).toString(); // 4 digit code
        user.verificationCode = verificationCode;
        user.verificationCodeExpires = Date.now() + 60 * 1000; // 60 seconds from now
        await user.save();
        await sendVerificationEmail(email, verificationCode); // Send verification email
        res.status(200).json({ message: 'Verification code resent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const resetCode = Math.floor(1000 + Math.random() * 9000).toString(); // 4 digit code
        user.resetCode = resetCode;
        user.resetCodeExpires = Date.now() + 60 * 1000; // 60 seconds from now
        await user.save();
        const message = `Your password reset code is: ${resetCode}`;
        await sendResetEmail(email, 'Password Reset', message); // Send reset email
        res.status(200).json({ message: 'Reset link sent to your email' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.resetPassword = async (req, res) => {
    try {
        const { resetCode, newPassword } = req.body;
        const user = await User.findOne({ resetCode });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        if (user.resetCodeExpires < Date.now()) {
            return res.status(400).json({ message: 'Reset code has expired' });
        }
        user.password = newPassword;
        user.resetCode = undefined;  // Clear the reset code after successful use
        user.resetCodeExpires = undefined;  // Clear the expiration time
        await user.save();
        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = req.user; // Assuming you have middleware to get the user ID from the token

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Old password is incorrect' });
        }
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.status(200).json({ message: 'Password changed successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.verifyResetCde = async (req, res) => {
    try {
        const { email, resetCode } = req.body;
        console.log(resetCode)
        const user = await User.findOne({ resetCode });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        if (user.resetCodeExpires < Date.now()) {
            return res.status(400).json({ message: 'Reset code has expired' });
        }
        res.status(200).json({ message: 'Reset Code Verified successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ isVerified: true });
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch all orders' });
    }
};