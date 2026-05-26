import mongoose from 'mongoose';

const loadSheddingSchema = new mongoose.Schema(
  {
    area: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    duration: { type: Number }, // hours
    type: { type: String, enum: ['scheduled', 'emergency', 'maintenance'], default: 'scheduled' },
    status: { type: String, enum: ['upcoming', 'active', 'completed', 'cancelled'], default: 'upcoming' },
    reason: { type: String, trim: true },
    affectedAreas: [{ type: String }],
    estimatedRestoration: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('LoadShedding', loadSheddingSchema);
