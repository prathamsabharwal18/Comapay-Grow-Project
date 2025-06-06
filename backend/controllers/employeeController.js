// controllers/employeeController.js
import Employee from '../models/Employee.js'; // Adjust path as needed
import bcrypt from 'bcryptjs'; // For password hashing

export const registerEmployee = async (req, res) => {
    try {
        const { userId, name, Email, password, role, amount, tags, badges } = req.body;

        // --- Basic Validation ---
        if (!userId || !name || !Email || !password || !role) {
            return res.status(400).json({ message: 'Please enter all required fields: userId, name, Email, password, role.' });
        }

        // --- Check if employee already exists ---
        const existingEmployee = await Employee.findOne({ userId });
        if (existingEmployee) {
            return res.status(400).json({ message: 'Employee with this User ID already exists.' });
        }

        const existingEmail = await Employee.findOne({ Email });
        if (existingEmail) {
            return res.status(400).json({ message: 'Employee with this Email already exists.' });
        }

        // --- Hash Password ---
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // --- Create New Employee ---
        const newEmployee = new Employee({
            userId,
            name,
            Email,
            password: hashedPassword, // Save the hashed password
            role,
            amount: amount || 0, // Default to 0 if not provided
            tags: tags || [],
            badges: badges || []
            // enrolledCourses, completedCourses, projects, completedProjects, stripeAccountId are managed elsewhere as per your request
        });

        const savedEmployee = await newEmployee.save();

        res.status(201).json({
            message: 'Employee registered successfully!',
            employee: {
                _id: savedEmployee._id,
                userId: savedEmployee.userId,
                name: savedEmployee.name,
                Email: savedEmployee.Email,
                role: savedEmployee.role,
                amount: savedEmployee.amount,
                tags: savedEmployee.tags,
                badges: savedEmployee.badges,
                createdAt: savedEmployee.createdAt,
                updatedAt: savedEmployee.updatedAt,
            },
        });

    } catch (error) {
        console.error('Error in employee registration:', error);
        res.status(500).json({ message: 'Server error during employee registration.', error: error.message });
    }
};
export const deleteEmployee = async (req, res) => {
    try {
        const { userId } = req.params; // Get userId from URL parameters

        const deletedEmployee = await Employee.findOneAndDelete({ userId });

        if (!deletedEmployee) {
            return res.status(404).json({ message: 'Employee not found.' });
        }

        res.status(200).json({ message: 'Employee deleted successfully.', employee: deletedEmployee });

    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ message: 'Server error during employee deletion.', error: error.message });
    }
};

// You'll also need a controller to fetch all employees for the initial load
export const getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.find({});
        res.status(200).json(employees);
    } catch (error) {
        console.error('Error fetching all employees:', error);
        res.status(500).json({ message: 'Server error while fetching employees.', error: error.message });
    }
};