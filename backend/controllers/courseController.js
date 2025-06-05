import Course from '../models/Course.js';
import mongoose from 'mongoose';

export const getCourseById = async (req, res) => {
  try {
    const { ids } = req.body;

    // Validate input
    if (!Array.isArray(ids)) {
      return res.status(400).json({ message: 'IDs must be an array' });
    }

    // Convert to ObjectId if they are strings
    const objectIds = ids.map(id => new mongoose.Types.ObjectId(id));

    const courses = await Course.find({ _id: { $in: objectIds } });

    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses by IDs:', error);
    res.status(500).json({ message: 'Server error' });
  }
};