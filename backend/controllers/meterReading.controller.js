import MeterReading from '../models/MeterReading.js';
import Consumer from '../models/Consumer.js';

// @desc    Add a meter reading
// @route   POST /api/meter-readings
// @access  Private/Admin|Employee
export const addReading = async (req, res, next) => {
  try {
    const { consumerId, previousReading, currentReading, readingDate, month, year, notes } = req.body;

    const consumer = await Consumer.findById(consumerId);
    if (!consumer) {
      return res.status(404).json({ success: false, message: 'Consumer not found' });
    }

    if (currentReading < previousReading) {
      return res.status(400).json({ success: false, message: 'Current reading cannot be less than previous reading' });
    }

    // Check for duplicate reading for same consumer/month/year
    const existing = await MeterReading.findOne({ consumer: consumerId, month, year });
    if (existing) {
      return res.status(400).json({ success: false, message: `Reading for ${month}/${year} already exists for this consumer` });
    }

    const reading = await MeterReading.create({
      consumer: consumerId,
      meterNumber: consumer.meterNumber,
      previousReading,
      currentReading,
      readingDate: readingDate || Date.now(),
      month,
      year,
      recordedBy: req.user._id,
      notes,
    });

    res.status(201).json({ success: true, data: reading });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all readings (filterable)
// @route   GET /api/meter-readings
// @access  Private/Admin|Employee
export const getReadings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.consumer) filter.consumer = req.query.consumer;
    if (req.query.month) filter.month = parseInt(req.query.month, 10);
    if (req.query.year) filter.year = parseInt(req.query.year, 10);
    if (req.query.meterNumber) filter.meterNumber = req.query.meterNumber;

    const [readings, total] = await Promise.all([
      MeterReading.find(filter)
        .populate('consumer', 'fullName meterNumber')
        .populate('recordedBy', 'name')
        .skip(skip)
        .limit(limit)
        .sort({ readingDate: -1 }),
      MeterReading.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: readings.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: readings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get readings for a specific consumer
// @route   GET /api/meter-readings/consumer/:consumerId
// @access  Private
export const getConsumerReadings = async (req, res, next) => {
  try {
    const filter = { consumer: req.params.consumerId };
    if (req.query.month) filter.month = parseInt(req.query.month, 10);
    if (req.query.year) filter.year = parseInt(req.query.year, 10);

    const readings = await MeterReading.find(filter)
      .populate('recordedBy', 'name')
      .sort({ year: -1, month: -1 });

    res.status(200).json({ success: true, count: readings.length, data: readings });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a meter reading
// @route   PUT /api/meter-readings/:id
// @access  Private/Admin|Employee
export const updateReading = async (req, res, next) => {
  try {
    const { previousReading, currentReading, readingDate, notes } = req.body;

    const reading = await MeterReading.findById(req.params.id);
    if (!reading) {
      return res.status(404).json({ success: false, message: 'Reading not found' });
    }

    if (previousReading !== undefined) reading.previousReading = previousReading;
    if (currentReading !== undefined) reading.currentReading = currentReading;
    if (readingDate !== undefined) reading.readingDate = readingDate;
    if (notes !== undefined) reading.notes = notes;

    await reading.save(); // triggers pre-save to recalculate unitsConsumed

    res.status(200).json({ success: true, data: reading });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reading history for a consumer (sorted chronologically)
// @route   GET /api/meter-readings/history/:consumerId
// @access  Private
export const getReadingHistory = async (req, res, next) => {
  try {
    const readings = await MeterReading.find({ consumer: req.params.consumerId })
      .sort({ year: 1, month: 1 })
      .populate('recordedBy', 'name');

    res.status(200).json({ success: true, count: readings.length, data: readings });
  } catch (error) {
    next(error);
  }
};
