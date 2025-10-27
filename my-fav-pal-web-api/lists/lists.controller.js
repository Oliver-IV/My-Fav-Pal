const listService = require('./lists.service');
const CreateListDTO = require('./dtos/lists.createDTO.js'); 
const UpdateListDTO = require('./dtos/lists.updateDTO.js'); 

exports.getLists = async (req, res) => {
    try {
        const lists = await listService.getAllLists();
        res.status(200).json(lists);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getListById = async (req, res) => {
    try {
        const { id } = req.params;
        const list = await listService.getListById(id);
        res.status(200).json(list);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

exports.createList = async (req, res) => {
    try {
        const createListDTO = new CreateListDTO(req.body);
        const newList = await listService.createList(createListDTO);
        res.status(201).json(newList);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateList = async (req, res) => {
    try {
        const { id } = req.params;
        const updateListDTO = new UpdateListDTO(req.body);
        const updatedList = await listService.updateList(id, updateListDTO);
        res.status(200).json(updatedList);
    } catch (error) {
        res.status(error.status || 400).json({ message: error.message });
    }
};

exports.deleteList = async (req, res) => {
    try {
        const { id } = req.params;
        await listService.deleteList(id);
        res.status(204).send();
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};