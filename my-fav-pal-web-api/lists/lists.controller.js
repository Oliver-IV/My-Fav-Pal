exports.getLists = (req, res) => {
    res.status(200).json(lists);
};


exports.getListById = (req, res) => {
    const listId = req.params.id;
    const list = lists.find(l => l._id === listId);

    if (list) {
        res.status(200).json(list);
    } else {
        res.status(404).json({ message: `Lista con ID ${listId} no encontrada` });
    }
};


exports.createList = (req, res) => {

    const newList = {
        ...req.body,
        _id: generateDummyId(),
        createdAt: new Date().toISOString(),
        items: req.body.items || [], 
        visibility: req.body.visibility || 'private' 
    };
    res.status(201).json(newList);
};


exports.updateList = (req, res) => {
    const listId = req.params.id;
    const updatedList = {
        ...req.body,
        _id: listId
    };
    res.status(200).json(updatedList);
};


exports.deleteList = (req, res) => {
    const listId = req.params.id;
    res.status(200).json({ message: `Lista con ID ${listId} eliminada!`});
};