import ChatModel from "../models/ChatModel.js"

export const sendMessage = async (req, res) => {
    try {
        const { senderId, receiverId, text } = req.body;
        const chat = new ChatModel({ senderId, receiverId, text });
        await chat.save();
        res.json({ success: true, chat });
    }
    catch (err) {
        res.status(500).json({ success: false, msg: "Send failed" });
    }
}

export const getMessages = async (req, res) => {
    try {
        const { user1, user2 } = req.params;
        const chat = await ChatModel.find({
            $or: [
                { senderId: user1, receiverId: user2 },
                { senderId: user2, receiverId: user1 },
            ],
        }).sort({ createdAt: 1 });
        
        res.json({ success: true, chat });
    } catch (err) {
        res.status(500).json({ success: false, msg: "Fetch failed" });
    }}