import express from "express";
import { sendMessage, getMessages } from "../controllers/chatController.js";

const chatRoutes = express.Router();

chatRoutes.post("/send", sendMessage);
chatRoutes.get("/:user1/:user2", getMessages);

export default chatRoutes;