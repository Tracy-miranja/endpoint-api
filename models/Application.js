const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
        required: true,
    },
    resume: {
        type: String,
        required: true,
    },
    coverLetter: {
        type: String,
    },
    status: {
        type: String,
        enum: ["applied", "interview", "hired", "rejected"],
        default: "applied",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Application = mongoose.model("Application", applicationSchema);

module.exports = Application;
