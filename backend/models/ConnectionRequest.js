import mongoose from 'mongoose';

const connectionRequestSchema = new mongoose.Schema(
  {
    consumer: { type: mongoose.Schema.Types.ObjectId, ref: 'Consumer' },
    requestId: { type: String, unique: true, trim: true },
    requestType: {
      type: String,
      enum: ['new_connection', 'load_increase', 'load_decrease', 'meter_replacement', 'ownership_transfer', 'disconnection'],
      required: true,
    },
    applicantName: { type: String, required: true, trim: true },
    cnic: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    connectionType: { type: String, enum: ['residential', 'commercial', 'industrial'], default: 'residential' },
    requestedLoad: { type: Number },
    documents: [{ type: String }],
    status: {
      type: String,
      enum: ['submitted', 'under_review', 'approved', 'rejected', 'inspection_scheduled', 'completed'],
      default: 'submitted',
    },
    notes: { type: String, trim: true },
    inspectionDate: { type: Date },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

connectionRequestSchema.pre('save', async function (next) {
  if (!this.requestId) {
    const count = await mongoose.model('ConnectionRequest').countDocuments();
    this.requestId = `REQ-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

export default mongoose.model('ConnectionRequest', connectionRequestSchema);
