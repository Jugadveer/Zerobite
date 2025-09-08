const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  phone: { type: String, required: true },
  email: { type: String, required: true },
  itemName: { type: String, required: true },
  foodType: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  pickupLocation: { type: String, required: true },
  dateAvailable: { type: Date, required: true },
  timeAvailable: { type: String, required: true },  // store time as string "HH:mm"
  foodImage: { type: String, required: true },      // Store as URL or path
  packagingImage: { type: String },                  // optional
  notes: { type: String },
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

const Donation = mongoose.model('Donation', donationSchema);
module.exports = Donation;
