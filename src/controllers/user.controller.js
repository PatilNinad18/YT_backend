import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { jwt } from "jsonwebtoken";
import mongoose from "mongoose";
// yeh 1000 baar use hoga

// yeh toh har baar use hoga hi
const generateAccessAndRefreshTokens = async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave : false})

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating Access and Refresh Token")
    }
}

// asyncHandler is used to handle the web requests
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
    // console.log("email", email);
    // console.log(req.body);
    
    if (
        [fullName,email,username,password].some((feild) =>
            feild?.trim === "")) //yeh saare fields ko check karega ki woh bhare hua hai ki nahi
        {
            throw new ApiError(400, "All fields are required!!!")
        }

        const existedUser =await User.findOne({
            $or : [{username}, {email}] //yeh ekhi waqt pe donho ko check karega ki URL mai data already entered hai ki nahi
            
        })
        // console.log(existedUser);
        if (existedUser){
            throw new ApiError(409, "User with Email aur username already exists")
        }
        
        // const avatarLocalPath = req.files?.avatar[0]?.path
        const avatarLocalPath = req?.files?.avatar?.[0]?.path;
        // const avatarLocalPath = req?.files["avatar"]?.[0]?.path;
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
        
        // const coverImageLocalPath = req.files?.coverImage[0]?.path
        
        let coverImageLocalPath;
        if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
            coverImageLocalPath = req.files.coverImage[0].path
        }

        if (!avatarLocalPath){
            console.log("req.files", req.files);
            throw new ApiError(400, "Avatar file is required")
        }

        const avatar = await uploadOnCloudinary(avatarLocalPath)
        const coverImage = await uploadOnCloudinary(coverImageLocalPath)

        if (!avatar?.url){
            console.log("req.files", req.files);

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

        const createdUser = await User.findById(USER._id).select(
            "-password -refreshToken"  //this will not take password and refreshtoke
        )

        if(!createdUser){
            throw new ApiError(500, "Something went wrong while registering the User")
        }

        return res.status(201).json(
            new ApiResponse(200, createdUser, "User registered successfully")
        )
        
})

const loginUser = asyncHandler(async (req,res) =>{
    // steps to get login 
    // req body se data le aao
    // username aur email base pe le sakte ho
    // data woh already database mai pehle hai kya woh check karo (findtheuser)
    // phir input data, database se compare karke dekho, username aur password leke login karo
    // agar password incorrect aaya toh accessToken aur refreshToken generate karo
    // aur inko cookies mai bhej do

    const {email, username, password} = req.body

    if (!username && !email){
        throw new ApiError(400, "Username or Email are requirred!!!")
    }

    const user = await User.findOne({
        $or : [{username}, {email}]  // yeh mongodb ki technique hai isse hum donho le sakte hai
    })

    if(!user){
        throw new ApiError(404, "User doesn't exist")
    }

    // Checking password is correct or not
    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user Credentials")
    }

    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    // const loggedInUser = await User.findById(user._id).select("username email fullname"); // etc.


    const options = {
        httpOnly : true,  //these are cookies only modified by server
        secure: true
    }

    
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user : loggedInUser, accessToken, refreshToken  //yaha pe hum woh case handle karre jaha user apne tarf se accessToken aur refreshToken set karna chahraha

            },
            console.log("User logged in Successfully")
            
        )
    )

})

// logout function - cookies aur tokens clear karenge

const logoutUser = asyncHandler(async (req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,{
            $set : {
                refreshToken : undefined
            }
        },
        {
            new : true
        }
    )

    const options = {
        httpOnly : true,  //these are cookies only modified by server
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"))
})

const refreshAccessToken = asyncHandler(async (req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if (incomingRefreshToken){
        throw new ApiError(401, "Unauthorised Request")
    }

    try {
        const decodedToken = jwt.verifY(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401, "Invalid Refresh Token")
        }
    
        if(!incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh token is expired or is used")
        }
    
        const options = {
            httpOnly : true,
            secure : true
        }
    
        const {accessToken,newrefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newrefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken :newrefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async (req,res)=>{
    const {oldPassword, newPassword} = req.body
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect =await user.isPasswordCorrect(oldPassword)
    if (!isPasswordCorrect){
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave : false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async (req,res)=>{
    return res
    .status(200)
    .json(200, res.user, "Currect user fetched successfully")
})

const updateAccountDetails = asyncHandler(async (req,res)=>{
    const {fullName, email} = req.body

    if(!fullName || !email){
        throw new ApiError(400, "All feilds are required")
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                fullName,
                email :email,

            }
        },
        {new : true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))

})

const updateUserAvatar = asyncHandler(async (req,res)=>{
    const avatarLocalPath = req.file?.path
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400, "Error while uploading on avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                "avatar" : avatar.url
            }
        },
        {new : true}
    ).select("-password")
    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatat Image uploaded successfully")
    )
})

const updateUserCoverImage = asyncHandler(async (req,res)=>{
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400, "Cover Image file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400, "Error while uploading on cover image")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                "coverImage" : coverImage.url
            }
        },
        {new : true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Cover Image uploaded successfully")
    )
})

const getUserChannelProfile = asyncHandler(async (req,res)=>{
    const {username} = req.params

    if(!username?.trim){
        throw new ApiError(400, "Username is missing")
    }

    const channel = await User.aggregate([
        {
            $match : {
                username : username?.toLowerCase()
            }
        },
        {
            $lookup : {
                from : "Subscriptions",
                localField : _id,
                foreignField : "channel",
                as : "subscribers"
            }
        },
        {
            $lookup : {
                from : "Subscriptions",
                localField : _id,
                foreignField : "subscriber",
                as : "subscribedTo"
            }
        },
        {
            $addFields : {
                subscribersCount : {
                    $size : "$subscribers"
                },
                channelsSubscribedToCount : {
                    $size : "subscribedTo"
                },
                isSubscribed: {
                    $condition : {
                        if : {$in : [req.user?._id, "subscribers.subscriber"]},
                        then : true,
                        else : false
                    }
                }
            }
        },
        {
            $project : {
                fullName : 1,
                username : 1,
                subscribersCount : 1,
                channelsSubscribedToCount  :1,
                isSubscribed : 1,
                avatar : 1,
                coverImage : 1,
                email : 1
            }
        }
    ])
    console.log(channel);
    
    if (!channel?.length) {
        throw new ApiError(404, "Channel does not exist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )
})



// writing pipeline for watch history
const getWatchHistory = asyncHandler(async (req,res)=>{
    const user = await User.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup : {
                from : "Videos",
                localField: watchHistory,
                foreignField : "_id",
                as : "watchHistory", 
                pipeline : [
                    {
                        $lookup : {
                            from : "users",
                            localField : "owner",
                            foreignField : "_id",
                            as : "owner",
                            pipeline : [
                                {
                                    $project : {
                                        fullName : 1,
                                        username : 1,
                                        avatar : 1
                                    }
                                }
                            ]

                        }
                    },
                    {
                        $addFields : {
                            owner : {
                                $first : "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch History fetched successfully"
        )
    )
})



export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    changeCurrentPassword,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}