import express from 'express';
import Course from '../models/Course.js'; // your Mongoose course schema
import { getCourseById } from '../controllers/courseController.js';
const router = express.Router();

// GET /api/courses - fetch all courses from DB
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
    // console.log(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Server error fetching courses' });
  }
});
// Add a new course
router.post('/', async (req, res) => {
  console.log('0');
  try {
    const course = new Course(req.body);
    console.log('POST /api/courses body:', req.body);
    await course.save();
    res.status(201).json(course);
  } catch (err) {
    console.error('Error creating course:', err);  // This logs to your backend console
    res.status(500).json({ error: err.message });
  }
});


// Update existing course (partial update allowed)
router.put('/:id', async (req, res) => {
  try {
    const updated = await Course.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Course not found' });
    res.json(updated);
  } catch (err) {
    console.error('Error updating course:', err);
    res.status(500).json({ message: 'Failed to update course' });
  }
});

// Delete a course
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Course.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Course not found' });
    res.json({ message: 'Course deleted' });
  } catch (err) {
    console.error('Error deleting course:', err);
    res.status(500).json({ message: 'Failed to delete course' });
  }
});

// ✅ GET /api/courses/:id - fetch a single course by ID
// router.get('/:id', async (req, res) => {
//   try {
//     // console.log(req.params.id)
//     const course = await Course.findById(req.params.id);
//     if (!course) {
//       return res.status(404).json({ message: 'Course not found' });
//     }
//     res.json(course);
//   } catch (error) {
//     console.error('Error fetching course by ID:', error);
//     res.status(500).json({ message: 'Server error fetching course' });
//   }
// });
router.post('/byids', getCourseById);

export default router;
