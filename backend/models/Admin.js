// models/Admin.js
import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'admin',
    required: true,
  },
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
