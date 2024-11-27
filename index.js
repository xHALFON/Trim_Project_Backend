import express from 'express'
import { connectDB } from './utils/db.js';
import bodyParser from 'body-parser';
import commentRoutes from "./routes/commentRoutes.js";
import postRoutes from './routes/postRoutes.js'

const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}))


app.get('/',(req,res)=>{
    res.send("Hello, Tuval is the king.")
 })

connectDB();

//routes
app.use('/post', postRoutes);
app.use("/comments", commentRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));