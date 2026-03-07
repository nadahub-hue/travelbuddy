import express from "express";
import crypto from "crypto";
import nodemailer from "nodemailer";
import userModel from "../models/userModel.js";  
import bcrypt from "bcrypt";

const router = express.Router();

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("EMAIL_USER or EMAIL_PASS not set in .env file");
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await userModel.findOne({ userEmail: email });
    if (!user) {
      return res.json({ flag: false, msg: "Email not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;
    user.resetTokenExp = Date.now() + 60 * 60 * 1000; 
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Travel Buddy - Reset your password",
      html: `
        <p>Hello ${user.userName || ""},</p>
        <p>You requested to reset your password.</p>
        <p>Click the link below to reset it (valid for 1 hour):</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>If you didn’t request this, you can ignore this email.</p>
      `,
    });

    return res.json({
      flag: true,
      msg: "Reset link has been sent to your email.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ flag: false, msg: "Server error" });
  }
});

router.post("/reset-password-email", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExp: { $gt: Date.now() }, 
    });

    if (!user) {
      return res.json({ flag: false, msg: "Invalid or expired link" });
    }

    const encryptedPassword = await bcrypt.hash(newPassword, 10);
    user.userPassword = encryptedPassword;
    user.resetToken = undefined;
    user.resetTokenExp = undefined;
    await user.save();

    return res.json({ flag: true, msg: "Password has been reset." });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ flag: false, msg: "Server error" });
  }
});

export default router;
