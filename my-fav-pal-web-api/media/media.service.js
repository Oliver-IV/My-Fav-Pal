import mediaDAO from './media.dao.js'; 

export default class MediaService {

    async createMedia(mediaData) {
        const existingMedia = await mediaDAO.findByNameAndType(mediaData.name, mediaData.type);
        if (existingMedia) {
            const error = new Error(`El medio '${mediaData.name}' del tipo '${mediaData.type}' ya existe.`);
            error.status = 409; 
            throw error;
        }
        return mediaDAO.create(mediaData);
    }

    async getAllMedia(filter = {}) {
        return mediaDAO.findAll(filter);
    }

    async getMediaById(id) {
        const media = await mediaDAO.findById(id);
        if (!media) {
            const error = new Error(`Medio con ID ${id} no encontrado.`);
            error.status = 404;
            throw error;
        }
        return media;
    }

    async updateMedia(id, updateData) {
        await this.getMediaById(id); 
        return mediaDAO.update(id, updateData);
    }

    async deleteMedia(id) {
        await this.getMediaById(id); 
        return mediaDAO.delete(id);
    }
}