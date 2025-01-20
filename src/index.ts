// Tuval-Yulevich-315348359-Guy-Halfon-322206624
import express from 'express'
import { connectDB } from './utils/db';
import bodyParser from 'body-parser';
import commentRoutes from "./routes/commentRoutes";
import postRoutes from './routes/postRoutes';
import authRoutes from './routes/authRoutes';
import swaggerUi from 'swagger-ui-express';
import swaggerDocs from './swaggerConfig';
import cors from "cors";
import multermiddelware from './middleware/multermiddelware';
import path from 'path';
import session from 'express-session';
import passport from 'passport';
import './utils/google.strategy.ts';

const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}))
app.use((err, req, res, next) => {
    res.status(500).json({ message: err.message });
});
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use(cors({
    origin: '*', // לכל המקורות
    credentials: true,
}));

app.use(
    session({
      secret: process.env.SESSION_SECRET as string,
      resave: false,
      saveUninitialized: true,
    })
  );
  
// הגדרת Passport
app.use(passport.initialize());
app.use(passport.session());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.post('/saveImage', multermiddelware,(req,res)=>{
    res.json(req.file)
})

app.get('/',(req,res)=>{
    res.send("Hello, Tuval is the king.")
})

connectDB();

//routes
app.use('/post', postRoutes);
app.use("/comments", commentRoutes);
app.use("/auth", authRoutes)


export default app;