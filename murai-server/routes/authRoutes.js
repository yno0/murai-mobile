import express, {Router} from 'express';
import { login, registerStep1, verifyOtp, completeProfile } from '../controller/authController.js';

const router = Router();

router.post('/login', login);
router.post('/register', registerStep1);
router.post('/verify-otp', verifyOtp);
router.post('/complete-profile', completeProfile);


export default router;

