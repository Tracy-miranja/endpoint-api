const mongoose = require("mongoose");

// Job Schema
const jobSchema = new mongoose.Schema({
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    salary_range: {
        min: {
            type: Number,
            required: true
        },
        max: {
            type: Number,
            required: true
        }
    },
    job_status: {
        type: String,
        enum: ["approved", "pending"],
        default: "pending"
    },
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    }
});

// Create and export Job model
const Job = mongoose.model("Job", jobSchema);
module.exports = Job;
