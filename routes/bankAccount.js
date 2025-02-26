const express = require('express');
const connection = require('../config/db');

const router = express.Router();

// Create a new bank account
router.post('/addnew', async (req, res) => {
  const { userId, accountname, accountnumber, ifsccode, branch, status } = req.body;

  try {
    const query = `
      INSERT INTO bankaccount (userId, accountname, accountnumber, ifsccode, branch, status) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    connection.query(
      query,
      [userId, accountname, accountnumber, ifsccode, branch, status || 0], 
      (err, results) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: 'Database error while creating bank account' });
        }
        res.status(201).json({ message: 'Bank account created successfully', id: results.insertId });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Error creating bank account' });
  }
});

// Retrieve all bank accounts
router.get('/getall', async (req, res) => {
  try {
    const query = "SELECT * FROM bankaccount";
    connection.query(query, (err, results) => {
      if (err) return res.status(500).json({ error: 'Database query error' });
      res.json(results);
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching bank accounts' });
  }
});


//Retrive one bank accounts by user id
router.get('/getone/user/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const query = "SELECT * FROM bankaccount WHERE userId = ?";
    connection.query(query, [userId], (err, results) => {
      if (err) return res.status(500).json({ error: 'Database query error' });
      if (results.length === 0) return res.status(404).json({ error: 'Bank account not found' });
      res.json(results);
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching bank account' });
  }
});

// Retrieve a single bank account by ID
router.get('/getonebyid/:id', async (req, res) => {
  const bankAccountId = req.params.id;

  try {
    const query = "SELECT * FROM bankaccount WHERE id = ?";
    connection.query(query, [bankAccountId], (err, results) => {
      if (err) return res.status(500).json({ error: 'Database query error' });
      if (results.length === 0) return res.status(404).json({ error: 'Bank account not found' });
      res.json(results[0]);
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching bank account' });
  }
});

// Update a bank account by ID
router.put('/update/:id', async (req, res) => {
  const bankAccountId = req.params.id;
  const { accountname, accountnumber, ifsccode, branch, status } = req.body;

  try {
    const query = `
      UPDATE bankaccount 
      SET accountname = ?, accountnumber = ?, ifsccode = ?, branch = ?, status = ?
      WHERE id = ?
    `;
    connection.query(
      query,
      [accountname, accountnumber, ifsccode, branch, status, bankAccountId],
      (err, results) => {
        if (err) return res.status(500).json({ error: 'Database query error' });
        if (results.affectedRows === 0)
          return res.status(404).json({ error: 'Bank account not found' });

        res.json({ message: 'Bank account updated successfully' });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Error updating bank account' });
  }
});

// Delete a bank account by ID
router.delete('/delete/:id', async (req, res) => {
  const bankAccountId = req.params.id;

  try {
    const query = "DELETE FROM bankaccount WHERE id = ?";
    connection.query(query, [bankAccountId], (err, results) => {
      if (err) return res.status(500).json({ error: 'Database query error' });
      if (results.affectedRows === 0)
        return res.status(404).json({ error: 'Bank account not found' });

      res.json({ message: 'Bank account deleted successfully' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting bank account' });
  }
});

module.exports = router;
