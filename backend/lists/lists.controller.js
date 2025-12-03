import ListService from './lists.service.js';
import mongoose from 'mongoose'; 

const listService = new ListService();

export const getLists = async (req, res) => {
  try {
    const userId = req.user.userId;

    const lists = await listService.getListsByUserId(userId);

    res.status(200).json({
      success: true,
      data: lists,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getList = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid list ID format.' });
    }

    const list = await listService.getListById(id, userId);
    res.status(200).json({
      success: true,
      data: list,
    });
  } catch (error) {
    if (error.message.includes('List not found')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createList = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, description, visibility, items } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'List name is required.' });
    }

    const listToCreate = {
      name,
      description,
      visibility,
      items: items || []
    };

    const newList = await listService.createList(listToCreate, userId);

    res.status(201).json({
      success: true,
      message: 'List created successfully',
      data: newList,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateList = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { name, description, visibility, items } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'List name is required.' });
    }

    const updateData = { name, description, visibility, items };

    console.log(updateData, id, userId); ;

    const updatedList = await listService.updateList(id, updateData, userId);

    res.status(200).json({
      success: true,
      message: 'List updated successfully',
      data: updatedList,
    });
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('permission')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteList = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    await listService.deleteList(id, userId);
    res.status(200).json({
      success: true,
      message: 'List deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};