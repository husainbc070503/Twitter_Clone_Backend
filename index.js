import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectToDB from "./database/connectToDB.js";
import Auth from './routes/User.js';
import Post from './routes/Post.js';
import Reply from "./routes/Reply.js";
import List from "./routes/Lists.js";
import ErrorHandler from "./middlewares/ErrorHandler.js";

dotenv.config();
const port = process.env.PORT;
const app = express();

connectToDB();
app.use(express.json());
app.use(cors());

app.use('/api/user', Auth);
app.use('/api/post', Post);
app.use('/api/reply', Reply);
app.use('/api/list', List);

app.get('/', (req, res) => res.send('Hello World, Welcome to X server'));
app.use(ErrorHandler);
app.listen(port, () => console.log(`Server running on port ${port}`));