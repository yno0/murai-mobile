import { Schema, model } from 'mongoose';

const detectedWordSchema = new Schema({
    word: {
        type: String,
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    }  ,
    context: {
        type: String,
        required: true,
    },
    sentimentScore: {
        type: Number,
        required: true,
    },
   url: {
    type: String, 
    required: true,
   },
   accuracy: {
        type: Number,
        required: true,
    },
    responseTime: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

export default model('DetectedWord', detectedWordSchema);