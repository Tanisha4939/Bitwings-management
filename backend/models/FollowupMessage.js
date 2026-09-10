const mongoose = require("mongoose");

const recipientSchema = new mongoose.Schema(
    {
        number: {
            type: String,
            required: true,
        },

        status: {
            type: String,
            enum: ["sent", "failed"],
            required: true,
        },

        messageId: {
            type: String,
            default: "",
        },

        error: {
            type: String,
            default: "",
        },
    },
    { _id: false }
);

const followupMessageSchema = new mongoose.Schema(
    {
        recipients: {
            type: [recipientSchema],
            required: true,
        },

        message: {
            type: String,
            required: true,
            trim: true,
        },

        image: {
            name: {
                type: String,
                default: "",
            },
            mimeType: {
                type: String,
                default: "",
            },
            size: {
                type: Number,
                default: 0,
            },
        },

        status: {
            type: String,
            enum: ["sent", "partial", "failed"],
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "FollowupMessage",
    followupMessageSchema
);