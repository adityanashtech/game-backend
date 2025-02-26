const express = require('express');
const multer = require('multer');
const path = require('path');
const connection = require('../config/db');
const fs = require('fs');

const router = express.Router();

// Multer setup for handling image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Create a new slider
router.post('/slider', upload.single('image'), (req, res) => {
  const { title } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!title || !image) {
    return res.status(400).json({ error: 'Title and image are required' });
  }

  const query = "INSERT INTO sliders (image, title) VALUES (?, ?)";
  connection.query(query, [image, title], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(201).json({ message: 'Slider created successfully', sliderId: results.insertId });
  });
});

// Get all sliders
router.get('/sliders', (req, res) => {
  const query = "SELECT * FROM sliders";
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Update a slider
router.put('/slider/:id', upload.single('image'), (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  const image = req.file ? req.file.filename : null;

  // Build query dynamically based on provided fields
  const fieldsToUpdate = [];
  const values = [];

  if (title) {
    fieldsToUpdate.push("title = ?");
    values.push(title);
  }
  if (image) {
    fieldsToUpdate.push("image = ?");
    values.push(image);
  }

  if (fieldsToUpdate.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  values.push(id);

  const query = `UPDATE sliders SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
  connection.query(query, values, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Slider not found' });
    }
    res.json({ message: 'Slider updated successfully' });
  });
});

// Delete a slider
router.delete('/slider/:id', (req, res) => {
  const { id } = req.params;

  // Find the image path to delete it from the file system
  const selectQuery = "SELECT image FROM sliders WHERE id = ?";
  connection.query(selectQuery, [id], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Slider not found' });
    }

    const imagePath = `uploads/${results[0].image}`;

    // Delete the slider from the database
    const deleteQuery = "DELETE FROM sliders WHERE id = ?";
    connection.query(deleteQuery, [id], (err, deleteResults) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // Delete the image file from the uploads folder
      }

      res.json({ message: 'Slider deleted successfully' });
    });
  });
});

module.exports = router;
