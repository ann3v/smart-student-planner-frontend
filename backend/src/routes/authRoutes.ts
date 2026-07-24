import { Router } from 'express';
import { register, login, verifyCode, getProfile } from '../controllers/authController';
import auth from '../middleware/auth';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, verifyCodeSchema } from '../schemas/authSchema';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/verify-code', validate(verifyCodeSchema), verifyCode);
router.get('/profile', auth, getProfile);

export default router;
