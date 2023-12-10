const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'name required'],
    minlength: [3, 'too short name'],
    trim: true,
  },
  slug: {
    type: String,
    lowercase: true,
  },
  email: {
    type: String,
    required: [true, 'email required'],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Password required'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  passwordChangedAt: Date,
  passwordResetcode: String,
  passwordResetExpire: Date,
  passwordResetVerify: Boolean,
  phone: String,
  profileImage: String,
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  active: {
    type: Boolean,
    default: true,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
