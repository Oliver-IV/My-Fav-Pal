const List = require('./list.model');
class ListDAO {

    findAll() {
        return List.find({});
    }

    findById(id) {
        return List.findById(id);
    }

    create(listData) {
        const newList = new List(listData);
        return newList.save();
    }

    update(id, listUpdateData) {
        return List.findByIdAndUpdate(id, listUpdateData, { new: true, runValidators: true });
    }

    delete(id) {
        return List.findByIdAndDelete(id);
    }
}

module.exports = new ListDAO();