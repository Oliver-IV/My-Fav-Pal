import MediaService from './media.service.js';
import CreateMediaDTO from './dtos/media.createDTO.js';
import UpdateMediaDTO from './dtos/media.updateDTO.js';

const mediaService = new MediaService();

export const createMedia = async (req, res) => {
    try {
        const createMediaDTO = new CreateMediaDTO(req.body);
        const newMedia = await mediaService.createMedia(createMediaDTO);
        res.status(201).json(newMedia);
    } catch (error) {
        res.status(error.status || 400).json({ message: error.message });
    }
};

export const getAllMedia = async (req, res) => {
    try {
        const media = await mediaService.getAllMedia(req.query);
        res.status(200).json(media);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMediaById = async (req, res) => {
    try {
        const { id } = req.params;
        const media = await mediaService.getMediaById(id);
        res.status(200).json(media);
    } catch (error) {
        res.status(error.status || 404).json({ message: error.message });
    }
};

export const updateMedia = async (req, res) => {
    try {
        const { id } = req.params;
        const updateMediaDTO = new UpdateMediaDTO(req.body);
        const updatedMedia = await mediaService.updateMedia(id, updateMediaDTO);
        res.status(200).json(updatedMedia);
    } catch (error) {
        res.status(error.status || 400).json({ message: error.message });
    }
};

export const deleteMedia = async (req, res) => {
    try {
        const { id } = req.params;
        await mediaService.deleteMedia(id);
        res.status(204).send();
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};