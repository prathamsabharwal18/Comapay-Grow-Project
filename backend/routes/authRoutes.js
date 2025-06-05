// routes/authRoutes.js
import express from 'express';
import { login,logout } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout); // <--- ADD THIS LINE

export default router;
