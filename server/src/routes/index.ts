import { Router } from 'express';
import authRouter from './auth.routes.js';
import projectRouter from './project.routes.js';
import feedbackRouter from './feedback.routes.js';
import userRouter from './user.routes.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/projects', projectRouter);
router.use('/users', userRouter);
router.use('/', feedbackRouter); // Feedback routes include /projects/:id/feedback and /feedback/:id

export default router;
