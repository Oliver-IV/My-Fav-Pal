export default class CreateMediaDTO {
    constructor({ type, name, description, link, platform, genres, status, rating }) {
        if (!name || !type) {
            throw new Error('El nombre (name) y el tipo (type) son campos requeridos.');
        }
        this.type = type;
        this.name = name;
        this.description = description;
        this.link = link;
        this.platform = platform;
        this.genres = genres;
        this.status = status;
        this.rating = rating;
    }
}