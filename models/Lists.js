import mongoose, { mongo } from "mongoose";

const ListSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },

    description: {
        type: String,
        required: true
    },

    backgroundImage: {
        type: String,
        required: true
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },

    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],

    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }]

}, { timestamps: true });

const List = mongoose.model('list', ListSchema);
export default List;