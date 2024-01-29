import { Router } from "express";
import ValidUser from "../middlewares/ValidUser.js";
import List from "../models/Lists.js";
import ValidateInput from "../middlewares/ValidateInput.js";
import CreateList from "../validators/ListValidator.js";
const router = Router();

router.post('/createList', ValidUser, ValidateInput(CreateList), async (req, res) => {
    try {
        var list = await List.create({ ...req.body, user: req.user._id });
        list = await List.findById(list._id)
            .populate('user')
            .populate('members');

        res.status(200).json({ success: true, list });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/updateList/:id', ValidUser, async (req, res) => {
    try {
        const list = await List.findByIdAndUpdate(req.params.id, { ...req.body }, { new: true })
            .populate('user')
            .populate('members')
            .populate('followers');

        res.status(200).json({ success: true, list });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/deleteList/:id', ValidUser, async (req, res) => {
    try {
        await List.findByIdAndDelete(req.params.id)
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/addMember/:id', ValidUser, async (req, res) => {
    try {
        const { user } = req.body;
        const list = await List.findByIdAndUpdate(req.params.id, { $push: { members: user } }, { new: true })
            .populate('user')
            .populate('members')
            .populate('followers');

        res.status(200).json({ success: true, list });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/removeMember/:id', ValidUser, async (req, res) => {
    try {
        const { user } = req.body;
        const list = await List.findByIdAndUpdate(req.params.id, { $pull: { members: user } }, { new: true })
            .populate('user')
            .populate('members')
            .populate('followers');

        res.status(200).json({ success: true, list });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/followList/:id', ValidUser, async (req, res) => {
    try {
        const list = await List.findByIdAndUpdate(req.params.id, { $push: { followers: req.user._id } }, { new: true })
            .populate('user')
            .populate('members')
            .populate('followers');

        res.status(200).json({ success: true, list });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/unfollowList/:id', ValidUser, async (req, res) => {
    try {
        const list = await List.findByIdAndUpdate(req.params.id, { $pull: { followers: req.user._id } }, { new: true })
            .populate('user')
            .populate('members')
            .populate('followers');

        res.status(200).json({ success: true, list });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.get('/lists', ValidUser, async (req, res) => {
    try {
        const lists = await List.find()
            .sort({ createdAt: "asc" })
            .populate('user')
            .populate('members')
            .populate('followers');

        res.status(200).json({ success: true, lists });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
})

export default router;