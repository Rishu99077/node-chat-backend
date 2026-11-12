
import { Timestamp } from 'firebase-admin/firestore';
import { RowDataPacket } from 'mysql2';
import { db } from '../config/database';
import { firestore } from '../config/firebase';

interface ChatMessage {
    messageId: string;
    senderId: number;
    text: string;
    createdAt: string | null;
}

// API 3: Get messages from Firestore
export const getMessages = async (
    chatId: number,
    limit: number
): Promise<ChatMessage[]> => {

    // Step 1: Check whether chat exists in MySQL
    const [chats] = await db.query<RowDataPacket[]>(
        'SELECT id FROM chats WHERE id = ?',
        [chatId]
    );

    if (chats.length === 0) {
        throw new Error('Chat not found');
    }

    // Step 2: Get messages from Firestore
    const messagesRef = firestore
        .collection('chats')
        .doc(String(chatId))
        .collection('messages');

    const snapshot = await messagesRef
        .orderBy('createdAt', 'asc')
        .limit(limit)
        .get();

    // Step 3: Format response
    const messages: ChatMessage[] = snapshot.docs.map((doc) => {
        const data = doc.data();

        return {
            messageId: doc.id,
            senderId: data.senderId as number,
            text: data.text as string,
            createdAt:
                data.createdAt instanceof Timestamp
                    ? data.createdAt.toDate().toISOString()
                    : null
        };
    });

    return messages;
};

import { FieldValue } from 'firebase-admin/firestore';

// API 4: Mark message as read
export const markMessageAsRead = async (
    chatId: number,
    messageId: string,
    userId: number
): Promise<void> => {

    // Check chat membership in MySQL
    const [members] = await db.query<RowDataPacket[]>(
        'SELECT user_id FROM chat_members WHERE chat_id = ? AND user_id = ?',
        [chatId, userId]
    );

    if (members.length === 0) {
        throw new Error('User is not a member of this chat');
    }

    // Find message in Firestore
    const messageRef = firestore
        .collection('chats')
        .doc(String(chatId))
        .collection('messages')
        .doc(messageId);

    const message = await messageRef.get();

    if (!message.exists) {
        throw new Error('Message not found');
    }

    // Update read receipt
    await messageRef.update({
        [`readBy.${userId}.readAt`]: FieldValue.serverTimestamp()
    });
};

export const updateLastSeen = async (
    chatId: number,
    userId: number,
    messageId: string
): Promise<void> => {

    // 1. Check whether user belongs to this chat
    const [members] = await db.query<RowDataPacket[]>(
        'SELECT user_id FROM chat_members WHERE chat_id = ? AND user_id = ?',
        [chatId, userId]
    );

    if (members.length === 0) {
        throw new Error('User is not a member of this chat');
    }

    // 2. Check whether message exists
    const messageRef = firestore
        .collection('chats')
        .doc(String(chatId))
        .collection('messages')
        .doc(messageId);

    const message = await messageRef.get();

    if (!message.exists) {
        throw new Error('Message not found');
    }

    // 3. Update last seen in Firestore
    await firestore
        .collection('chats')
        .doc(String(chatId))
        .collection('lastSeen')
        .doc(String(userId))
        .set({
            userId,
            messageId,
            lastSeenAt: FieldValue.serverTimestamp()
        });
};
