import { Router } from "express";
import ValidUser from "../middlewares/ValidUser.js";
import Reply from "../models/Reply.js";
const router = Router();

router.post('/addReply', ValidUser, async (req, res) => {
    try {
        const { text, post } = req.body;
        if (!text)
            return res.status(400).json({ success: false, message: 'Please enter text!' });

        var reply = await Reply.create({ text, post, user: req.user._id });
        reply = await Reply.findById(reply._id)
            .populate('user', '-password')
            .populate('post');

        res.status(200).json({ success: true, reply })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.post('/addReply/:rid/:pid', ValidUser, async (req, res) => {
    try {
        const { text } = req.body;
        const { rid, pid } = req.params

        if (!text)
            return res.status(400).json({ success: false, message: 'Please enter text!' });

        const childReply = await Reply.create({ text, post: pid, user: req.user._id, parentReply: rid });
        var parentReply = await Reply.findByIdAndUpdate(rid, { $push: { replies: childReply } }, { new: true })
            .populate('user', '-password')
            .populate('post')
            .populate('likes');

        parentReply = await Reply.populate(parentReply, {
            path: 'replies',
            populate: [{
                path: 'user',
                select: '-password',
            },
            { path: 'post' },
            { path: "parentReply", populate: { path: 'user', select: '-password' } }]
        });

        res.status(200).json({ success: true, parentReply })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.delete('/deleteReply/:rid/:pid', ValidUser, async (req, res) => {
    try {
        const { rid, pid } = req.params;
        const reply = await Reply.findOne({ post: pid, _id: rid });
        await Reply.findByIdAndDelete(rid);

        if (reply.parentReply)
            await Reply.findByIdAndUpdate({ _id: reply.parentReply }, { $pull: { replies: rid } }, { new: true });

        res.status(200).json({ success: true });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.get('/replies', ValidUser, async (req, res) => {
    try {
        var replies = await Reply.find()
            .populate('user', '-password')
            .populate('post')
            .populate('likes')
            .populate('parentReply');

        replies = await Reply.populate(replies, {
            path: 'replies',
            populate: [{
                path: 'user',
                select: '-password',
            },
            { path: 'post' },
            { path: 'likes' },
            { path: "parentReply", populate: { path: 'user', select: '-password' } }]
        })

        res.status(200).json({ success: true, replies });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/like/:id', ValidUser, async (req, res) => {
    try {
        var reply = await Reply.findByIdAndUpdate(req.params.id, { $push: { likes: req.user._id } }, { new: true })
            .populate('user', '-password')
            .populate('post')
            .populate('likes');

        reply = await Reply.populate(reply, {
            path: 'replies',
            populate: [{
                path: 'user',
                select: '-password',
            },
            { path: 'post' },
            { path: 'likes' },
            { path: "parentReply", populate: { path: 'user', select: '-password' } }]
        });

        if (reply.parentReply !== undefined) {
            var parentReply = await Reply.findByIdAndUpdate(reply.parentReply._id, { $pull: { replies: reply._id } }, { new: true });
            parentReply = await Reply.findByIdAndUpdate(reply.parentReply._id, { $push: { replies: reply._id } }, { new: true })
                .populate('user', '-password')
                .populate('post')
                .populate('likes');

            parentReply = await Reply.populate(parentReply, {
                path: 'replies',
                populate: [{
                    path: 'user',
                    select: '-password',
                },
                { path: 'post' },
                { path: 'likes' },
                { path: "parentReply", populate: { path: 'user', select: '-password' } }]
            });

            return res.status(200).json({ success: true, reply: parentReply });
        }

        res.status(200).json({ success: true, reply });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/unlike/:id', ValidUser, async (req, res) => {
    try {
        var reply = await Reply.findByIdAndUpdate(req.params.id, { $pull: { likes: req.user._id } }, { new: true })
            .populate('user', '-password')
            .populate('post')
            .populate('likes');

        reply = await Reply.populate(reply, {
            path: 'replies',
            populate: [{
                path: 'user',
                select: '-password',
            },
            { path: 'post' },
            { path: 'likes' },
            { path: "parentReply", populate: { path: 'user', select: '-password' } }]
        });

        if (reply.parentReply !== undefined) {
            var parentReply = await Reply.findByIdAndUpdate(reply.parentReply._id, { $pull: { replies: reply._id } }, { new: true });
            parentReply = await Reply.findByIdAndUpdate(reply.parentReply._id, { $push: { replies: reply._id } }, { new: true })
                .populate('user', '-password')
                .populate('post')
                .populate('likes');

            parentReply = await Reply.populate(parentReply, {
                path: 'replies',
                populate: [{
                    path: 'user',
                    select: '-password',
                },
                { path: 'post' },
                { path: 'likes' },
                { path: "parentReply", populate: { path: 'user', select: '-password' } }]
            });

            return res.status(200).json({ success: true, reply: parentReply });
        }

        res.status(200).json({ success: true, reply });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

export default router;

/* The map function is used with asynchronous operations (async/await), which returns an array of promises. Since the insertReply function is asynchronous, it returns promises for each item in the array.
In the corrected code, I used Promise.all() to wait for all promises to be resolved before proceeding. This ensures that the map operation completes and you have the final resolved array. */