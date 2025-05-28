const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'analyst', 'reader'],
    default: 'analyst'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  preferences: {
    darkMode: {
      type: Boolean,
      default: false
    },
    favoriteGroups: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AttackGroup'
    }],
    favoriteCampaigns: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign'
    }],
    defaultVisualization: {
      type: String,
      enum: ['map', 'timeline', 'graph', 'table'],
      default: 'map'
    },
    notificationSettings: {
      newCampaigns: {
        type: Boolean,
        default: true
      },
      updatedTechniques: {
        type: Boolean,
        default: true
      },
      securityAlerts: {
        type: Boolean,
        default: true
      }
    }
  }
});

module.exports = mongoose.model('User', UserSchema);
