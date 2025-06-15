import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "brcypt";
import { use } from "react";

const userSchema = new Schema(
    {
        username : {
            type : String,
            required : true,
            unique : true,
            lowercase : true,
            trim : true,
            index : true   //helps to search efficientily
        },
        
        email : {
            type : String,
            required : true,
            unique : true,
            lowercase : true,
            trim : true,
            // index : true   //helps to search efficientily sabko index nahi karte
        },

        fullname : {
            type : String,
            required : true,
            trim : true,
            index : true   //helps to search efficientily
        },

        avatar : {
            type : String, // cloudinary url use karenge
            required : true,
        },

        coverImage: {
            type : String, // cloudinary url use karenge
        },

        watchHistory : [
            {
                type : Schema.Types.ObjectId,
                ref : "Video"
            }
        ],

        password: {
            type : String,
            required : [true, 'Password is required']
        },
        refreshToken : {
            type : String
        }
    },
    {
        timestamps : true
    }
)

userSchema.pre("save",async function(next){   //yaha arrow function use nahi kar sakte kyuki .this use karna hai
    if(!this.isModified("password")) return next();

    this.password = bcrypt.hash(this.password, 10) //hash method 2 chije leta hai, ek password aur dusri ki uspe kitne layers lagane hai security ke
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password) //since this is checking passwords it takes time so we've used await
    
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id: this._id,
        email : this.email,
        username : this.username,
        fullname : this.fullname,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn :ACCESS_TOKEN_EXPIRY
    }
)
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id: this._id,
        email : this.email,
        username : this.username,
        fullname : this.fullname,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn :REFRESH_TOKEN_EXPIRY
    }
)

}


export const User = mongoose.model("User", userSchema)