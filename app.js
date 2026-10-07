const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer"); 
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./db");

const app = express();
const router = express.Router();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));
// USER

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
});

const User = mongoose.model("User", userSchema);


// WORKOUT

const workoutSchema = new mongoose.Schema({
    userId: String,
    workoutName: String,
    exercise: String,
    duration: Number,
    calories: Number,
    date: {
        type: Date,
        default: Date.now
    }
});

const Workout = mongoose.model(
    "Workout",
    workoutSchema
);


// PROGRESS

const progressSchema = new mongoose.Schema({
    userId: String,
    weight: Number,
    height: Number,
    date: {
        type: Date,
        default: Date.now
    }
});

const Progress = mongoose.model(
    "Progress",
    progressSchema
);


// EMAIL

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "akashrakashr6568@gmail.com",
        pass: "gnbs ujiw ekrj mfuw"
    }
});


// SIGNUP

router.post("/signup", async (req, res) => {

    try {

        const {
            name,
            email,
            password
        } = req.body;


        if (!name || !email || !password) {

            return res.status(400).json({
                message: "Please fill all fields"
            });

        }


        if (password.length < 6) {

            return res.status(400).json({
                message:
                    "Password must be at least 6 characters"
            });

        }


        const existingUser =
            await User.findOne({ email });


        if (existingUser) {

            return res.status(400).json({
                message:
                    "Email already registered"
            });

        }


        const hashedPassword =
            await bcrypt.hash(password, 10);


        const user = new User({
            name: name,
            email: email,
            password: hashedPassword
        });


        await user.save();

        


        // Welcome email

        try {

            await transporter.sendMail({

                from: "akashrakashr6568@gmail.com",

                to: email,

                subject: "Welcome to Fitness Tracker",

                text: `Hello ${name},

Welcome to Fitness Tracker.

Your account has been created successfully.

You can now start tracking your workouts
and fitness progress.

Regards,
Fitness Tracker Team`

            });

        } catch (mailError) {

            console.log(
                "Email could not be sent:",
                mailError.message
            );

        }


        res.json({
            message:
                "Registration successful!"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message:
                "Registration failed"
        });

    }

});


// LOGIN

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        if (!email || !password) {

            return res.status(400).json({
                message:
                    "Enter email and password"
            });

        }


        const user =
            await User.findOne({ email });


        if (!user) {

            return res.status(400).json({
                message:
                    "Invalid email or password"
            });

        }


        const match =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!match) {

            return res.status(400).json({
                message:
                    "Invalid email or password"
            });

        }
    
    // ROUTING AFTER LOGIN

    res.redirect("/workout.html?userId=" + user._id);

    } catch (error) {

        res.status(500).json({
            message:
                "Login failed"
        });

    }

});


// GET WORKOUTS

router.get("/workouts", async (req, res) => {

    try {

        const workouts =
            await Workout.find({
                userId: req.query.userId
            });


        res.json(workouts);

    } catch (error) {

        res.status(500).json({
            message:
                "Could not get workouts"
        });

    }

});


// GET ONE WORKOUT

router.get(
    "/workouts/:id",
    async (req, res) => {

        try {

            const workout =
                await Workout.findOne({
                    _id: req.params.id,
                    userId: req.query.userId
                });


            if (!workout) {

                return res.status(404).json({
                    message:
                        "Workout not found"
                });

            }


            res.json(workout);

        } catch (error) {

            res.status(500).json({
                message:
                    "Could not get workout"
            });

        }

    }
);


// CREATE WORKOUT

router.post("/workouts", async (req, res) => {

    try {

        const {
            userId,
            workoutName,
            exercise,
            duration,
            calories
        } = req.body;


       if (
    !userId ||
    !workoutName ||
    !duration ||
    !calories
) {
    return res.status(400).json({
        message: "Please complete the workout"
    });
}


        const workout = new Workout({
            userId,
            workoutName,
            duration,
            calories
        });


        await workout.save();


        res.json({
            message:
                "Workout saved successfully"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message:
                "Could not save workout"
        });

    }

});


// UPDATE WORKOUT

router.put(
    "/workouts/:id",
    async (req, res) => {

        try {

            const workout =
                await Workout.findOneAndUpdate(
                    {
                        _id: req.params.id,
                        userId: req.body.userId
                    },
                    req.body,
                    { new: true }
                );


            if (!workout) {

                return res.status(404).json({
                    message:
                        "Workout not found"
                });

            }


            res.json({
                message:
                    "Workout updated",
                workout: workout
            });

        } catch (error) {

            res.status(500).json({
                message:
                    "Update failed"
            });

        }

    }
);


// DELETE WORKOUT

router.delete(
    "/workouts/:id",
    async (req, res) => {

        try {

            const workout =
                await Workout.findOneAndDelete({
                    _id: req.params.id,
                    userId: req.query.userId
                });


            if (!workout) {

                return res.status(404).json({
                    message:
                        "Workout not found"
                });

            }


            res.json({
                message:
                    "Workout deleted"
            });

        } catch (error) {

            res.status(500).json({
                message:
                    "Delete failed"
            });

        }

    }
);


// GET PROGRESS

router.get("/progress", async (req, res) => {

    try {

        const progress =
            await Progress.find({
                userId: req.query.userId
            });


        res.json(progress);

    } catch (error) {

        res.status(500).json({
            message:
                "Could not get progress"
        });

    }

});


// GET ONE PROGRESS

router.get(
    "/progress/:id",
    async (req, res) => {

        try {

            const progress =
                await Progress.findOne({
                    _id: req.params.id,
                    userId: req.query.userId
                });


            if (!progress) {

                return res.status(404).json({
                    message:
                        "Progress not found"
                });

            }


            res.json(progress);

        } catch (error) {

            res.status(500).json({
                message:
                    "Could not get progress"
            });

        }

    }
);


// CREATE PROGRESS

router.post("/progress", async (req, res) => {

    try {

        const {
            userId,
            weight,
            height
        } = req.body;


        if (
            !userId ||
            !weight ||
            !height
        ) {

            return res.status(400).json({
                message:
                    "Please complete the progress details"
            });

        }


        const progress = new Progress({
            userId,
            weight,
            height
        });


        await progress.save();


        res.json({
            message:
                "Progress saved successfully"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message:
                "Could not save progress"
        });

    }

});


// UPDATE PROGRESS

router.put(
    "/progress/:id",
    async (req, res) => {

        try {

            const progress =
                await Progress.findOneAndUpdate(
                    {
                        _id: req.params.id,
                        userId: req.body.userId
                    },
                    req.body,
                    { new: true }
                );


            if (!progress) {

                return res.status(404).json({
                    message:
                        "Progress not found"
                });

            }


            res.json({
                message:
                    "Progress updated",
                progress: progress
            });

        } catch (error) {

            res.status(500).json({
                message:
                    "Update failed"
            });

        }

    }
);


// DELETE PROGRESS

router.delete(
    "/progress/:id",
    async (req, res) => {

        try {

            const progress =
                await Progress.findOneAndDelete({
                    _id: req.params.id,
                    userId: req.query.userId
                });


            if (!progress) {

                return res.status(404).json({
                    message:
                        "Progress not found"
                });

            }


            res.json({
                message:
                    "Progress deleted"
            });

        } catch (error) {

            res.status(500).json({
                message:
                    "Delete failed"
            });

        }

    }
);


// ROUTER

app.use("/api", router);


// SERVER

connectDB().then(() => {

    app.listen(3000, () => {

        console.log(
            "Server running on http://localhost:3000"
        );

    });

});