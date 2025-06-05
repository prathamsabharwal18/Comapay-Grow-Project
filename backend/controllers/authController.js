import Admin from '../models/Admin.js';
import Employee from '../models/Employee.js';
import bcrypt from 'bcryptjs';

export const login = async (req, res) => {
  console.log(req.body);
  const { userId, password, role } = req.body;

  try {
    let user;

    if (role === 'admin') {
      user = await Admin.findOne({ userId });
    } else if (role === 'employee') {
      user = await Employee.findOne({ userId });
    } else {
      return res.status(400).json({ message: 'Invalid role' });
    }

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // If you want, generate a JWT token here
    // Example: const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    // res.json({ message: 'Login successful', token, user: { userId: user.userId, role: user.role, name: user.name || null } });

    res.json({ 
      message: 'Login successful', 
      user: { userId: user.userId, role: user.role, name: user.name || null } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// --- NEW LOGOUT LOGIC ---
export const logout = (req, res) => {
  // For your current setup, simply sending a success message is enough.
  // If you later implement JWTs or sessions, you'd add:
  // - Clear httpOnly cookies (if using them for JWTs/sessions)
  // - Invalidate JWTs on a blacklist (if using JWTs and stateless logout is not desired)
  // - Destroy server-side session (if using express-session)
  console.log('User attempting to log out...');
  res.json({ message: 'Logout successful' });
};
// --- END NEW LOGOUT LOGIC ---