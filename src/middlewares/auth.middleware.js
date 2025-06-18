// yeh sirf verify karega ki user hai ki nahi hai aur yeh logout karne mai use hota hai


import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

export const verifyJWT = asyncHandler(async(req , _, next)=>{  //here res is not used so _ is given
    try {
        const token = req.cookies?.accessToken || req.header("Authorization Error")?.replace("Bearer ", "") //replaced bearer with blank space (Null)
        if(!token){
            throw new ApiError(401, "Unauthorised request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token")
    }
})