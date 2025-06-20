import mongoose, { Schema } from "mongoose";

const playlistSchema = new Schema({
    name : {
        type : String,
        requird : true
    },
    description : {
        type : String,
        requird : true
    },
    videos : {
        type : Schema.Types.ObjectId,
        ref : "Video"
    },
    owner : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },
}, {
    timestamps: true
})

export const playlist = mongoose.model("Playlist", playlistSchema)