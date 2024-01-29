import mongoose from "mongoose";

const ReplySchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },

    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post',
    },

    parentReply: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'reply',
    },

    repliedOn: {
        type: Date,
        default: Date.now(),
    },

    replies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'reply'
    }],

    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }]

}, { timestamps: true });

const Reply = mongoose.model('reply', ReplySchema);
export default Reply;