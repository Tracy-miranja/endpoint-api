const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { auth, checkRole } = require('./middleware/auth');
const { sendEmail } = require("./middleware/mailer");
const User = require("./models/User");
const Job = require("./models/Job");
const Category = require("./models/Category");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const extractProfileDetails = require("./middleware/cvExtract")
require("dotenv").config();

const app = express();
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

mongoose
    .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Register endpoint
app.post("/api/register", async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword });
        await user.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Login
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User doesn't exist" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        res.json({ token });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Read user by ID endpoint
app.get("/api/users/:id", auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Delete user by ID
app.delete("/api/users/:id", auth, checkRole(["admin", "super admin"]), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await user.remove();
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Get all users
app.get("/api/users", auth, checkRole(["admin", "super admin"]), async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Update user profile endpoint (supports DOCX, PDF, and JSON)
app.put("/api/profile/:id", auth, checkRole(["admin", "super admin", "job applicant"]), upload.single("file"), async (req, res) => {
    try {
        const userId = req.params.id;
        const file = req.file;
        let extractedText;
        let profileDetails;

        // Handle file uploads
        if (file) {
            // Handle PDF extraction
            if (file.mimetype === 'application/pdf') {
                const dataBuffer = file.buffer;
                const data = await pdfParse(dataBuffer);
                extractedText = data.text;
            }

            // Handle DOCX extraction
            if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                const result = await mammoth.extractRawText({ buffer: file.buffer });
                extractedText = result.value;
            }

            if (!extractedText) {
                return res.status(400).json({ message: "Unsupported file type" });
            }

            // Extract profile details from the extracted text
            profileDetails = extractProfileDetails(extractedText);

        } else {
            // If no file is provided, assume JSON data is being sent in the request body
            if (req.body && Object.keys(req.body).length > 0) {
                profileDetails = req.body;
            } else {
                return res.status(400).json({ message: "No file or profile data provided" });
            }
        }

        // Update the user profile
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profile: profileDetails },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "Profile updated successfully", profile: updatedUser.profile });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Create Job Endpoint
app.post("/api/jobs", checkRole(["admin", "super admin"]), async (req, res) => {
    const { created_by, title, description, salary_range, job_status, category_id } = req.body;

    if (!created_by || !title || !description || !salary_range || !category_id) {
        return res.status(400).json({ message: "All fields are required." });
    }

    // Ensure salary_range has both min and max
    if (salary_range.min === undefined || salary_range.max === undefined) {
        return res.status(400).json({ message: "Salary range must include min and max." });
    }

    try {
        const newJob = new Job({
            created_by,
            title,
            description,
            salary_range,
            job_status,
            category_id
        });

        const savedJob = await newJob.save();
        res.status(201).json(savedJob);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all jobs
app.get("/api/jobs", async (req, res) => {
    try {
        const jobs = await Job.find()
            .populate({
                path: "created_by",
                select: "-password"
            })
            .populate("category_id");

        res.json(jobs);
    } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Get jobs by category
app.get("/api/jobs/category/:categoryId", async (req, res) => {
    const { categoryId } = req.params;
    try {
        const jobs = await Job.find({ category_id: categoryId }).populate("created_by category_id");
        if (!jobs.length) {
            return res.status(404).json({ message: "No jobs found for this category." });
        }
        res.json(jobs);
    } catch (error) {
        console.error("Error fetching jobs by category:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Get a single job by ID
app.get("/api/jobs/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const job = await Job.findById(id).populate("created_by category_id");
        if (!job) {
            return res.status(404).json({ message: "Job not found." });
        }
        res.json(job);
    } catch (error) {
        console.error("Error fetching job by ID:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Update job
app.put("/api/jobs/:id", auth, checkRole(["admin", "super admin"]), async (req, res) => {
    try {
        const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!updatedJob) {
            return res.status(404).json({ message: "Job not found" });
        }

        res.json(updatedJob);
    } catch (error) {
        console.error("Error updating job:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Delete job
app.delete("/api/jobs/:id", auth, checkRole(["admin", "super admin"]), async (req, res) => {
    try {
        const deletedJob = await Job.findByIdAndDelete(req.params.id);

        if (!deletedJob) {
            return res.status(404).json({ message: "Job not found" });
        }

        res.json({ message: "Job deleted successfully" });
    } catch (error) {
        console.error("Error deleting job:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Get all categories
app.get("/api/categories", async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Get a single category by ID
app.get("/api/category/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ message: "Category not found." });
        }
        res.json(category);
    } catch (error) {
        console.error("Error fetching category by ID:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Create Category Endpoint
app.post("/api/categories", auth, checkRole(["admin", "super admin"]), async (req, res) => {
    try {
        const { category_name } = req.body;
        if (!category_name) {
            return res.status(400).json({ message: "Category name is required." });
        }
        const newCategory = new Category({
            category_name,
        });
        await newCategory.save();
        res.status(201).json({ message: "Category created successfully", category: newCategory });
    } catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Edit Category Endpoint
app.put("/api/categories/:id", auth, checkRole(["admin", "super admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        const { category_name } = req.body;

        // Validate the input
        if (!category_name) {
            return res.status(400).json({ message: "Category name is required." });
        }

        // Find and update the category
        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            { category_name },
            { new: true, runValidators: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ message: "Category not found." });
        }

        res.status(200).json({ message: "Category updated successfully", category: updatedCategory });
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Delete Category Endpoint
app.delete("/api/categories/:id", auth, checkRole(["admin", "super admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCategory = await Category.findByIdAndDelete(id);
        if (!deletedCategory) {
            return res.status(404).json({ message: "Category not found." });
        }
        await Job.updateMany({ category: id }, { $set: { category: null } });
        res.status(200).json({ message: "Category deleted successfully." });
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Endpoint to send notifications
app.post("/api/notifications", async (req, res) => {
    const { to, subject, html } = req.body;
    try {
        await sendEmail(to, subject, html);
        res.status(200).json({ message: "Email sent successfully." });
    } catch (error) {
        console.error("Error sending notification:", error);
        res.status(500).json({ message: "Error sending notification." });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
