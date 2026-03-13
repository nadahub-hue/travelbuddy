import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

console.log("===== ENV CHECK =====");
console.log("EMAIL_USER =", process.env.EMAIL_USER);
console.log("EMAIL_PASS exists =", !!process.env.EMAIL_PASS);
console.log("PORT =", process.env.PORT);
console.log("ENV PATH =", path.join(__dirname, ".env"));
console.log("=====================");

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import session from "express-session";

import userModel from "./models/userModel.js";
import taxiDriverModel from "./models/taxiDriverModel.js";
import tripModel from "./models/tripModel.js";
import bookingModel from "./models/bookingModel.js";
import feedbackModel from "./models/feedbackModel.js";
import adminModel from "./models/adminModel.js";

import authRoutes from "./routes/authRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

const TravelBuddy_App = express();

TravelBuddy_App.use(express.json());
TravelBuddy_App.use(cors());

TravelBuddy_App.use(
  session({
    secret: process.env.SESSION_SECRET || "a-very-strong-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, 
  })
);

TravelBuddy_App.use(authRoutes);
TravelBuddy_App.use(paymentRoutes);

try {
  const TravelBuddy_App_ConnectionString = `mongodb+srv://${process.env.MONGODB_USERID}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/${process.env.MONGODB_DATABASE}`;

  await mongoose.connect(TravelBuddy_App_ConnectionString, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    family: 4,
  });

  console.log("Database Connection Success !");
} catch (err) {
  console.error("Database Connection Failed:", err);
  process.exit(1);
}

const PORT = process.env.PORT || 7500;
TravelBuddy_App.listen(PORT, () => {
  console.log(`Travel Buddy Server running at port ${PORT} ...!`);
});

TravelBuddy_App.post("/userRegister", async (req, res) => {
  try {
    const exist = await userModel.findOne({ userEmail: req.body.email });
    if (exist) {
      return res.json({ serverMsg: "User already exist !", flag: false });
    }

    const encryptedPassword = await bcrypt.hash(req.body.pwd, 10);

    await userModel.create({
      userName: req.body.fullName,
      userPhone: req.body.phone,
      userEmail: req.body.email,
      userPassword: encryptedPassword,
      userGender: req.body.gender,
      preferredGender: req.body.preferredGender || "any",
    });

    res.json({ serverMsg: "Registration Success !", flag: true });
  } catch (err) {
    console.error("userRegister error:", err);
    res.status(500).json({ serverMsg: "Registration error", flag: false });
  }
});

TravelBuddy_App.post("/userLogin", async (req, res) => {
  try {
    const userExist = await userModel.findOne({
      userEmail: req.body.userEmail,
    });

    if (!userExist) {
      return res.json({ serverMsg: "User not found !", loginStatus: false });
    }

    const matchPassword = await bcrypt.compare(
      req.body.userPassword,
      userExist.userPassword
    );

    if (!matchPassword) {
      return res.json({
        serverMsg: "Incorrect Password !",
        loginStatus: false,
      });
    }

    res.json({ serverMsg: "Welcome", loginStatus: true, user: userExist });
  } catch (err) {
    console.error("userLogin error:", err);
    res.status(500).json({ serverMsg: "Login error", loginStatus: false });
  }
});

TravelBuddy_App.post("/driverRegister", async (req, res) => {
  try {
    const driverExist = await taxiDriverModel.findOne({
      driverEmail: req.body.driverEmail,
    });

    if (driverExist) {
      return res.json({
        serverMsg: "Driver already exists !",
        flag: false,
      });
    }

    const encryptedPassword = await bcrypt.hash(
      req.body.driverPassword,
      10
    );

    await taxiDriverModel.create({
      driverName: req.body.driverName,
      driverPhone: req.body.driverPhone,
      driverEmail: req.body.driverEmail,
      driverPassword: encryptedPassword,
    });

    res.json({ serverMsg: "Driver Registration Success !", flag: true });
  } catch (err) {
    console.error("driverRegister error:", err);
    res.status(500).json({
      serverMsg: "Driver Registration error",
      flag: false,
    });
  }
});

TravelBuddy_App.post("/driverLogin", async (req, res) => {
  try {
    const driver = await taxiDriverModel.findOne({
      driverEmail: req.body.driverEmail,
    });

    if (!driver) {
      return res.json({
        serverMsg: "Driver not found !",
        loginStatus: false,
      });
    }

    const matchPassword = await bcrypt.compare(
      req.body.driverPassword,
      driver.driverPassword
    );

    if (!matchPassword) {
      return res.json({
        serverMsg: "Incorrect Password !",
        loginStatus: false,
      });
    }

    res.json({
      serverMsg: "Welcome Driver",
      loginStatus: true,
      driver,
    });
  } catch (err) {
    console.error("driverLogin error:", err);
    res.status(500).json({
      serverMsg: "Driver login error",
      loginStatus: false,
    });
  }
});

TravelBuddy_App.post("/adminLogin", async (req, res) => {
  try {
    const adminExist = await adminModel.findOne({
      adminEmail: req.body.adminEmail,
    });

    if (!adminExist) {
      return res.json({
        serverMsg: "Admin not found !",
        loginStatus: false,
      });
    }

    const matchPassword = await bcrypt.compare(
      req.body.adminPassword,
      adminExist.adminPassword
    );

    if (!matchPassword) {
      return res.json({
        serverMsg: "Incorrect Password !",
        loginStatus: false,
      });
    }

    res.json({
      serverMsg: "Welcome",
      loginStatus: true,
      admin: adminExist,
    });
  } catch (err) {
    console.error("adminLogin error:", err);
    res.status(500).json({
      serverMsg: "Login error",
      loginStatus: false,
    });
  }
});
TravelBuddy_App.post("/createTrip", async (req, res) => {
  try {
    const newTrip = {
      ownerEmail: req.body.ownerEmail,
      fromLocation: req.body.fromLocation,
      toLocation: req.body.toLocation,
      travelDate: req.body.travelDate,
      travelTime: req.body.travelTime,
      genderRestriction: req.body.genderRestriction || "any",
      estimatedFare: req.body.estimatedFare || 0,
      maxCompanions: req.body.maxCompanions || 3
    }
    await tripModel.create(newTrip)
    res.json({ serverMsg: "Trip created", flag: true })
  } catch (err) {
    console.log("createTrip error:", err)
    res.status(500).json({ serverMsg: "Trip creation error", flag: false })
  }
})

TravelBuddy_App.get("/searchTrips", async (req, res) => {
  try {
    const { fromLocation, toLocation, travelDate, gender } = req.query
    const query = {}
    
    if (fromLocation) query.fromLocation = fromLocation
    if (toLocation) query.toLocation = toLocation

    if (travelDate) {
      const d = new Date(travelDate)
      const next = new Date(d)
      next.setDate(next.getDate() + 1)
      query.travelDate = { $gte: d, $lt: next }
    }
    if (gender && gender !== "any") {
      query.genderRestriction = { $in: ["any", gender] }
    }

    const trips = await tripModel.find(query)
    res.send(trips)
  } catch (err) {
    console.log("searchTrips error:", err)
    res.status(500).json({ serverMsg: "Search trips error" })
  }
})

TravelBuddy_App.post("/confirmBooking", async (req, res) => {
  try {
    const { tripId, participantEmails } = req.body
    const trip = await tripModel.findById(tripId)

    if (!trip) {
      return res.status(404).json({ serverMsg: "Trip not found" })
    }

    const participants = participantEmails && participantEmails.length ? participantEmails : []
    const totalFare = trip.estimatedFare || 0
    const farePerPerson = participants.length ? totalFare / participants.length : totalFare

    const booking = await bookingModel.create({
      tripId,
      participantEmails: participants,
      totalFare,
      farePerPerson,
      status: "confirmed"
    })

    res.json({ serverMsg: "Booking confirmed", booking })
  } catch (err) {
    console.log("confirmBooking error:", err)
    res.status(500).json({ serverMsg: "Booking error" })
  }
})

TravelBuddy_App.post("/processPayment", async (req, res) => {
  try {
    const { bookingId, amount, paymentMethod } = req.body;

    const transactionId = "TXN-" + Date.now();

    const paymentRecord = await paymentModel.create({
      bookingId,
      amount,
      paymentMethod,
      transactionId,
      paymentStatus: "success",
    });

    res.json({
      serverMsg: "Payment successful",
      paymentStatus: true,
      paymentInfo: paymentRecord
    });

  } catch (err) {
    console.log("processPayment error:", err);
    res.status(500).json({
      serverMsg: "Payment failed",
      paymentStatus: false
    });
  }
});

TravelBuddy_App.post("/sendFeedback", async (req, res) => {
  try {
    const { userEmail, rating, comment } = req.body
    await feedbackModel.create({ userEmail, rating, comment })
    res.json({ serverMsg: "Feedback saved. Thank you!" })
  } catch (err) {
    console.log("feedback error:", err)
    res.status(500).json({ serverMsg: "Feedback error" })
  }
})

TravelBuddy_App.post("/logout", (req, res) => {
  req.session?.destroy((err) => {
    if (err) {
      console.log("Logout error:", err);
      return res.status(500).json({ serverMsg: "Logout failed" });
    }
    res.clearCookie("connect.sid");
    res.json({ serverMsg: "Logged out successfully" });
  });
});

TravelBuddy_App.get("/", (req, res) => {
  res.send("Travel Buddy API is running.")
})
