import express from 'express'
import { connectDB } from './utils/db.js';
import bodyParser from 'body-parser';

const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}))

app.get('/',(req,res)=>{
    res.send("hello")
 })

connectDB();

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));