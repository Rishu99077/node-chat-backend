
import { Request, Response } from 'express';

import { createOneToOneChat } from '../services/chat.service';
import { updateLastSeen } from '../services/message.service';
import { getUserChats } from '../services/chat.service';
import {
    sendMessage,
    getMessages
} from '../services/message.service';

// API 1: Create or get one-to-one chat
export const createChat = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { userAId, userBId } = req.body;

        if (
            !Number.isSafeInteger(Number(userAId)) ||
            !Number.isSafeInteger(Number(userBId)) ||
            Number(userAId) <= 0 ||
            Number(userBId) <= 0 ||
            Number(userAId) === Number(userBId)
        ) {
            res.status(400).json({
                success: false,
                message: 'Please provide valid and different user IDs'
            });
            return;
        }

        const chat = await createOneToOneChat(
            Number(userAId),
            Number(userBId)
        );

        res.status(200).json({
            success: true,
            message: 'Chat created or fetched successfully',
            chat
        });

    } catch (error) {
        console.error('Create chat error:', error);

        const message = error instanceof Error
            ? error.message
            : '';

        if (message === 'One or both users not found') {
            res.status(404).json({
                success: false,
                message
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create chat'
        });
    }
};


// API 2: Send chat message
export const sendChatMessage = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const chatId = Number(req.params.chatId);
        const { senderId, text } = req.body;

        if (!Number.isSafeInteger(chatId) || chatId <= 0) {
            res.status(400).json({
                success: false,
                message: 'Invalid chat ID'
            });
            return;
        }

        if (
            !Number.isSafeInteger(Number(senderId)) ||
            Number(senderId) <= 0
        ) {
            res.status(400).json({
                success: false,
                message: 'Invalid sender ID'
            });
            return;
        }

        if (typeof text !== 'string' || !text.trim()) {
            res.status(400).json({
                success: false,
                message: 'Message text is required'
            });
            return;
        }

        const messageId = await sendMessage(
            chatId,
            Number(senderId),
            text.trim()
        );

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            messageId
        });

    } catch (error) {
        console.error('Send message error:', error);

        const message = error instanceof Error
            ? error.message
            : '';

        if (message === 'Chat not found') {
            res.status(404).json({
                success: false,
                message
            });
            return;
        }

        if (message === 'Sender is not a member of this chat') {
            res.status(403).json({
                success: false,
                message
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Failed to send message'
        });
    }
};


// API 3: Get chat messages
export const getChatMessages = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const chatId = Number(req.params.chatId);

        const limit = req.query.limit === undefined
            ? 50
            : Number(req.query.limit);

        if (!Number.isSafeInteger(chatId) || chatId <= 0) {
            res.status(400).json({
                success: false,
                message: 'Invalid chat ID'
            });
            return;
        }

        if (
            !Number.isSafeInteger(limit) ||
            limit < 1 ||
            limit > 100
        ) {
            res.status(400).json({
                success: false,
                message: 'Limit must be between 1 and 100'
            });
            return;
        }

        const messages = await getMessages(chatId, limit);

        res.status(200).json({
            success: true,
            total: messages.length,
            messages
        });

    } catch (error) {
        console.error('Get messages error:', error);

        const message = error instanceof Error
            ? error.message
            : '';

        if (message === 'Chat not found') {
            res.status(404).json({
                success: false,
                message
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Failed to fetch messages'
        });
    }
};

import { markMessageAsRead } from '../services/message.service';

// API 4: Mark message as read
export const markChatMessageAsRead = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const chatId = Number(req.params.chatId);
        const messageId = req.params.messageId;
        console.log('Request Content-Type:', req.headers['content-type']);
        console.log('Request Body:', req.body);

        const userId = req.body?.userId;

        if (
            !Number.isSafeInteger(chatId) ||
            chatId <= 0 ||
            !messageId
        ) {
            res.status(400).json({
                success: false,
                message: 'Invalid chat ID or message ID'
            });
            return;
        }

        if (
            !Number.isSafeInteger(Number(userId)) ||
            Number(userId) <= 0
        ) {
            res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
            return;
        }

        await markMessageAsRead(
            chatId,
            messageId,
            Number(userId)
        );

        res.status(200).json({
            success: true,
            message: 'Message marked as read successfully'
        });

    } catch (error) {
        console.error('Mark as read error:', error);

        const message = error instanceof Error
            ? error.message
            : '';

        if (message === 'User is not a member of this chat') {
            res.status(403).json({ success: false, message });
            return;
        }

        if (message === 'Message not found') {
            res.status(404).json({ success: false, message });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Failed to mark message as read'
        });
    }
};

export const updateChatLastSeen = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const chatId = Number(req.params.chatId);
        const userId = Number(req.body?.userId);
        const messageId = req.body?.messageId;

        if (
            !Number.isSafeInteger(chatId) ||
            chatId <= 0 ||
            !Number.isSafeInteger(userId) ||
            userId <= 0 ||
            typeof messageId !== 'string' ||
            !messageId.trim()
        ) {
            res.status(400).json({
                success: false,
                message: 'Invalid chat ID, user ID or message ID'
            });
            return;
        }

        await updateLastSeen(
            chatId,
            userId,
            messageId.trim()
        );

        res.status(200).json({
            success: true,
            message: 'Last seen updated successfully'
        });

    } catch (error) {
        console.error('Update last seen error:', error);

        const message = error instanceof Error
            ? error.message
            : '';

        if (message === 'User is not a member of this chat') {
            res.status(403).json({ success: false, message });
            return;
        }

        if (message === 'Message not found') {
            res.status(404).json({ success: false, message });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Failed to update last seen'
        });
    }
};


export const getUserChatsController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const userId = Number(req.params.userId);

        if (!Number.isSafeInteger(userId) || userId <= 0) {
            res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
            return;
        }

        const chats = await getUserChats(userId);

        res.status(200).json({
            success: true,
            total: chats.length,
            chats
        });

    } catch (error) {
        console.error('Get user chats error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch user chats'
        });
    }
};

