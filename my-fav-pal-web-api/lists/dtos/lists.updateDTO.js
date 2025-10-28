export default class UpdateListDTO {
    constructor({ name, description, visibility, items }) {
        if (name !== undefined) this.name = name;
        if (description !== undefined) this.description = description;
        if (visibility !== undefined) this.visibility = visibility;
        if (items !== undefined) this.items = items;
    }
}