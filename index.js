// Tuval-Yulevich-315348359-Guy-Halfon-322206624
import express from 'express'
import { connectDB } from './utils/db.js';
import bodyParser from 'body-parser';
import commentRoutes from "./routes/commentRoutes.js";
import postRoutes from './routes/postRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}))
app.use((err, req, res, next) => {
    res.status(500).json({ message: err.message });
});

app.get('/',(req,res)=>{
    res.send("Hello, Tuval is the king.")
 })

connectDB();

//routes
app.use('/post', postRoutes);
app.use("/comments", commentRoutes);
app.use("/auth", authRoutes)

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));