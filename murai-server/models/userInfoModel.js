import  { Schema, model } from "mongoose";


const UserInfoSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique:true
        },
        firstName: {
            type: String,
            required: false,
        },
        lastName: {
            type: String,
        },
        gender:{
            type: String,
            enum: ['male', 'female', 'other']

        },
        phoneNumber: {
            type: String,
            required: false,
        },
        profilePicture: {
            type: String,
        },
        dateOfBirth: {
            type: Date,
            required: false,
        },
        createAt: {
            type: Date,
            default: Date.now,
        },
        updateAt: {
            type: Date,
            default: Date.now,
        }

    }
)

export default model('UserInfo', UserInfoSchema);