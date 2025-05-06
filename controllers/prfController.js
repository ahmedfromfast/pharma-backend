const User = require('../models/user');

// Get profile by user ID (e.g., from token or route)
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming you're using auth middleware that adds `req.user`
    const user = await User.findById(userId).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profileUpdates = req.body.profile;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.profile = {
      ...user.profile,
      ...profileUpdates,
      address: {
        ...user.profile.address,
        ...profileUpdates.address,
      },
      professional: {
        ...user.profile.professional,
        ...profileUpdates.professional,
      }
    };

    await user.save();
    res.json({ message: 'Profile updated', profile: user.profile });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete profile (or clear profile fields)
exports.deleteProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.profile = {};
    await user.save();

    res.json({ message: 'Profile deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
exports.uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    const filename = req.file.filename;

    await User.findByIdAndUpdate(userId, {
      'profile.avatar': filename
    });

    res.status(200).json({
      message: 'Avatar uploaded successfully',
      filename: filename,
      imageUrl: `/api/profile/avatars/${filename}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
};
exports.getUserAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('profile.address');

    if (!user || !user.profile?.address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    res.status(200).json({ address: user.profile.address });
  } catch (err) {
    console.error('Error fetching address:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.updateUserAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const newAddress = req.body.address;

    const user = await User.findByIdAndUpdate(
      userId,
      { 'profile.address': newAddress },
      { new: true }
    );

    res.status(200).json({ message: 'Address updated', address: user.profile.address });
  } catch (err) {
    console.error('Error updating address:', err);
    res.status(500).json({ message: 'Failed to update address' });
  }
};