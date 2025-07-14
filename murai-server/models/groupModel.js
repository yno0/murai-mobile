import {Schema, model } from "mongoose"


const groupSchema = new Schema({
    name:{
        type: String,
        required: true,
    },
    description:{
        type: String,
    },
    userId:{
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    createAt:{
        type: Date,
        default: Date.now,
    },
    updateAt:{
        type: Date,
        default: Date.now,
    },
    isActive:{
        type: Boolean,
        default: true,
    }
})

export default model('Group', groupSchema);