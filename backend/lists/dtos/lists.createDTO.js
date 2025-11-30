class CreateListDTO {
    constructor({ ownerId, name, description, visibility, items }) {
        this.ownerId = ownerId;
        this.name = name;
        this.description = description;
        this.visibility = visibility;
        this.items = items;
    }
}

module.exports = CreateListDTO;