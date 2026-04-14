import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import session from "express-session";
import http from "http";
import { Server } from "socket.io";

import driverRoutes from "./routes/driverRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

import userModel from "./models/userModel.js";
import taxiDriverModel from "./models/taxiDriverModel.js";
import tripModel from "./models/tripModel.js";
import bookingModel from "./models/bookingModel.js";
import feedbackModel from "./models/feedbackModel.js";
import adminModel from "./models/adminModel.js";
import paymentModel from "./models/paymentModel.js";

/* -------------------- Setup -------------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const server = http.createServer(app);

/* -------------------- Debug env -------------------- */
console.log("PORT:", process.env.PORT);
console.log("CLIENT_URL:", process.env.CLIENT_URL);
console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI);

/* -------------------- Middleware -------------------- */
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
    },
  })
);

/* -------------------- Socket.IO -------------------- */
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  },
});

const users = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (userId) => {
    users[userId] = socket.id;
  });

  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const receiverSocket = users[receiverId];

    if (receiverSocket) {
      io.to(receiverSocket).emit("receiveMessage", {
        senderId,
        text,
      });
    }
  });

  socket.on("disconnect", () => {
    for (const id in users) {
      if (users[id] === socket.id) {
        delete users[id];
        break;
      }
    }
  });
});

/* -------------------- Routes -------------------- */
app.use(authRoutes);
app.use(paymentRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/chat", chatRoutes);

/* -------------------- User Register -------------------- */
app.post("/userRegister", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        flag: false,
        serverMsg: "Database not connected",
      });
    }

    const exist = await userModel.findOne({ userEmail: req.body.email });

    if (exist) {
      return res.json({
        serverMsg: "User already exists!",
        flag: false,
      });
    }

    const hashed = await bcrypt.hash(req.body.pwd, 10);

    await userModel.create({
      userName: req.body.fullName,
      userPhone: req.body.phone,
      userEmail: req.body.email,
      userPassword: hashed,
      userGender: req.body.gender,
      preferredGender: req.body.preferredGender || "any",
    });

    return res.json({
      serverMsg: "Registration Success!",
      flag: true,
    });
  } catch (err) {
    console.error("userRegister error:", err);
    return res.status(500).json({
      serverMsg: "Registration error",
      flag: false,
    });
  }
});

/* -------------------- User Login -------------------- */
app.post("/userLogin", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        loginStatus: false,
        serverMsg: "Database not connected",
      });
    }

    const user = await userModel.findOne({
      userEmail: req.body.userEmail,
    });

    if (!user) {
      return res.json({
        loginStatus: false,
        serverMsg: "User not found",
      });
    }

    const match = await bcrypt.compare(
      req.body.userPassword,
      user.userPassword
    );

    if (!match) {
      return res.json({
        loginStatus: false,
        serverMsg: "Wrong password",
      });
    }

    return res.json({
      loginStatus: true,
      serverMsg: "Welcome",
      user,
    });
  } catch (err) {
    console.error("userLogin error:", err);
    return res.status(500).json({
      loginStatus: false,
      serverMsg: "Login error",
    });
  }
});

/* -------------------- Driver Register -------------------- */
app.post("/driverRegister", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        flag: false,
        serverMsg: "Database not connected",
      });
    }

    const exist = await taxiDriverModel.findOne({
      driverEmail: req.body.driverEmail,
    });

    if (exist) {
      return res.json({
        serverMsg: "Driver already exists!",
        flag: false,
      });
    }

    const hashed = await bcrypt.hash(req.body.driverPassword, 10);

    await taxiDriverModel.create({
      driverName: req.body.driverName,
      driverPhone: req.body.driverPhone,
      driverEmail: req.body.driverEmail,
      driverPassword: hashed,
      licenseNumber: req.body.licenseNumber,
      taxiPermitNumber: req.body.taxiPermitNumber,
      vehicleModel: req.body.vehicleModel,
      plateNumber: req.body.plateNumber,
      nationalId: req.body.nationalId,
      experienceYears: req.body.experienceYears,
      status: "pending_verification",
      isVerifiedDriver: false,
    });

    return res.json({
      serverMsg: "Registered. Wait for admin approval.",
      flag: true,
    });
  } catch (err) {
    console.error("driverRegister error:", err);
    return res.status(500).json({
      serverMsg: "Driver error",
      flag: false,
    });
  }
});

/* -------------------- Driver Login -------------------- */
 
app.post("/driverLogin", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        loginStatus: false,
        serverMsg: "Database not connected",
      });
    }

    const driver = await taxiDriverModel.findOne({
      driverEmail: req.body.driverEmail,
    });

    if (!driver) {
      return res.json({
        loginStatus: false,
        serverMsg: "Driver not found",
      });
    }

    const match = await bcrypt.compare(
      req.body.driverPassword,
      driver.driverPassword
    );

    if (!match) {
      return res.json({
        loginStatus: false,
        serverMsg: "Wrong password",
      });
    }

    if (driver.status !== "verified") {
      return res.json({
        loginStatus: false,
        serverMsg: `Driver status: ${driver.status}`,
      });
    }

    return res.json({
      loginStatus: true,
      serverMsg: "Welcome Driver",
      driver,
    });
  } catch (err) {
    console.error("driverLogin error:", err);
    return res.status(500).json({
      loginStatus: false,
      serverMsg: "Driver login error",
    });
  }
});



/* -------------------- Admin Login -------------------- */
app.post("/adminLogin", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        loginStatus: false,
        serverMsg: "Database not connected",
      });
    }

    const admin = await adminModel.findOne({
      adminEmail: req.body.adminEmail,
    });

    if (!admin) {
      return res.json({
        loginStatus: false,
        serverMsg: "Admin not found",
      });
    }

    const match = await bcrypt.compare(
      req.body.adminPassword,
      admin.adminPassword
    );

    if (!match) {
      return res.json({
        loginStatus: false,
        serverMsg: "Incorrect password",
      });
    }

    return res.json({
      loginStatus: true,
      serverMsg: "Admin login successful",
      admin: {
        _id: admin._id,
        adminName: admin.adminName,
        adminEmail: admin.adminEmail,
      },
    });
  } catch (err) {
    console.error("adminLogin error:", err);
    return res.status(500).json({
      loginStatus: false,
      serverMsg: "Admin login error",
    });
  }
});

/* -------------------- Create Trip -------------------- */
app.post("/createTrip", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        serverMsg: "Database not connected",
      });
    }

    const trip = await tripModel.create(req.body);

    return res.json({
      serverMsg: "Trip created",
      trip,
    });
  } catch (err) {
    console.error("createTrip error:", err);
    return res.status(500).json({
      serverMsg: "Trip error",
    });
  }
});

/* -------------------- Search Trips -------------------- */
app.get("/searchTrips", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        serverMsg: "Database not connected",
      });
    }

    const trips = await tripModel.find(req.query);
    return res.json(trips);
  } catch (err) {
    console.error("searchTrips error:", err);
    return res.status(500).json({
      serverMsg: "Search error",
    });
  }
});

app.post("/confirmBooking", async (req, res) => {
  try {
    console.log("BODY:", req.body);

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        serverMsg: "Database not connected",
      });
    }

    // ✅ validate tripId first
    if (!req.body.tripId || !mongoose.Types.ObjectId.isValid(req.body.tripId)) {
      return res.status(400).json({
        serverMsg: "Invalid or missing tripId",
      });
    }

    const trip = await tripModel.findById(req.body.tripId);

    if (!trip) {
      return res.status(404).json({
        serverMsg: "Trip not found",
      });
    }

    const booking = await bookingModel.create({
      ...req.body,
      status: "confirmed",
    });

    return res.json({
      serverMsg: "Booking confirmed",
      booking,
    });
  } catch (err) {
    console.error("confirmBooking error:", err);
    return res.status(500).json({
      serverMsg: "Booking error",
      error: err.message,
    });
  }
});

/* -------------------- Process Payment -------------------- */
app.post("/processPayment", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        serverMsg: "Database not connected",
      });
    }

    const payment = await paymentModel.create({
      ...req.body,
      transactionId: "TXN-" + Date.now(),
      paymentStatus: "success",
    });

    return res.json({
      serverMsg: "Payment success",
      payment,
    });
  } catch (err) {
    console.error("processPayment error:", err);
    return res.status(500).json({
      serverMsg: "Payment failed",
    });
  }
});

/* -------------------- Send Feedback -------------------- */
app.post("/sendFeedback", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        serverMsg: "Database not connected",
      });
    }

    const { userEmail, rating, comment } = req.body;

    await feedbackModel.create({
      userEmail,
      rating,
      comment,
    });

    return res.json({
      serverMsg: "Feedback saved. Thank you!",
    });
  } catch (err) {
    console.error("sendFeedback error:", err);
    return res.status(500).json({
      serverMsg: "Feedback error",
    });
  }
});

/* -------------------- Health Check -------------------- */
app.get("/", (req, res) => {
  res.send("Travel Buddy backend is running");
});

/* -------------------- Start Server -------------------- */
const PORT = process.env.PORT || 7500;
const MONGO_URI = process.env.MONGODB_URI;

async function startServer() {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGODB_URI is missing in .env");
    }

    console.log("🔌 Connecting to MongoDB...");

    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("✅ Database Connected");

    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ DB Connection Error:", err);
    process.exit(1);
  }
}

startServer();