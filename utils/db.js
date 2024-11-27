import mongoose from "mongoose";

export const connectDB = async () => {
    try{
        await mongoose.connect('mongodb://localhost:27017/App_Assig1');
        console.log("Database connected!");
        
    } catch(err){
        throw `failed to connect DB: ${err}`
    }
}