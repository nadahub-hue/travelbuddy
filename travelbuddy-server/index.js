import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import dotenv from "dotenv"
import bcrypt from "bcrypt"

import userModel from "./models/userModel.js"
import taxiDriverModel from "./models/taxiDriverModel.js"
import tripModel from "./models/tripModel.js"
import bookingModel from "./models/bookingModel.js"
import feedbackModel from "./models/feedbackModel.js"
import adminModel from "./models/adminModel.js"
import authRoutes from "./routes/authRoutes.js";
import paymentModel from "./models/paymentModel.js";  

dotenv.config()

const EMAIL_USER = process.env.EMAIL_USER || null;
const EMAIL_PASS = process.env.EMAIL_PASS || null;

if (!EMAIL_USER || !EMAIL_PASS) {
  console.warn("⚠️ EMAIL_USER or EMAIL_PASS not set. Email features may be disabled.");
}

const TravelBuddy_App = new express()
TravelBuddy_App.use(express.json())
TravelBuddy_App.use(cors())
TravelBuddy_App.use(authRoutes);

try {
    const TravelBuddy_App_ConnectionString = `mongodb+srv://${process.env.MONGODB_USERID}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/${process.env.MONGODB_DATABASE}`
    await mongoose.connect(TravelBuddy_App_ConnectionString, {
        serverSelectionTimeoutMS: 5000, 
        socketTimeoutMS: 45000, 
        maxPoolSize: 10, 
        family: 4 
    })
    console.log("Database Connection Success !")
} catch (err) {
    console.log("Database Connection Failed:", err)
    process.exit(1) 
}

TravelBuddy_App.listen(process.env.PORT || 7500, () => {
    try {
        console.log(`Travel Buddy Server running at port ${process.env.PORT || 7500} ...!`)
    } catch (err) {
        console.log(err)
    }
})

TravelBuddy_App.post("/userRegister", async (req, res) => {
  try {
    const exist = await userModel.findOne({ userEmail: req.body.email })
    if (exist) {
      res.json({ serverMsg: "User already exist !", flag: false })
    } else {
      const encryptedPassword = await bcrypt.hash(req.body.pwd, 10)
      const newUser = {
        userName: req.body.fullName,
        userPhone: req.body.phone,
        userEmail: req.body.email,
        userPassword: encryptedPassword,
        userGender: req.body.gender,
        preferredGender: req.body.preferredGender || "any"
      }
      await userModel.create(newUser)
      res.json({ serverMsg: "Registration Success !", flag: true })
    }
  } catch (err) {
    console.log("userRegister error:", err)
    res.status(500).json({ serverMsg: "Registration error", flag: false })
  }
})

TravelBuddy_App.post("/userLogin", async (req, res) => {
  try {
    const userEmail = req.body.userEmail
    const userExist = await userModel.findOne({ userEmail })
    if (!userExist) {
      res.json({ serverMsg: "User not found !", loginStatus: false })
    } else {
      const matchPassword = await bcrypt.compare(req.body.userPassword, userExist.userPassword)
      if (!matchPassword) {
        res.json({ serverMsg: "Incorrect Password !", loginStatus: false })
      } else {
        res.json({ serverMsg: "Welcome", loginStatus: true, user: userExist })
      }
    }
  } catch (err) {
    console.log("userLogin error:", err)
    res.status(500).json({ serverMsg: "Login error", loginStatus: false })
  }
})

// ================== DRIVER REGISTRATION ==================
TravelBuddy_App.post("/driverRegister", async (req, res) => {
  try {
    const driverExist = await taxiDriverModel.findOne({ driverEmail: req.body.driverEmail })
    if (driverExist) {
      res.json({ serverMsg: "Driver already exists !", flag: false })
    } else {
      const encryptedPassword = await bcrypt.hash(req.body.driverPassword, 10)
      const newDriver = {
        driverName: req.body.driverName,
        driverPhone: req.body.driverPhone,
        driverEmail: req.body.driverEmail,
        driverPassword: encryptedPassword,
      }
      await taxiDriverModel.create(newDriver)
      res.json({ serverMsg: "Driver Registration Success !", flag: true })
    }
  } catch (err) {
    console.log("driverRegister error:", err)
    res.status(500).json({ serverMsg: "Driver Registration error", flag: false })
  }
})

// ================== DRIVER LOGIN ==================
TravelBuddy_App.post("/driverLogin", async (req, res) => {
  try {
    const driverEmail = req.body.driverEmail
    const driver = await taxiDriverModel.findOne({ driverEmail })
    if (!driver) {
      res.json({ serverMsg: "Driver not found !", loginStatus: false })
    } else {
      const matchPassword = await bcrypt.compare(req.body.driverPassword, driver.driverPassword)
      if (!matchPassword) {
        res.json({ serverMsg: "Incorrect Password !", loginStatus: false })
      } else {
        res.json({ serverMsg: "Welcome Driver", loginStatus: true, driver })
      }
    }
  } catch (err) {
    console.log("driverLogin error:", err)
    res.status(500).json({ serverMsg: "Driver login error", loginStatus: false })
  }
})

// ================== ADMIN LOGIN ==================
TravelBuddy_App.post("/adminLogin", async (req, res) => {
  try {
    const adminEmail = req.body.adminEmail
    const adminExist = await adminModel.findOne({ adminEmail })
    if (!adminExist) {
      res.json({ serverMsg: "Admin not found !", loginStatus: false })
    } else {
      const matchPassword = await bcrypt.compare(req.body.adminPassword, adminExist.adminPassword)
      if (!matchPassword) {
        res.json({ serverMsg: "Incorrect Password !", loginStatus: false })
      } else {
        res.json({ serverMsg: "Welcome", loginStatus: true, admin: adminExist })
      }
    }
  } catch (err) {
    console.log("adminLogin error:", err)
    res.status(500).json({ serverMsg: "Login error", loginStatus: false })
  }
})

// ================== TRIPS ==================
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

// ================== BOOKING ==================
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
