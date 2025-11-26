const Assignment = require('../models/Assignment');

// Create assignment
exports.createAssignment = async (req, res) => {
  try {
    const { title, description, dueDate, priority } = req.body;
    if (!title || !dueDate) return res.status(400).json({ message: 'Title and dueDate required' });

    // Only accept YYYY-MM-DD
    const due = new Date(dueDate);
    if (isNaN(due.getTime())) return res.status(400).json({ message: 'Invalid dueDate format' });

    const assignment = new Assignment({
      user: req.user._id,
      title,
      description,
      dueDate: due,
      priority: priority || 'Medium'
    });

    await assignment.save();
    res.status(201).json(assignment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get assignments
exports.getAssignments = async (req, res) => {
  try {
    const { sort, status } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;

    if (sort === 'priority') {
      const results = await Assignment.aggregate([
        { $match: query },
        { $addFields: {
            priorityOrder: { $switch: {
              branches: [
                { case: { $eq: ['$priority', 'High'] }, then: 1 },
                { case: { $eq: ['$priority', 'Medium'] }, then: 2 },
                { case: { $eq: ['$priority', 'Low'] }, then: 3 }
              ],
              default: 4
            }}
          }
        },
        { $sort: { priorityOrder: 1, dueDate: 1 } }
      ]);
      return res.json(results);
    }

    const assignments = await Assignment.find(query).sort(sort === 'dueDate' ? { dueDate: 1 } : {});
    res.json(assignments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single assignment
exports.getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findOne({ _id: req.params.id, user: req.user._id });
    if (!assignment) return res.status(404).json({ message: 'Not found' });
    res.json(assignment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update assignment
exports.updateAssignment = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.dueDate) {
      const due = new Date(data.dueDate);
      if (isNaN(due.getTime())) return res.status(400).json({ message: 'Invalid dueDate format' });
      data.dueDate = due;
    }

    const assignment = await Assignment.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      data,
      { new: true }
    );

    if (!assignment) return res.status(404).json({ message: 'Not found' });
    res.json(assignment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete assignment
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!assignment) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
