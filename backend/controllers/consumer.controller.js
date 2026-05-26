import User from '../models/User.js';
import Consumer from '../models/Consumer.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// @desc    Add a new consumer (creates User + Consumer)
// @route   POST /api/consumers
// @access  Private/Admin|Employee
export const addConsumer = async (req, res, next) => {
  try {
    const {
      fullName, cnic, email, phone, address, area,
      meterNumber, connectionType, installationDate,
    } = req.body;

    // Check for duplicate email / cnic / meterNumber
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }
    const existingConsumer = await Consumer.findOne({ $or: [{ cnic }, { meterNumber }] });
    if (existingConsumer) {
      return res.status(400).json({ success: false, message: 'CNIC or meter number already registered' });
    }

    // Create user — default password is the CNIC
    const user = await User.create({
      name: fullName,
      email,
      password: cnic.replace(/-/g, ''), // strip dashes for password
      role: 'consumer',
    });

    const consumer = await Consumer.create({
      user: user._id,
      fullName,
      cnic,
      email,
      phone,
      address,
      area,
      meterNumber,
      connectionType: connectionType || 'residential',
      installationDate: installationDate || Date.now(),
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Consumer added successfully',
      data: consumer,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all consumers (paginated + searchable)
// @route   GET /api/consumers
// @access  Private/Admin|Employee
export const getConsumers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.connectionType) filter.connectionType = req.query.connectionType;

    if (req.query.search) {
      const regex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { fullName: regex },
        { cnic: regex },
        { meterNumber: regex },
        { email: regex },
      ];
    }

    const [consumers, total] = await Promise.all([
      Consumer.find(filter)
        .populate('user', 'name email isActive')
        .populate('createdBy', 'name')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Consumer.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: consumers.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: consumers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single consumer
// @route   GET /api/consumers/:id
// @access  Private/Admin|Employee
export const getConsumer = async (req, res, next) => {
  try {
    const consumer = await Consumer.findById(req.params.id)
      .populate('user', 'name email isActive createdAt')
      .populate('createdBy', 'name email');

    if (!consumer) {
      return res.status(404).json({ success: false, message: 'Consumer not found' });
    }

    // Sync User isActive status if status is changed
    if (updates.status) {
      await User.findByIdAndUpdate(consumer.user, { 
        isActive: updates.status === 'active' 
      });
    }

    res.status(200).json({ success: true, data: consumer });
  } catch (error) {
    next(error);
  }
};

// @desc    Update consumer avatar
// @route   PUT /api/consumers/profile/me/avatar
// @access  Private/Consumer
export const updateConsumerAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image' });
    }

    const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                                  process.env.CLOUDINARY_API_KEY && 
                                  process.env.CLOUDINARY_API_SECRET;

    if (isCloudinaryConfigured) {
      // Upload to Cloudinary using buffer
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'electricity_mgmt/avatars' },
        async (error, result) => {
          if (error) {
            return res.status(500).json({ success: false, message: 'Cloudinary upload failed', error });
          }

          const consumer = await Consumer.findOneAndUpdate(
            { user: req.user._id },
            { profileImage: result.secure_url },
            { new: true }
          ).populate('user', 'name email');

          if (!consumer) {
            return res.status(404).json({ success: false, message: 'Consumer profile not found' });
          }

          res.status(200).json({ success: true, data: consumer });
        }
      );
      uploadStream.end(req.file.buffer);
    } else {
      // Fallback to local storage
      const fileName = `avatar-${req.user._id}-${Date.now()}${path.extname(req.file.originalname)}`;
      const filePath = path.join('uploads', 'avatars', fileName);
      const fullPath = path.join(process.cwd(), filePath);

      // Ensure directory exists
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(fullPath, req.file.buffer);

      // Save relative path to DB
      const imageUrl = `/uploads/avatars/${fileName}`;
      const consumer = await Consumer.findOneAndUpdate(
        { user: req.user._id },
        { profileImage: imageUrl },
        { new: true }
      ).populate('user', 'name email');

      if (!consumer) {
        return res.status(404).json({ success: false, message: 'Consumer profile not found' });
      }

      res.status(200).json({ 
        success: true, 
        message: 'Avatar uploaded locally (Cloudinary not configured)', 
        data: consumer 
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update own consumer profile
// @route   PUT /api/consumers/profile/me
// @access  Private/Consumer
export const updateConsumerProfile = async (req, res, next) => {
  try {
    const allowedFields = ['fullName', 'phone', 'address', 'area', 'profileImage'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const consumer = await Consumer.findOneAndUpdate(
      { user: req.user._id },
      updates,
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    if (!consumer) {
      return res.status(404).json({ success: false, message: 'Consumer profile not found' });
    }

    res.status(200).json({ success: true, data: consumer });
  } catch (error) {
    next(error);
  }
};

// @desc    Update consumer
// @route   PUT /api/consumers/:id
// @access  Private/Admin|Employee
export const updateConsumer = async (req, res, next) => {
  try {
    const allowedFields = ['fullName', 'phone', 'address', 'area', 'connectionType', 'status', 'installationDate'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const consumer = await Consumer.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate('user', 'name email');

    if (!consumer) {
      return res.status(404).json({ success: false, message: 'Consumer not found' });
    }

    res.status(200).json({ success: true, data: consumer });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft-delete consumer (set status=inactive)
// @route   DELETE /api/consumers/:id
// @access  Private/Admin
export const deleteConsumer = async (req, res, next) => {
  try {
    const consumer = await Consumer.findByIdAndUpdate(
      req.params.id,
      { status: 'inactive' },
      { new: true }
    );

    if (!consumer) {
      return res.status(404).json({ success: false, message: 'Consumer not found' });
    }

    // Also deactivate the linked user account
    await User.findByIdAndUpdate(consumer.user, { isActive: false });

    res.status(200).json({ success: true, message: 'Consumer deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get own consumer profile (for consumer role)
// @route   GET /api/consumers/profile/me
// @access  Private/Consumer
export const getConsumerProfile = async (req, res, next) => {
  try {
    const consumer = await Consumer.findOne({ user: req.user._id }).populate('user', 'name email createdAt');

    if (!consumer) {
      return res.status(404).json({ success: false, message: 'Consumer profile not found' });
    }

    res.status(200).json({ success: true, data: consumer });
  } catch (error) {
    next(error);
  }
};
