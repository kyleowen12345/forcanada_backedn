import mongoose from "mongoose";

const Token = mongoose.model(
    "Token",
    new mongoose.Schema({
        token: {
            type: String,
            required: true
          },
          
    },{
        timestamps: true
    })

)

export {Token}