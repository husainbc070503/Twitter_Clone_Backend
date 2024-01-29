import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
    },

    twitterId: {
        type: String,
        required: true,
        unique: true,
    },

    password: {
        type: String,
        required: true,
    },

    profile: {
        type: String,
        default: "https://icon-library.com/images/default-user-icon/default-user-icon-13.jpg"
    },

    backgroundImage: {
        type: String,
        default: "https://images.unsplash.com/photo-1533035353720-f1c6a75cd8ab?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8MXx8fGVufDB8fHx8fA%3D%3D"
    },

    bio: {
        type: String,
        trim: true,
    },

    location: String,
    website: String,

    joinedOn: {
        type: Date,
        default: Date.now()
    },

    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ],

    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ],

    bookmarks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'post'
        }
    ],

    pinnedLists: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'list'
        }
    ]

}, { timestamps: true });

UserSchema.pre('save', async function (next) {
    try {
        const user = this;
        if (!user.isModified('password'))
            return next();

        const salt = await bcryptjs.genSalt(10);
        const secPassword = await bcryptjs.hash(user.password, salt);
        user.password = secPassword;

    } catch (error) {
        next();
    }
});

UserSchema.methods.validatePassword = async function (password) {
    try {
        const res = await bcryptjs.compare(password, this.password);
        return res;
    } catch (error) {
        console.log(error.message);
    }
}

UserSchema.methods.generateToken = function () {
    return jwt.sign({ userId: this._id.toString() }, process.env.JWT_SECRET, { expiresIn: '10d' })
}

const User = mongoose.model('user', UserSchema);
export default User;