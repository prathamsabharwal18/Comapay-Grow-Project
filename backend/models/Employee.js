// models/Employee.js
import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        trim: true, // Added trim to remove whitespace
    },
    name: {
        type: String,
        required: true,
        trim: true, // Added trim to remove whitespace
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: 'employee',
        required: true,
        enum: ['employee', 'admin', 'manager'], // It's good practice to define allowed roles
    },
    enrolledCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
    }],
    tags: [{
        type: String,
        trim: true, // Trim whitespace from tags
    }],
    completedCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
    }],
    badges: [{
        type: String, // Assuming badges are stored as strings
        trim: true, // Trim whitespace from badges
    }],
    amount: {
        type: Number,
        default: 0,
    },
    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CompanyProject'
    }],
    completedProjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CompanyProject',
    }],
    stripeAccountId: {
        type: String,
        trim: true, // Trim whitespace
    },
    Email: {
        type: String,
        required: true, // Made Email required
        unique: true, // Made Email unique
        trim: true, // Trim whitespace from email
        lowercase: true, // Convert email to lowercase before saving
        // Basic regex for email validation
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
    },
}, { timestamps: true }); // timestamps: true adds createdAt and updatedAt fields automatically

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;