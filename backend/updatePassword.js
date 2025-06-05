import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Employee from './models/Employee.js';
import Admin from './models/Admin.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/companyGrowDB';

const updatePassword = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    const newPlainPassword = '123456';
    const hashedPassword = await bcrypt.hash(newPlainPassword, 10);

    const role = 'employee'; // or 'admin'
    const userId = 'emp01'; // change to match your existing user

    let result;

    if (role === 'employee') {
      result = await Employee.findOneAndUpdate(
        { userId },
        { password: hashedPassword },
        { new: true }
      );
    } else {
      result = await Admin.findOneAndUpdate(
        { userId },
        { password: hashedPassword },
        { new: true }
      );
    }

    if (result) {
      console.log(`Password updated for ${role}: ${userId}`);
    } else {
      console.log(`User ${userId} not found.`);
    }

    process.exit();
  } catch (err) {
    console.error('Error updating password:', err);
    process.exit(1);
  }
};

updatePassword();
