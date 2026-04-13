import express from "express";
//import { getAllDrivers } from "../controllers/driverController.js";
import {
  driverRegister,
  driverLogin,
verifyDriverByAdmin,
} from "../controllers/driverController.js";

const router = express.Router();

router.post("/driverRegister", driverRegister);
router.post("/driverLogin", driverLogin);
//router.get("/drivers" , getAllDrivers);

// admin route
router.patch("/verifyDriver/:driverId", verifyDriverByAdmin);

export default router;
