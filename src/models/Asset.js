const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    skillOffered: {
      type: String,
      required: [true, 'Skill offered is required'],
      trim: true,
      maxlength: [100, 'Skill offered cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    backgroundPhoto: {
      type: String,
      default: '',
    },
    photos: {
      type: [String],
      default: [],
    },
    videos: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

assetSchema.index({ skillOffered: 'text', description: 'text' });
assetSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Asset', assetSchema);
