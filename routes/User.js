import { Router } from "express";
import { Login, PasswordChange, Register, SendOtp } from "../validators/AuthValidator.js";
import User from "../models/User.js";
import ValidUser from "../middlewares/ValidUser.js";
import ValidateInput from "../middlewares/ValidateInput.js";
import dotenv from "dotenv";
import bcryptjs from 'bcryptjs';
import nodemailer from "nodemailer"
import Otp from "../models/Otp.js";

dotenv.config();
const router = Router();

const sendMail = async (email, message) => {
    const transport = nodemailer.createTransport({
        service: "gmail",
        port: 587,
        secure: true,
        auth: {
            user: process.env.USER,
            pass: process.env.PASSWORD
        },
        tls: { rejectUnauthorized: false }
    });

    const options = {
        from: process.env.user,
        to: email,
        subject: 'Twitter Clone Mail Service System',
        html: message
    }

    await new Promise((resolve, reject) => {
        transport.sendMail(options, (err, info) => {
            if (err) {
                reject(err);
                console.log(err.message);
            } else {
                console.log('Emailed successfully!');
                resolve(info);
            }
        });
    });
}

router.post('/register', ValidateInput(Register), async (req, res) => {
    try {
        var user = await User.findOne({ email: req.body.email });
        if (user)
            return res.status(400).json({ success: false, message: 'User already exists. Please Login' });

        user = await User.create(req.body);
        res.status(200).json({ success: true, user });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.post('/login', ValidateInput(Login), async (req, res) => {
    try {
        var user = await User.findOne({ email: req.body.email });
        if (!user || !await user.validatePassword(req.body.password))
            return res.status(400).json({ success: false, message: 'Invalid Credentials' });

        user = await User.findOne({ email: req.body.email })
            .populate('followers')
            .populate('following')
            .populate('bookmarks')
            .populate('pinnedLists');

        console.log(await user.generateToken());
        res.status(200).json({ success: true, user: { user, token: await user.generateToken() } });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.get('/users', ValidUser, async (req, res) => {
    try {
        const users = await User.find()
            .populate('followers')
            .populate('following')
            .populate('bookmarks')
            .populate('pinnedLists')
            .sort({ joinedOn: "desc" });

        res.status(200).json({ success: true, users });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/updateProfile', ValidUser, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user._id, { ...req.body }, { new: true })
            .populate('followers')
            .populate('following')
            .populate('bookmarks')
            .populate('pinnedLists');

        res.status(200).json({ success: true, user });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/follow/:id', ValidUser, async (req, res) => {
    try {
        const following = await User.findByIdAndUpdate(req.user._id, { $push: { following: req.params.id } }, { new: true })
            .populate('followers')
            .populate('following')
            .populate('bookmarks')
            .populate('pinnedLists');

        const follower = await User.findByIdAndUpdate(req.params.id, { $push: { followers: following._id } }, { new: true });
        res.status(200).json({ success: true, data: { follower, following } });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/unfollow/:id', ValidUser, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user._id, { $pull: { following: req.params.id } }, { new: true })
            .populate('followers')
            .populate('following')
            .populate('bookmarks')
            .populate('pinnedLists');

        await User.findByIdAndUpdate(req.params.id, { $pull: { followers: user._id } }, { new: true });
        res.status(200).json({ success: true });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/bookmark/:id', ValidUser, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user._id, { $push: { bookmarks: req.params.id } }, { new: true })
            .populate('followers')
            .populate('following')
            .populate('bookmarks')
            .populate('pinnedLists');

        res.status(200).json({ success: true, user });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/removeBookmark/:id', ValidUser, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user._id, { $pull: { bookmarks: req.params.id } }, { new: true })
            .populate('followers')
            .populate('following')
            .populate('bookmarks')
            .populate('pinnedLists');

        res.status(200).json({ success: true, user });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.get('/bookmarks', ValidUser, async (req, res) => {
    try {
        var bookmarks = await User.findById(req.user._id).select('bookmarks').populate('bookmarks');
        bookmarks = await User.populate(bookmarks, {
            path: 'bookmarks',
            populate: {
                path: "user",
                select: '-password'
            }
        })

        res.status(200).json({ success: true, bookmarks: bookmarks.bookmarks });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/pinList/:id', ValidUser, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user._id, { $push: { pinnedLists: req.params.id } }, { new: true })
            .populate('followers')
            .populate('following')
            .populate('bookmarks')
            .populate('pinnedLists');

        res.status(200).json({ success: true, user });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/unpinList/:id', ValidUser, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user._id, { $pull: { pinnedLists: req.params.id } }, { new: true })
            .populate('followers')
            .populate('following')
            .populate('bookmarks')
            .populate('pinnedLists');

        res.status(200).json({ success: true, user });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.get('/pinnedLists', ValidUser, async (req, res) => {
    try {
        var pinnedLists = await User.findById(req.user._id).select('pinnedList  s').populate('pinnedLists');
        pinnedLists = await User.populate(pinnedLists, {
            path: 'pinnedLists',
            populate: [
                {
                    path: "user",
                    select: '-password'
                },
                {
                    path: 'followers',
                    select: '-password'
                },
                {
                    path: "members",
                    select: '-password'
                }
            ]
        });

        res.status(200).json({ success: true, pinnedLists: pinnedLists.pinnedLists });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.post('/sendOtp', ValidateInput(SendOtp), async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user)
            return res.status(400).json({ success: false, message: 'User could not be fetched. Please register' });

        const otp = await Otp.create({
            email,
            otp: Math.floor(Math.random() * 9000) + 1000, // this will generate 4 digit otp
            expiresIn: new Date().getTime() * 5 * 60 * 1000,
        });

        sendMail(email, `<h4>Your one time password for updation of your password is ${otp.otp}. It is valid for only 5 mins. Please do not share it with anyone. <br /> Thank You!</h4>`);
        res.json({ success: true, otp });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/updatePassword', ValidateInput(PasswordChange), async (req, res) => {
    try {
        const { otp, email, password } = req.body;
        const validOtp = await Otp.findOne({ email, otp });

        if (validOtp) {
            const diff = validOtp.expiresIn - new Date().getTime();
            if (diff < 0)
                return res.status(400).json({ success: false, message: "OTP expired" });

            const salt = await bcryptjs.genSalt(10);
            const secPass = await bcryptjs.hash(password, salt);

            const user = await User.findOneAndUpdate({ email }, { password: secPass }, { new: true });
            
            sendMail(email, "<h4>Your password for the Twitter Clone has been updated. Please login and verify. <br> If it wasn't you then please contact us immediately. Thank you</h4>");
            
            res.status(200).json({ success: true, user });

        } else {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

export default router;