import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// yeh 1000 baar use hoga

const registerUser = asyncHandler( async (req, res)=>{
    // get user details from frontend (here postman)
    // validation (not empty, wrong)
    // check if user already exists - username,email
    // check for images - avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db (because mongodb only accepts object)
    // remove password and refershtoken field from response
    // check for user creation
    // return response


    // get user details
    const {fullName,email, username, password } = req.body
    console.log("email", email);
    // console.log(req.body);
    
    if (
        [fullName,email,username,password].some((feild) =>
            feild?.trim === "")) //yeh saare fields ko check karega ki woh bhare hua hai ki nahi
        {
            throw new ApiError(400, "All fields are required!!!")
        }

        const existedUser = User.findOne({
            $or : [{username}, {email}] //yeh ekhi waqt pe donho ko check karega ki URL mai data already entered hai ki nahi
            
        })
        // console.log(existedUser);
        if (existedUser){
            throw new ApiError(409, "User with Email aur username already exists")
        }
        
        const avatarLocalPath = req.files?.avatar[0]?.path
        //         let avatarLocalPath;
// if (
//   req.files &&
//   req.files.avatar &&
//   req.files.avatar[0] &&
//   req.files.avatar[0].path
// ) {
//   avatarLocalPath = req.files.avatar[0].path;
// }
        // console.log(avatarLocalPath);
        const coverImageLocalPath = req.files?.coverImage[0]?.path
        
        if (!avatarLocalPath){
            throw new ApiError(400, "Avatar file is required")
        }

        const avatar = await uploadOnCloudinary(avatarLocalPath)
        const coverImage = await uploadOnCloudinary(coverImageLocalPath)

        if (!avatar){
            throw new ApiError(400, "Avatar file is required")
        }

        const USER  = await User.create({
            fullName, 
            avatar : avatar.url,
            coverImage : coverImage?.url || "",
            email,
            password,
            username : username.toLowerCase()
        })

        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"  //this will not take password and refreshtoke
        )

        if(!createdUser){
            throw new ApiError(500, "Something went wrong while registering the User")
        }

        return res.status(201).json(
            new ApiResponse(200, createdUser, "User registered successfully")
        )
})

export {registerUser}