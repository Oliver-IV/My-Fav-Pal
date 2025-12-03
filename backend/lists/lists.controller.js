import ListService from './lists.service.js';
import CreateListDTO from './dtos/lists.createDTO.js';
import UpdateListDTO from './dtos/lists.updateDTO.js';

const listService = new ListService();

export const getLists = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log(`[Controller] Buscando listas para el usuario con ID: ${userId}`); // <-- LOG 1

    const lists = await listService.getListsByUserId(userId);
    console.log(`[Controller] Listas encontradas en la BD:`, lists); // <-- LOG 2

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

export const createList = async (req, res) => {
  try {
    const userId = req.user.userId;
    const createListDTO = new CreateListDTO(req.body);

    if (!createListDTO.name) {
      return res.status(400).json({ success: false, message: 'List name is required.' });
    }

    const newList = await listService.createList(createListDTO, userId);
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
    const updateListDTO = new UpdateListDTO(req.body);

    const updatedList = await listService.updateList(id, updateListDTO, userId);
    res.status(200).json({
      success: true,
      message: 'List updated successfully',
      data: updatedList,
    });
  } catch (error) {
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