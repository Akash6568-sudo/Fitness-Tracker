const mongoose = require("mongoose");
async function connectDB() {
    try {
        await mongoose.connect(
            "mongodb://127.0.0.1:27017/Fitness-Tracker"
        );
        console.log("MongoDB connected");
    } catch (error) {
        console.log("MongoDB error:", error.message);
    }
}
module.exports = connectDB;