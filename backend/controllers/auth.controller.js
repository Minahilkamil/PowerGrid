import crypto from 'crypto';
import User from '../models/User.js';
import Consumer from '../models/Consumer.js';

// Helper: send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
  });
};

// @desc    Register a new user (and consumer record if role=consumer)
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { 
      name, email, password, role, 
      fullName, cnic, phone, address, area, 
      meterNumber, connectionType 
    } = req.body;

    // Admin registration is not allowed publicly
    if (role === 'admin') {
      return res.status(403).json({ success: false, message: 'Admin registration is not allowed' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const finalRole = role || 'consumer';

    // Employee accounts start as pending approval, inactive
    const isEmployee = finalRole === 'employee';
    
    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: finalRole,
      isActive: !isEmployee,           // employees inactive until approved
      approvalStatus: isEmployee ? 'pending' : 'approved',
    });

    // If registering as consumer, create consumer record
    if (finalRole === 'consumer') {
      // Basic validation
      if (!cnic || !meterNumber || !phone || !address || !area) {
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({ 
          success: false, 
          message: 'All fields (CNIC, Meter Number, Phone, Area, Address) are required for consumer registration' 
        });
      }

      try {
        await Consumer.create({
          user: user._id,
          fullName: fullName || name,
          cnic,
          email,
          phone,
          address,
          area,
          meterNumber,
          connectionType: connectionType || 'residential',
        });
      } catch (err) {
        // Rollback user creation if consumer profile fails
        await User.findByIdAndDelete(user._id);
        
        // Provide cleaner error messages for common validation issues
        if (err.name === 'ValidationError') {
          const message = Object.values(err.errors).map(val => val.message).join(', ');
          return res.status(400).json({ success: false, message });
        }
        if (err.code === 11000) {
          const field = Object.keys(err.keyPattern)[0];
          return res.status(400).json({ success: false, message: `This ${field} is already registered` });
        }
        throw err;
      }
      return sendTokenResponse(user, 201, res);
    }

    // Employee — return pending message, no token
    if (isEmployee) {
      return res.status(201).json({
        success: true,
        pending: true,
        message: 'Application submitted! Your account is pending administrator approval. You will be notified once approved.',
      });
    }

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      // Give specific message for pending employees
      if (user.approvalStatus === 'pending') {
        return res.status(401).json({ success: false, message: 'Your account is pending administrator approval. Please wait.' });
      }
      if (user.approvalStatus === 'rejected') {
        return res.status(401).json({ success: false, message: 'Your account application was rejected. Contact admin.' });
      }
      return res.status(401).json({ success: false, message: 'Account is deactivated. Contact admin.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let consumerProfile = null;

    if (user.role === 'consumer') {
      consumerProfile = await Consumer.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      data: { user, consumerProfile },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password — generate reset token
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user found with that email' });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // In production you'd email this token. For dev, return it directly.
    res.status(200).json({
      success: true,
      message: 'Reset token generated (dev mode — token returned in response)',
      resetToken,
      resetUrl: `/api/auth/reset-password/${resetToken}`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile (name, email)
// @route   PUT /api/auth/update-profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};
