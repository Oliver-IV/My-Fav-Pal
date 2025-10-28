import Media from './entities/media.entity.js';

class MediaDAO {
    async findAll(filter = {}) {
        return await Media.find(filter);
    }

    async findById(id) {
        return await Media.findById(id);
    }
    
    async findByNameAndType(name, type) {
        return await Media.findOne({ name, type });
    }

    async create(mediaData) {
        const media = new Media(mediaData);
        return await media.save();
    }

    async update(id, updateData) {
        return await Media.findByIdAndUpdate(id, updateData, { new: true });
    }

    async delete(id) {
        return await Media.findByIdAndDelete(id);
    }
}

export default new MediaDAO();