// const express = require('express');
// const router = express.Router();
// const auth = require('../middleware/authMiddleware');
// const assignmentController = require('../controllers/assignmentController');

// router.post('/', auth, assignmentController.createAssignment);
// router.get('/', auth, assignmentController.getAssignments);
// router.get('/:id', auth, assignmentController.getAssignment);
// router.put('/:id', auth, assignmentController.updateAssignment);
// router.delete('/:id', auth, assignmentController.deleteAssignment);

// module.exports = router;


const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const assignmentController = require('../controllers/assignmentController');
const mongoose = require('mongoose');

// Middleware to validate MongoDB ObjectId
function validateObjectId(req, res, next) {
  const id = req.params.id;
  if (id && !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  next();
}

router.post('/', auth, assignmentController.createAssignment);
router.get('/', auth, assignmentController.getAssignments);
router.get('/:id', auth, validateObjectId, assignmentController.getAssignment);
router.put('/:id', auth, validateObjectId, assignmentController.updateAssignment);
router.delete('/:id', auth, validateObjectId, assignmentController.deleteAssignment);

module.exports = router;
