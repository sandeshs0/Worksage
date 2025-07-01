const Board = require('../models/Board');
const Column = require('../models/Column');
const Task = require('../models/Task');
const { validationResult } = require('express-validator');




exports.getUserBoards = async (req, res) => {
  try {
    const boards = await Board.find({ 'members.userId': req.user.id })
      .sort('-createdAt')
      .populate('createdBy', 'name email')
      .populate('members.userId', 'name email');

    res.json({ success: true, data: boards });
  } catch (error) {
    console.error('Error fetching user boards:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};




exports.createBoard = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description } = req.body;

    const newBoard = new Board({
      title,
      description,
      createdBy: req.user.id
    });

    const board = await newBoard.save();

    
    const defaultColumns = [
      { title: 'To Do', boardId: board._id, order: 0 },
      { title: 'In Progress', boardId: board._id, order: 1 },
      { title: 'Done', boardId: board._id, order: 2 }
    ];

    await Column.insertMany(defaultColumns);

    res.status(201).json({ success: true, data: board });
  } catch (error) {
    console.error('Error creating board:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};




exports.getBoard = async (req, res) => {
  try {
    const board = await Board.findOne({
      _id: req.params.id,
      'members.userId': req.user.id
    })
      .populate('createdBy', 'name email')
      .populate('members.userId', 'name email');

    if (!board) {
      return res.status(404).json({ success: false, message: 'Board not found' });
    }

    const columns = await Column.find({ boardId: board._id }).sort('order');
    const tasks = await Task.find({ boardId: board._id })
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    res.json({
      success: true,
      data: {
        board,
        columns,
        tasks
      }
    });
  } catch (error) {
    console.error('Error fetching board:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};




exports.updateBoard = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, background } = req.body;

    const board = await Board.findOneAndUpdate(
      {
        _id: req.params.id,
        'members.userId': req.user.id,
        'members.role': { $in: ['owner', 'admin'] }
      },
      { $set: { title, description, background } },
      { new: true }
    );

    if (!board) {
      return res.status(404).json({ 
        success: false, 
        message: 'Board not found or you do not have permission' 
      });
    }

    res.json({ success: true, data: board });
  } catch (error) {
    console.error('Error updating board:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};




exports.deleteBoard = async (req, res) => {
  try {
    const board = await Board.findOneAndDelete({
      _id: req.params.id,
      'members.userId': req.user.id,
      'members.role': 'owner'
    });

    if (!board) {
      return res.status(404).json({ 
        success: false, 
        message: 'Board not found or you do not have permission' 
      });
    }

    
    await Promise.all([
      Column.deleteMany({ boardId: board._id }),
      Task.deleteMany({ boardId: board._id })
    ]);

    res.json({ success: true, message: 'Board deleted successfully' });
  } catch (error) {
    console.error('Error deleting board:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};