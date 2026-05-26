import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    consumer: { type: mongoose.Schema.Types.ObjectId, ref: 'Consumer', required: true },
    complaintId: { type: String, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['power_outage', 'voltage_issue', 'billing_issue', 'meter_issue', 'wire_fault', 'transformer_fault', 'other'],
      required: true,
    },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'in_progress', 'resolved', 'closed'],
      default: 'pending',
    },
    images: [{ type: String }],
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    expectedResolutionTime: { type: Date },
    resolutionNotes: { type: String, trim: true },
    comments: [{
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    }],
  },
  { timestamps: true }
);

complaintSchema.pre('save', async function (next) {
  if (!this.complaintId) {
    const count = await mongoose.model('Complaint').countDocuments();
    this.complaintId = `CMP-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

export default mongoose.model('Complaint', complaintSchema);
