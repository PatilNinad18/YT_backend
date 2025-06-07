import dotenv from "dotenv";
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


dotenv.config();

const connectDB = async()=>{
    console.log("Trying to connect to MongoDB with URI:", process.env.MONGODB_URI);

    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connected !!! DB HOST: ${connectionInstance.connection.host}`);
        // console.log(connectionInstance);
        
    }catch(error){
        console.log("MONGODB connection error", error);
        process.exit(1)
        
    }
}

export default connectDB