import { Router } from 'express';
import { register, login, verifyCode, getProfile } from '../controllers/authController';
import auth from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-code', verifyCode);
router.get('/profile', auth, getProfile);

export default router;
