import { Schema, model } from "mongoose";


const reportSchema = new Schema({
    userId:{
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    type:{
        type: String,
        enum: ['false_negative', 'false_positive']
    },
    description:{
        type: String,
    },
    // New fields for dashboard/report analytics
    category: {
        type: String, // e.g. 'harassment', 'profanity', etc.
    },
    reportedText: {
        type: String, // The actual text that was reported
    },
    reviewedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    reviewedAt: {
        type: Date,
    },
    status:{
        type: String,
        enum: ['pending', 'resolved', 'in_progress'],
        default: 'pending',
    },
    createAt:{
        type: Date,
        default: Date.now,
    },
    updateAt:{
        type: Date,
        default: Date.now,
    }
})

export default model('Report', reportSchema);