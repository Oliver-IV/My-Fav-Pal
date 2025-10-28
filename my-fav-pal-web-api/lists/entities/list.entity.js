// lists/entities/list.entity.js
import mongoose from 'mongoose';

const ListItemSchema = new mongoose.Schema({
    mediaId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Media',
        required: true 
    },
}, { _id: false });

const ListSchema = new mongoose.Schema({
    ownerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    name: { 
        type: String, 
        required: [true, 'El nombre de la lista es obligatorio.'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    visibility: { 
        type: String, 
        enum: ['public', 'private'], 
        default: 'private' 
    },
    items: [ListItemSchema],
}, {
    timestamps: true
});

const List = mongoose.model('List', ListSchema);

export default List; 