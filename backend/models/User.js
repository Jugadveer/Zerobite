const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },       // Full name
  email: { type: String, required: true, unique: true },  // Email used for login, unique
  password: { type: String, required: true },   // Hashed password
  role: { type: String, default: "user" },      // Optional user role
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
