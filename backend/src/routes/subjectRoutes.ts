import { Router } from 'express';
import { createSubject, getSubjects, getSubjectWithTasks, updateSubject, deleteSubject } from '../controllers/subjectController';
import auth from '../middleware/auth';

const router = Router();

router.use(auth);

router.post('/', createSubject);
router.get('/', getSubjects);
router.get('/:id', getSubjectWithTasks);
router.put('/:id', updateSubject);
router.delete('/:id', deleteSubject);

export default router;
