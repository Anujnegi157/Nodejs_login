// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');

router.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.status(201).send("User created successfully!");
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred while creating user.");
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).send("User not found.");
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).send("Invalid password.");
        }
        req.session.userId = user._id; // Set userId in session
        res.status(200).send("Login successful!");
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred while logging in.");
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            return res.status(500).send("An error occurred while logging out.");
        }
        res.clearCookie('connect.sid');
        res.status(200).send("Logged out successfully!");
    });
});

function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    // User is authenticated
    next();
  } else {
    res.status(401).send("Unauthorized");
  }
}
router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
