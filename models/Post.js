import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },

    media: {
        type: String,
        required: true
    },

    mediaType: {
        type: String,
        required: true
    },

    postedOn: {
        type: Date,
        default: Date.now()
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },

    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    }],

}, { timestamps: true });

const Post = mongoose.model('post', PostSchema);
export default Post;