import asyncHandler from "express-async-handler";
import Message from "../models/Message.js";
import { ApiError } from "../utils/ApiError.js";
import { notify } from "../utils/notify.js";

// GET /api/messages/threads — one row per conversation partner
export const listThreads = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const messages = await Message.find({ $or: [{ sender: userId }, { receiver: userId }] })
    .sort({ createdAt: -1 })
    .populate("sender", "name avatarUrl")
    .populate("receiver", "name avatarUrl")
    .populate("item", "title slug images");

  const threads = new Map();
  for (const m of messages) {
    const other = String(m.sender._id) === String(userId) ? m.receiver : m.sender;
    const key = `${other._id}:${m.item?._id || "general"}`;
    if (!threads.has(key)) {
      threads.set(key, {
        participant: other,
        item: m.item,
        lastMessage: m,
        unreadCount: 0,
      });
    }
    if (String(m.receiver._id) === String(userId) && !m.read) {
      threads.get(key).unreadCount += 1;
    }
  }

  res.json({ success: true, threads: Array.from(threads.values()) });
});

// GET /api/messages/with/:userId?itemId=
export const getConversation = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { userId: otherId } = req.params;
  const { itemId } = req.query;

  const filter = {
    $or: [
      { sender: userId, receiver: otherId },
      { sender: otherId, receiver: userId },
    ],
  };
  if (itemId) filter.item = itemId;

  const messages = await Message.find(filter).sort({ createdAt: 1 });

  await Message.updateMany({ sender: otherId, receiver: userId, read: false }, { read: true });

  res.json({ success: true, messages });
});

// POST /api/messages
export const sendMessage = asyncHandler(async (req, res) => {
  const { receiverId, itemId, bookingId, body } = req.body;
  if (String(receiverId) === String(req.user._id)) {
    throw ApiError.badRequest("You cannot message yourself.");
  }

  const message = await Message.create({
    sender: req.user._id,
    receiver: receiverId,
    item: itemId || null,
    booking: bookingId || null,
    body,
  });

  await notify(receiverId, {
    type: "NEW_MESSAGE",
    title: `New message from ${req.user.name}`,
    message: body.slice(0, 120),
    link: `/dashboard/messages`,
  });

  res.status(201).json({ success: true, message });
});
