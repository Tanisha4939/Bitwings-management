const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dns = require("dns");

require("dotenv").config();

dns.setServers(
    (process.env.DNS_SERVERS || "1.1.1.1,8.8.8.8")
        .split(",")
        .map((server) => server.trim())
        .filter(Boolean)
);

// ===============================
// ROUTES
// ===============================

const studentRoutes = require("./routes/studentRoutes");
const feeRoutes = require("./routes/feeRoutes");
const marketingRoutes = require("./routes/marketingRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const followupRoutes = require("./routes/followupRoutes");

// ===============================
// APP
// ===============================

const app = express();

// ===============================
// MIDDLEWARE
// ===============================

const allowedOrigins = (process.env.CLIENT_URL || "*")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error("Origin is not allowed by CORS"));
        },
    })
);
app.use(express.json());

// ===============================
// API ROUTES
// ===============================

app.use("/api/students", studentRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/marketing", marketingRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/followups", followupRoutes);

// ===============================
// HOME ROUTE
// ===============================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Bitwings Management Backend is running 🚀",
    });
});

// ===============================
// 404 ROUTE
// ===============================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found",
    });
});

// ===============================
// ERROR HANDLER
// ===============================

app.use((error, req, res, next) => {
    console.error("SERVER ERROR:", error);

    res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
    });
});

// ===============================
// PORT
// ===============================

const PORT = process.env.PORT || 5000;

// ===============================
// MONGODB CONNECTION
// ===============================

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {

        console.log("=================================");
        console.log("MongoDB Connected Successfully ✅");
        console.log("=================================");

        app.listen(PORT, "0.0.0.0", () => {

            console.log(
                `Bitwings Backend Running on port ${PORT} 🚀`
            );

            console.log(
                `Student API: /api/students`
            );

            console.log(
                `Fees API: /api/fees`
            );

            console.log(
                `Marketing API: /api/marketing`
            );

            console.log(
                `Expense API: /api/expenses`
            );

           console.log(
                `Followup API: /api/followups`
            );
        });

    })
    .catch((error) => {

        console.error("=================================");
        console.error("MongoDB Connection Failed ❌");
        console.error(error.message);
        console.error("=================================");

        process.exit(1);

    });