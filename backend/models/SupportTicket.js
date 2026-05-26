import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema(
  {
    consumer: { type: mongoose.Schema.Types.ObjectId, ref: 'Consumer', required: true },
    ticketId: { type: String, unique: true, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['billing', 'technical', 'account', 'payment', 'general'],
      default: 'general',
    },
    status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    responses: [{
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      authorName: { type: String },
      message: { type: String, required: true },
      isStaff: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
    }],
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

supportTicketSchema.pre('save', async function (next) {
  if (!this.ticketId) {
    const count = await mongoose.model('SupportTicket').countDocuments();
    this.ticketId = `TKT-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

export default mongoose.model('SupportTicket', supportTicketSchema);
