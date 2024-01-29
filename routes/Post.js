import { Router } from "express";
import ValidUser from "../middlewares/ValidUser.js";
import ValidateInput from "../middlewares/ValidateInput.js";
import CreatePost from "../validators/PostValidator.js";
import Post from "../models/Post.js";
const router = Router();

router.post('/createPost', ValidUser, ValidateInput(CreatePost), async (req, res) => {
    try {
        var post = await Post.create({ ...req.body, user: req.user._id })
        post = await Post.findById(post._id).populate('user', '-password');

        res.status(200).json({ success: true, post });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.get('/posts', ValidUser, async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('user', '-password')
            .populate('likes')
            .sort({ postedOn: -1 });

        res.status(200).json({ success: true, posts });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/editPost/:id', ValidUser, async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(req.params.id, { ...req.body }, { new: true })
            .populate('user', '-password')
            .populate('likes');

        res.status(200).json({ success: true, post });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.delete('/deletePost/:id', ValidUser, async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/like/:id', ValidUser, async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(req.params.id, { $push: { likes: req.user._id } }, { new: true })
            .populate('user', '-password')
            .populate('likes');

        res.status(200).json({ success: true, post });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/unlike/:id', ValidUser, async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(req.params.id, { $pull: { likes: req.user._id } }, { new: true })
            .populate('user', '-password')
            .populate('likes');

        res.status(200).json({ success: true, post });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

export default router;