// require('dotenv').config({path : './env'})

import dotenv from "dotenv";
import connectDB from "./db/index.js";

// Load .env from root directory
dotenv.config(); // ✅ this is enough if .env is in root

connectDB();

// mongoose.connect(process.env.MONGO_URI)






















// // iffy ;( ()=>{})()
// ;( async ()=>{
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//     }catch(error){
//         console.error("ERROR: ", error);
//         throw err
        
//     }
// })()
