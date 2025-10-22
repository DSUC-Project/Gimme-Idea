import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import { getCurrentUser, updateCurrentUser, getUserTransactions } from '../controllers/user.controller.js';
import { updateUserSchema } from '../validators/user.schemas.js';

const router = Router();

router.get('/me', verifyToken, getCurrentUser);
router.put('/me', verifyToken, validateBody(updateUserSchema), updateCurrentUser);
router.get('/me/transactions', verifyToken, getUserTransactions);

export default router;
