const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { spawn } = require("child_process");

const app = express();

const PORT = 5000;


// ========================================
// MIDDLEWARE
// ========================================

app.use(cors());
app.use(express.json());


// ========================================
// MONGODB CONNECTION
// ========================================

mongoose.connect("mongodb://127.0.0.1:27017/respira")
    .then(() => {

        console.log("MongoDB connected successfully");

    })
    .catch((error) => {

        console.error(
            "MongoDB connection failed:",
            error
        );

    });


// ========================================
// USER MODEL
// ========================================

const userSchema = new mongoose.Schema({

    fullName: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    passwordHash: {
    type: String,
    required: true
}

});


const User = mongoose.model(
    "User",
    userSchema
);
// ========================================
// EMERGENCY CONTACT MODEL
// ========================================

const emergencyContactSchema = new mongoose.Schema({

    email: {
        type: String,
        required: true,
        unique: true
    },

    name: {
        type: String,
        required: true
    },

    phone: {
        type: String,
        required: true
    },
    alternatePhone: {
        type: String,
        default: ""
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});


const EmergencyContact =
    mongoose.model(
        "EmergencyContact",
        emergencyContactSchema
    );
// ========================================
// ATTACK LOG MODEL
// ========================================

const attackLogSchema = new mongoose.Schema({

    email: {
        type: String,
        required: true
    },

    date: {
        type: Date,
        default: Date.now
    },

    severity: {
        type: String,
        required: true
    },

    symptoms: {
        type: String,
        default: ""
    },

    notes: {
        type: String,
        default: ""
    }

});


const AttackLog =
    mongoose.model(
        "AttackLog",
        attackLogSchema
    );
// ========================================
// MEDICATION MODEL
// ========================================

const medicationSchema =
    new mongoose.Schema({

        email: {
            type: String,
            required: true
        },

        name: {
            type: String,
            required: true
        },

        dosage: {
            type: String,
            required: true
        },

        schedule: {
            type: String,
            required: true
        },
	time: {
    		type: String,
   		default: ""
	},

        notes: {
            type: String,
            default: ""
        },

        expiryDate: {
            type: Date,
            default: null
        },

        quantity: {
            type: Number,
            default: 0
        },
        adherenceStatus: {
            type: String,
            enum: ["Pending", "Taken", "Missed"],
            default: "Pending"
        },

        createdAt: {
            type: Date,
            default: Date.now
        }

    });


const Medication =
    mongoose.model(
        "Medication",
        medicationSchema
    );
    // ========================================
// CALENDAR EVENT MODEL
// ========================================

const calendarEventSchema = new mongoose.Schema({

    email: {
        type: String,
        required: true
    },

    title: {
        type: String,
        required: true
    },

    date: {
        type: String,
        required: true
    },

    time: {
        type: String,
        required: true
    },

    type: {
        type: String,
        enum: [
            "Medication",
            "Appointment",
            "Checkup",
            "Reminder"
        ],
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});


const CalendarEvent =
    mongoose.model(
        "CalendarEvent",
        calendarEventSchema
    );
// ========================================
// EMERGENCY CONTACT API
// ========================================

// SAVE OR UPDATE EMERGENCY CONTACT

app.post("/api/emergency-contact", async (req, res) => {

    try {

        const {
            email,
            name,
            phone,
            alternatePhone
        } = req.body;

        // Validate required fields
        if (!email || !name || !phone) {

            return res.status(400).json({
                success: false,
                message: "Email, name and primary phone number are required."
            });

        }

        // Create or update emergency contact
        const contact =
            await EmergencyContact.findOneAndUpdate(

                { email: email },

                {
                    email: email,
                    name: name,
                    phone: phone,
                    alternatePhone:
                        alternatePhone || ""
                },

                {
                    new: true,
                    upsert: true
                }

            );

        res.json({

            success: true,

            message:
                "Emergency contact saved successfully.",

            contact: contact

        });

    } catch (error) {

        console.error(
            "Emergency contact save error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to save emergency contact."

        });

    }

});


// GET EMERGENCY CONTACT

app.get(
    "/api/emergency-contact/:email",
    async (req, res) => {

        try {

            const email =
                req.params.email;


            const contact =
                await EmergencyContact.findOne({
                    email: email
                });


            res.json({

                success: true,

                contact: contact

            });


        } catch (error) {

            console.error(
                "Fetch emergency contact error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to load emergency contact."

            });

        }

    }
);
// ========================================
// DELETE EMERGENCY CONTACT
// ========================================

app.delete(
    "/api/emergency-contact/:email",
    async (req, res) => {

        try {

            const email =
                req.params.email;

            const deletedContact =
                await EmergencyContact.findOneAndDelete({
                    email: email
                });

            if (!deletedContact) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Emergency contact not found."
                });

            }

            res.json({

                success: true,

                message:
                    "Emergency contact deleted successfully."

            });

        } catch (error) {

            console.error(
                "Delete emergency contact error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Failed to delete emergency contact."

            });

        }

    }
);

// ========================================
// TEST ROUTE
// ========================================

app.get("/", (req, res) => {

    res.json({

        message:
            "Respira backend is running successfully"

    });

});


// ========================================
// REGISTRATION API
// ========================================

app.post("/api/register", async (req, res) => {

    try {

        const {
            fullName,
            email,
            password
        } = req.body;


        // Check required fields

        if (
            !fullName ||
            !email ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please fill in all required fields."

            });

        }


        // Check existing user

        const existingUser =
            await User.findOne({ email });


        if (existingUser) {

            return res.status(409).json({

                success: false,

                message:
                    "An account with this email already exists."

            });

        }


        // Create new user

        const passwordHash =
    await bcrypt.hash(password, 10);


const newUser =
    await User.create({

        fullName:
            fullName,

        email:
            email,

        passwordHash:
            passwordHash

    });


        // Send response

        res.status(201).json({

            success: true,

            message:
                "Registration successful.",

            user: {

                id:
                    newUser._id,

                fullName:
                    newUser.fullName,

                email:
                    newUser.email

            }

        });


    } catch (error) {

        console.error(
            "Registration error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Server error during registration."

        });

    }

});


// ========================================
// LOGIN API
// ========================================

app.post("/api/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        // Check required fields

        if (
            !email ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please enter your email and password."

            });

        }


        // Find user

        const user =
            await User.findOne({ email });


        // User not found

        if (!user) {

            return res.status(401).json({

                success: false,

                message:
                    "Account not found."

            });

        }


        // Check password

        const passwordMatch =
    await bcrypt.compare(
        password,
        user.passwordHash
    );


if (!passwordMatch) {

    return res.status(401).json({

        success: false,

        message:
            "Incorrect password."

    });

}


        // Login successful

        res.json({

            success: true,

            message:
                "Login successful.",

            user: {

                id:
                    user._id,

                fullName:
                    user.fullName,

                email:
                    user.email

            }

        });


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Server error during login."

        });

    }

});
// ========================================
// CHANGE PASSWORD API
// ========================================

app.post("/api/change-password", async (req, res) => {

    try {

        const {
            email,
            currentPassword,
            newPassword
        } = req.body;


        // Check required fields

        if (
            !email ||
            !currentPassword ||
            !newPassword
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please fill in all password fields."

            });

        }


        // Find user

        const user =
            await User.findOne({
                email: email
            });


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "Account not found."

            });

        }


        // Verify current password

        const passwordMatch =
            await bcrypt.compare(
                currentPassword,
                user.passwordHash
            );


        if (!passwordMatch) {

            return res.status(401).json({

                success: false,

                message:
                    "Current password is incorrect."

            });

        }


        // Hash new password

        const newPasswordHash =
            await bcrypt.hash(
                newPassword,
                10
            );


        // Save only the hash

        user.passwordHash =
            newPasswordHash;


        await user.save();


        // Success

        res.json({

            success: true,

            message:
                "Password changed successfully."

        });


    } catch (error) {

        console.error(
            "Change password error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Unable to change password."

        });

    }

});

// ========================================
// CREATE ATTACK LOG
// ========================================

app.post("/api/attack-logs", async (req, res) => {

    try {

        const {
            email,
            date,
            severity,
            symptoms,
            notes
        } = req.body;


        // Check required fields

        if (!email || !severity) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and severity are required."

            });

        }


        // Create attack log

        const attackLog =
            await AttackLog.create({

                email: email,

                date:
                    date || new Date(),

                severity:
                    severity,

                symptoms:
                    symptoms || "",

                notes:
                    notes || ""

            });


        res.status(201).json({

            success: true,

            message:
                "Attack log saved successfully.",

            attackLog: attackLog

        });


    } catch (error) {

        console.error(
            "Attack log error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Unable to save attack log."

        });

    }

});

// ========================================
// GET USER ATTACK LOGS
// ========================================

app.get(
    "/api/attack-logs/:email",
    async (req, res) => {

        try {

            const email =
                req.params.email;

            const attackLogs =
                await AttackLog.find({
                    email: email
                }).sort({
                    date: -1
                });

            res.json({

                success: true,

                attackLogs:
                    attackLogs

            });

        } catch (error) {

            console.error(
                "Fetch attack logs error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Unable to load attack logs."

            });

        }

    }
);



// ========================================
// DELETE ATTACK LOG
// ========================================

app.delete(
    "/api/attack-logs/:id",
    async (req, res) => {

        try {

            const id =
                req.params.id;


            const deletedLog =
                await AttackLog.findByIdAndDelete(
                    id
                );


            if (!deletedLog) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Attack log not found."

                });

            }


            res.json({

                success: true,

                message:
                    "Attack log deleted successfully."

            });


        } catch (error) {

            console.error(
                "Delete attack log error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to delete attack log."

            });

        }

    }
);

// ========================================
// UPDATE ATTACK LOG
// ========================================

app.put(
    "/api/attack-logs/:id",
    async (req, res) => {

        try {

            const id =
                req.params.id;

            const {
                date,
                severity,
                symptoms,
                notes
            } = req.body;


            const updatedLog =
                await AttackLog.findByIdAndUpdate(
                    id,
                    {
                        date: date,
                        severity: severity,
                        symptoms: symptoms,
                        notes: notes
                    },
                    {
                        new: true
                    }
                );


            if (!updatedLog) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Attack log not found."

                });

            }


            res.json({

                success: true,

                message:
                    "Attack log updated successfully.",

                attackLog:
                    updatedLog

            });


        } catch (error) {

            console.error(
                "Update attack log error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to update attack log."

            });

        }

    }
);
// ========================================
// UPDATE ATTACK LOG
// ========================================

app.put(
    "/api/attack-logs/:id",
    async (req, res) => {

        try {

            const id =
                req.params.id;


            const {
                date,
                severity,
                symptoms,
                notes
            } = req.body;


            const updatedLog =
                await AttackLog.findByIdAndUpdate(
                    id,
                    {
                        date: date,
                        severity: severity,
                        symptoms: symptoms,
                        notes: notes
                    },
                    {
                        new: true
                    }
                );


            if (!updatedLog) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Attack log not found."

                });

            }


            res.json({

                success: true,

                message:
                    "Attack log updated successfully.",

                attackLog:
                    updatedLog

            });


        } catch (error) {

            console.error(
                "Update attack log error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to update attack log."

            });

        }

    }
);
// ========================================
// CREATE MEDICATION
// ========================================

app.post("/api/medications", async (req, res) => {

    try {

        const {
            email,
            name,
            dosage,
            schedule,
            time,
            notes,
            expiryDate,
            quantity
        } = req.body;


        // Check required fields
        if (
            !email ||
            !name ||
            !dosage ||
            !schedule
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Email, medication name, dosage and schedule are required."
            });

        }


        // Create medication
        const medication =
            await Medication.create({

                email: email,

                name: name,

                dosage: dosage,

                schedule: schedule,
                time: time,

                notes: notes || "",

                expiryDate:
                    expiryDate || null,

                quantity:
                    quantity || 0

            });


        // Send response
        res.status(201).json({

            success: true,

            message:
                "Medication saved successfully.",

            medication: medication

        });


    } catch (error) {

        console.error(
            "Medication error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Unable to save medication."

        });

    }

});
// ========================================
// GET USER MEDICATIONS
// ========================================

app.get(
    "/api/medications/:email",
    async (req, res) => {

        try {

            const email =
                req.params.email;


            const medications =
                await Medication.find({
                    email: email
                }).sort({
                    createdAt: -1
                });


            res.json({

                success: true,

                medications:
                    medications

            });


        } catch (error) {

            console.error(
                "Fetch medications error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to load medications."

            });
            

        }

    }
);
// ========================================
// UPDATE MEDICATION ADHERENCE
// ========================================

app.patch(
    "/api/medications/:id/adherence",
    async (req, res) => {

        try {

            const {
                status
            } = req.body;


            // Check valid status
            if (
                ![
                    "Pending",
                    "Taken",
                    "Missed"
                ].includes(status)
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid adherence status."
                });

            }


            // Find medication
            const medication =
                await Medication.findByIdAndUpdate(
                    req.params.id,

                    {
                        adherenceStatus:
                            status
                    },

                    {
                        new: true
                    }
                );


            // Medication not found
            if (!medication) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Medication not found."
                });

            }


            // Success
            res.json({

                success: true,

                message:
                    "Medication adherence updated.",

                medication:
                    medication

            });


        } catch (error) {

            console.error(
                "Adherence update error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Server error while updating adherence."

            });

        }

    }
);
// ========================================
// DELETE MEDICATION
// ========================================

app.delete(
    "/api/medications/:id",
    async (req, res) => {

        try {

            const id =
                req.params.id;


            const deletedMedication =
                await Medication.findByIdAndDelete(
                    id
                );


            if (!deletedMedication) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Medication not found."

                });

            }


            res.json({

                success: true,

                message:
                    "Medication deleted successfully."

            });


        } catch (error) {

            console.error(
                "Delete medication error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to delete medication."

            });

        }

    }
);
// ========================================
// UPDATE MEDICATION
// ========================================

app.put(
    "/api/medications/:id",
    async (req, res) => {

        try {

            const id =
                req.params.id;

            const {
                name,
                dosage,
                schedule,
                time,
                notes,
                expiryDate,
                quantity
            } = req.body;


            const updatedMedication =
                await Medication.findByIdAndUpdate(
                    id,

                    {
                        name: name,
                        dosage: dosage,
                        schedule: schedule,
                        time: time,
                        notes: notes || "",
                        expiryDate: expiryDate || null,
                        quantity: Number(quantity) || 0
                    },

                    {
                        new: true
                    }
                );


            if (!updatedMedication) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Medication not found."

                });

            }


            res.json({

                success: true,

                message:
                    "Medication updated successfully.",

                medication:
                    updatedMedication

            });


        } catch (error) {

            console.error(
                "Update medication error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to update medication."

            });

        }

    }
);
// ========================================
// CALENDAR EVENTS API
// ========================================

// CREATE CALENDAR EVENT

app.post("/api/calendar-events", async (req, res) => {

    try {

        const {
            email,
            title,
            date,
            time,
            type
        } = req.body;


        // Check required fields

        if (
            !email ||
            !title ||
            !date ||
            !time ||
            !type
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Email, title, date, time and event type are required."

            });

        }


        // Create calendar event

        const calendarEvent =
            await CalendarEvent.create({

                email: email,

                title: title,

                date: date,

                time: time,

                type: type

            });


        // Send response

        res.status(201).json({

            success: true,

            message:
                "Calendar event saved successfully.",

            event:
                calendarEvent

        });


    } catch (error) {

        console.error(
            "Calendar event error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Unable to save calendar event."

        });

    }

});


// ========================================
// GET USER CALENDAR EVENTS
// ========================================

app.get(
    "/api/calendar-events/:email",
    async (req, res) => {

        try {

            const email =
                req.params.email;


            const events =
                await CalendarEvent.find({

                    email: email

                }).sort({

                    date: 1,
                    time: 1

                });


            res.json({

                success: true,

                events:
                    events

            });


        } catch (error) {

            console.error(
                "Fetch calendar events error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to load calendar events."

            });

        }

    }
);


// ========================================
// UPDATE CALENDAR EVENT
// ========================================

app.put(
    "/api/calendar-events/:id",
    async (req, res) => {

        try {

            const {
                title,
                date,
                time,
                type
            } = req.body;


            const updatedEvent =
                await CalendarEvent.findByIdAndUpdate(

                    req.params.id,

                    {
                        title: title,
                        date: date,
                        time: time,
                        type: type
                    },

                    {
                        new: true
                    }

                );


            if (!updatedEvent) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Calendar event not found."

                });

            }


            res.json({

                success: true,

                message:
                    "Calendar event updated successfully.",

                event:
                    updatedEvent

            });


        } catch (error) {

            console.error(
                "Update calendar event error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to update calendar event."

            });

        }

    }
);


// ========================================
// DELETE CALENDAR EVENT
// ========================================

app.delete(
    "/api/calendar-events/:id",
    async (req, res) => {

        try {

            const deletedEvent =
                await CalendarEvent.findByIdAndDelete(
                    req.params.id
                );


            if (!deletedEvent) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Calendar event not found."

                });

            }


            res.json({

                success: true,

                message:
                    "Calendar event deleted successfully."

            });


        } catch (error) {

            console.error(
                "Delete calendar event error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to delete calendar event."

            });

        }

    }
);
// ========================================
// AIR QUALITY API
// ========================================

app.get("/api/air-quality", async (req, res) => {

    try {

        // Get location from browser
        // Bengaluru is used as fallback
        const latitude = parseFloat(req.query.latitude) || 12.9716;
        const longitude = parseFloat(req.query.longitude) || 77.5946;

        const airQualityURL =
            `https://air-quality-api.open-meteo.com/v1/air-quality` +
            `?latitude=${latitude}` +
            `&longitude=${longitude}` +
            `&current=us_aqi,pm2_5,pm10` +
            `&timezone=auto`;

        const weatherURL =
            `https://api.open-meteo.com/v1/forecast` +
            `?latitude=${latitude}` +
            `&longitude=${longitude}` +
            `&current=temperature_2m,relative_humidity_2m` +
            `&timezone=auto`;

        const [airResponse, weatherResponse] = await Promise.all([
            fetch(airQualityURL),
            fetch(weatherURL)
        ]);

        if (!airResponse.ok || !weatherResponse.ok) {
            throw new Error("Failed to fetch environmental data");
        }

        const airData = await airResponse.json();
        const weatherData = await weatherResponse.json();

        let locationName = "Current Location";

    try {

        const locationResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=10`,
            {
                headers: {
                    "User-Agent": "Respira Respiratory Health App"
                }
            }
        );

        if (locationResponse.ok) {

            const locationData = await locationResponse.json();

            locationName =
                locationData.address?.city ||
                locationData.address?.town ||
                locationData.address?.village ||
                locationData.address?.state_district ||
                "Current Location";
        }

    } catch (locationError) {

        console.warn(
            "Unable to determine city name:",
            locationError.message
        );

    }


    res.json({
        success: true,
        location: locationName,
        latitude: latitude,
        longitude: longitude,
        aqi: airData.current.us_aqi,
        pm25: airData.current.pm2_5,
        pm10: airData.current.pm10,
        temperature: weatherData.current.temperature_2m,
        humidity: weatherData.current.relative_humidity_2m,
        updatedAt: new Date().toISOString()
    });

    } catch (error) {

        console.error("Air quality error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to fetch air quality data"
        });

    }

});
// ========================================
// AI / ML PREDICTION API
// ========================================

app.post("/api/ai/predict", (req, res) => {

    const {
        recent_attacks,
        average_severity,
        medication_adherence,
        aqi
    } = req.body;


    const pythonProcess = spawn(
        "python",
        [
            "ai/predict.py"
        ],
        {
            cwd: __dirname
        }
    );


    let output = "";
    let errorOutput = "";


    // Send input to Python

    pythonProcess.stdin.write(
        JSON.stringify({
            recent_attacks:
                recent_attacks ?? 0,

            average_severity:
                average_severity ?? 0,

            medication_adherence:
                medication_adherence ?? 100,

            aqi:
                aqi ?? 50
        })
    );


    pythonProcess.stdin.end();


    // Receive Python output

    pythonProcess.stdout.on(
        "data",
        (data) => {

            output +=
                data.toString();

        }
    );


    // Receive Python errors

    pythonProcess.stderr.on(
        "data",
        (data) => {

            errorOutput +=
                data.toString();

        }
    );


    // Python process finished

    pythonProcess.on(
        "close",
        (code) => {

            if (code !== 0) {

                console.error(
                    "AI prediction error:",
                    errorOutput
                );


                return res.status(500).json({

                    success: false,

                    error:
                        "AI prediction failed."

                });

            }


            try {

                const result =
                    JSON.parse(
                        output
                    );


                res.json(result);

            } catch (error) {

                console.error(
                    "Invalid AI response:",
                    output
                );


                res.status(500).json({

                    success: false,

                    error:
                        "Invalid AI prediction response."

                });

            }

        }
    );

});
// ========================================
// START SERVER
// ========================================

app.listen(PORT, () => {

    console.log(
        `Respira backend running at http://localhost:${PORT}`
    );

});