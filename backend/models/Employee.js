// models/Employee.js
import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'employee',
    required: true,
  },
  enrolledCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  },],
  tags: [{
    type: String,
  }],
  completedCourses:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  }],
  badges: [{
    type: String,  // Assuming badges are stored as strings
  }],
  amount:{
    type: Number,
    default: 0,
  },
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CompanyProject' }],
  completedProjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CompanyProject',
  }],
  stripeAccountId: {
  type: String,
},
Email: {
  type: String,
},
}, { timestamps: true });

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;
