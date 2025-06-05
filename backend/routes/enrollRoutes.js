import express from 'express';
import Employee from '../models/Employee.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { userId, courseId } = req.body;  // changed from employeeId

  try {
    const employee = await Employee.findOne({ userId });  // changed to findOne by userId
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    if (!employee.enrolledCourses.includes(courseId)) {
      employee.enrolledCourses.push(courseId);
      await employee.save();
    }

    res.status(200).json({ message: 'Enrolled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error enrolling', error });
  }
});

export default router;
