import express from "express";
import {
  driverRegister,
  driverLogin,
verifyDriverByAdmin,
} from "../controllers/driverController_fixed.js";

const router = express.Router();

router.post("/driverRegister", driverRegister);
router.post("/driverLogin", driverLogin);

// admin route
router.patch("/verifyDriver/:driverId", verifyDriverByAdmin);

export default router;