import { Router } from 'express';
import { createSubject, getSubjects, getSubjectWithTasks, updateSubject, deleteSubject } from '../controllers/subjectController';
import auth from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createSubjectSchema, updateSubjectSchema } from '../schemas/subjectSchema';

const router = Router();

router.use(auth);

router.post('/', validate(createSubjectSchema), createSubject);
router.get('/', getSubjects);
router.get('/:id', getSubjectWithTasks);
router.put('/:id', validate(updateSubjectSchema), updateSubject);
router.delete('/:id', deleteSubject);

export default router;