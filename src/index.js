// require('dotenv').config({path : './env'})

import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

// Load .env from root directory
dotenv.config(); // ✅ this is enough if .env is in root

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running at port : ${process.env.PORT}`);
        
    })
})
.catch((err)=> {
    console.log("MONGO DB Connection failed !!!", err);
    
})






















// // iffy ;( ()=>{})()
// ;( async ()=>{
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//     }catch(error){
//         console.error("ERROR: ", error);
//         throw err
        
//     }
// })()
