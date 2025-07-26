const Column = require('../models/Column');
const Board = require('../models/Board');
const { validationResult } = require('express-validator');

exports.getColumns = async (req, res) => {
  try {
    
    const hasAccess = await Board.exists({
      _id: req.params.boardId,
      'members.userId': req.user.id
    });

    if (!hasAccess) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to access this board' 
      });
    }

    const columns = await Column.find({ boardId: req.params.boardId })
      .sort('order')
      .lean();

    res.json({ success: true, data: columns });
  } catch (error) {
    console.error('Error fetching columns:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};




exports.createColumn = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, boardId } = req.body;

    
    const board = await Board.findOne({
      _id: boardId,
      'members.userId': req.user.id,
      'members.role': { $in: ['owner', 'admin'] }
    });

    if (!board) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to create columns in this board' 
      });
    }

    
    const lastColumn = await Column.findOne({ boardId })
      .sort('-order')
      .select('order')
      .lean();

    const newColumn = new Column({
      title,
      boardId,
      order: lastColumn ? lastColumn.order + 1 : 0
    });

    const column = await newColumn.save();
    res.status(201).json({ success: true, data: column });
  } catch (error) {
    console.error('Error creating column:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};




exports.updateColumn = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, order } = req.body;

    
    const column = await Column.findById(req.params.id);
    if (!column) {
      return res.status(404).json({ 
        success: false, 
        message: 'Column not found' 
      });
    }

    const board = await Board.findOne({
      _id: column.boardId,
      'members.userId': req.user.id,
      'members.role': { $in: ['owner', 'admin'] }
    });

    if (!board) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this column' 
      });
    }

    
    if (title) column.title = title;
    if (order !== undefined) column.order = order;

    const updatedColumn = await column.save();
    res.json({ success: true, data: updatedColumn });
  } catch (error) {
    console.error('Error updating column:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};




exports.deleteColumn = async (req, res) => {
  try {
    
    const column = await Column.findById(req.params.id);
    if (!column) {
      return res.status(404).json({ 
        success: false, 
        message: 'Column not found' 
      });
    }

    const board = await Board.findOne({
      _id: column.boardId,
      'members.userId': req.user.id,
      'members.role': { $in: ['owner', 'admin'] }
    });

    if (!board) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this column' 
      });
    }

    
    await Task.deleteMany({ columnId: column._id });

    
    await column.remove();

    res.json({ success: true, message: 'Column deleted successfully' });
  } catch (error) {
    console.error('Error deleting column:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};




exports.reorderColumns = async (req, res) => {
  try {
    const { newOrder } = req.body;

    
    const column = await Column.findById(req.params.id);
    if (!column) {
      return res.status(404).json({ 
        success: false, 
        message: 'Column not found' 
      });
    }

    const board = await Board.findOne({
      _id: column.boardId,
      'members.userId': req.user.id,
      'members.role': { $in: ['owner', 'admin'] }
    });

    if (!board) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to reorder columns' 
      });
    }

    
    column.order = newOrder;
    await column.save();

    
    const columns = await Column.find({ boardId: column.boardId }).sort('order');

    
    for (let i = 0; i < columns.length; i++) {
      if (columns[i]._id.toString() !== column._id.toString()) {
        columns[i].order = i >= newOrder ? i + 1 : i;
        await columns[i].save();
      }
    }

    res.json({ success: true, message: 'Columns reordered successfully' });
  } catch (error) {
    console.error('Error reordering columns:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};