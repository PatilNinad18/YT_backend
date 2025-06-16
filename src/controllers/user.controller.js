import { asyncHandler } from "../utils/asyncHandler.js";

// yeh 1000 baar use hoga

const registerUser = asyncHandler( async (req, res)=>{
    res.status(200).json({
        message : "backend development"
    })
})

export {registerUser}