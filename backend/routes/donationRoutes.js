const express = require('express');
const path = require('path');
const multer = require('multer');
const Donation = require('../models/Donation');

const router = express.Router();

// Multer setup to store files in public/uploads with unique names
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join('public', 'uploads')),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});

const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } }); // 2MB limit

// Middleware to check if user is logged in (assuming session-based)
function requireLogin(req, res, next) {
  if (req.session && req.session.user) return next();
  res.status(401).send('Please log in to donate');
}

// POST /zerobite/donate route to receive form data and files
router.post('/zerobite/donate', requireLogin, upload.fields([
  { name: 'foodImage', maxCount: 1 },
  { name: 'packagingImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      phone,
      email,
      itemName,
      category,
      quantity,
      unit,
      pickupAddress,
      date,
      time,
      notes
    } = req.body;

    if (!req.files.foodImage) {
      return res.status(400).send('Food image required');
    }

    const foodImage = '/uploads/' + req.files.foodImage[0].filename;
    const packagingImage = req.files.packagingImage ? '/uploads/' + req.files.packagingImage[0].filename : undefined;

    const newDonation = new Donation({
      donor: req.session.user.id,
      phone,
      email,
      itemName,
      foodType: category,
      quantity: parseInt(quantity),
      unit,
      pickupLocation: pickupAddress,
      dateAvailable: new Date(date),
      timeAvailable: time,
      foodImage,
      packagingImage,
      notes,
      status: 'pending'
    });

    await newDonation.save();
    console.log(newDonation);
    console.log("Your donation has been recorded:");
    res.redirect('/zerobite/donations');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error processing donation');
  }
});

module.exports = router;
