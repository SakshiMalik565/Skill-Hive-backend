const mongoose = require('mongoose');

const swapSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requester is required'],
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Receiver is required'],
    },
    skillOffered: {
      type: String,
      required: [true, 'Skill offered is required'],
      trim: true,
    },
    skillRequested: {
      type: String,
      required: [true, 'Skill requested is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed'],
      default: 'pending',
    },
    scheduledDate: {
      type: Date,
      default: null,
    },
    feedback: {
      type: String,
      default: '',
      maxlength: [1000, 'Feedback cannot exceed 1000 characters'],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

swapSchema.index({ requester: 1, receiver: 1 });
swapSchema.index({ status: 1 });

module.exports = mongoose.model('Swap', swapSchema);
