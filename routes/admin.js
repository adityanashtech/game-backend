const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const connection = require('../config/db'); // Ensure your DB connection is set up

// Admin login
router.post('/admin-login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const query = "SELECT * FROM admins WHERE username = ?";
    connection.query(query, [username], async (err, results) => {
      if (err) return res.status(500).json({ error: 'Database query error' });
      if (results.length === 0) return res.status(404).json({ error: 'Admin not found' });

      const admin = results[0];
      if (admin.password !== password) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign({ id: admin.id, isAdmin: true }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error logging in admin' });
  }
});

// Create a new user
router.post('/user', async (req, res) => {
  const { username, email, password, phone, dob } = req.body;
  const referalCode = "admin"
  console.log(req.body,"req.body");

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the user into the 'users' table
    const query = "INSERT INTO users (username, email, password, phone, dob, code) VALUES (?, ?, ?, ?, ?, ?)";
    connection.query(query, [username, email, hashedPassword, phone, dob, referalCode], (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'Database error' });
      }

      // Get the newly created user's ID
      const userId = results.insertId;

      // List of cryptocurrencies
      const cryptocurrencies = ['BTC', 'ETH', 'LTC', 'USDT', 'SOL', 'DOGE', 'BCH', 'XRP', 'TRX', 'EOS', 'INR','CP'];

      // Generate wallet entries for the new user
      const walletQuery = "INSERT INTO wallet (userId, balance, cryptoname) VALUES ?";
      const walletValues = cryptocurrencies.map(crypto => [userId, 0, crypto]);

      // Insert wallet entries into the 'wallet' table
      connection.query(walletQuery, [walletValues], (err, walletResults) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: 'Error creating wallet entries' });
        }

        // Respond with a success message
        res.status(201).json({ message: 'User registered and wallet initialized successfully' });
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error registering user' });
  }
});


module.exports = router;
