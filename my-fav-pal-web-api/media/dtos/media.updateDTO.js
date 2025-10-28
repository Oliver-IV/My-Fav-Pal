export default class UpdateMediaDTO {
    constructor({ name, description, link, platform, genres, status, rating }) {
        if (name !== undefined) this.name = name;
        if (description !== undefined) this.description = description;
        if (link !== undefined) this.link = link;
        if (platform !== undefined) this.platform = platform;
        if (genres !== undefined) this.genres = genres;
        if (status !== undefined) this.status = status;
        if (rating !== undefined) this.rating = rating;
    }
}