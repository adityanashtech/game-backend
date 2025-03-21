const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, },
  email: { type: String,  },
  password: { type: String,},
  dob: { type: Date, },
  phone: { type: String, },
  code: { type: String,  },
});

module.exports = mongoose.model('User', userSchema);
