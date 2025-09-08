const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, required: true },  // e.g., first day of month or day for daily stats
  mealsSaved: { type: Number, default: 0 },
  co2ReducedKg: { type: Number, default: 0 },
  activeDonationsCount: { type: Number, default: 0 },
  communityImpactPercent: { type: Number, default: 0 },

  donationStatus: {                  // Store counts by status for pie chart
    pending: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    cancelled: { type: Number, default: 0 }
  },

  foodCategoryCounts: [{             // For chart and list display
    category: String,
    count: Number
  }],

  topDonors: [{                      // For leaderboard UI
    donorName: String,
    tokens: Number
  }],

  createdAt: { type: Date, default: Date.now }
});

const analytic = mongoose.model('Analytics', analyticsSchema);
module.exports = analytic;

