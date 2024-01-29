import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();
const url = process.env.MONGODB_URL;

const connectToDB = async () => {
    mongoose.set('strictQuery', false);
    try {
        await mongoose.connect(url, () => console.log('Connected to MongoDB Successfully!!'));
    } catch (error) {
        console.log(error.message);
    }
}

export default connectToDB;