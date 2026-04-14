import express from "express";
import {
  driverRegister,
  driverLogin,
verifyDriverByAdmin,
} from "../controllers/driverController.js";
 
const router = express.Router();
 
router.post("/driverRegister", driverRegister);
router.post("/driverLogin", driverLogin);
 
router.patch("/verifyDriver/:driverId", verifyDriverByAdmin);
 
export default router;
 