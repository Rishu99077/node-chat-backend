import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { db } from '../config/database';

export const createOrGetChat = async (
    userAId: number,
    userBId: number
): Promise<number> => {

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Check users exist
        const [users] = await connection.query<RowDataPacket[]>(
            'SELECT id FROM users WHERE id IN (?, ?)',
            [userAId, userBId]
        );

        if (users.length !== 2) {
            throw new Error('One or both users do not exist');
        }

        // Consistent ordering prevents duplicate pairs
        const firstUser = Math.min(userAId, userBId);
        const secondUser = Math.max(userAId, userBId);

        // Find existing chat
        const [existingChats] = await connection.query<RowDataPacket[]>(
            `SELECT c.id
             FROM chats c
             INNER JOIN chat_members m1 ON c.id = m1.chat_id
             INNER JOIN chat_members m2 ON c.id = m2.chat_id
             WHERE m1.user_id = ?
             AND m2.user_id = ?
             AND (
                 SELECT COUNT(*)
                 FROM chat_members m3
                 WHERE m3.chat_id = c.id
             ) = 2
             LIMIT 1`,
            [firstUser, secondUser]
        );

        if (existingChats.length > 0) {
            await connection.commit();
            return existingChats[0].id as number;
        }

        // Create new chat
        const [chatResult] = await connection.query<ResultSetHeader>(
            'INSERT INTO chats () VALUES ()'
        );

        const chatId = chatResult.insertId;

        // Add both users
        await connection.query(
            `INSERT INTO chat_members (chat_id, user_id)
             VALUES (?, ?), (?, ?)`,
            [chatId, firstUser, chatId, secondUser]
        );

        await connection.commit();

        return chatId;

    } catch (error) {
        await connection.rollback();
        throw error;

    } finally {
        connection.release();
    }
};


import { RowDataPacket } from 'mysql2';
import { db } from '../config/database';

interface UserChat {
    chatId: number;
    createdAt: string | null;
    members: number[];
}

export const getUserChats = async (
    userId: number
): Promise<UserChat[]> => {

    const [rows] = await db.query<RowDataPacket[]>(
        `SELECT
            c.id AS chatId,
            c.created_at AS createdAt,
            cm_all.user_id AS memberId
         FROM chats c
         INNER JOIN chat_members cm_user
            ON cm_user.chat_id = c.id
         INNER JOIN chat_members cm_all
            ON cm_all.chat_id = c.id
         WHERE cm_user.user_id = ?
         ORDER BY c.created_at DESC`,
        [userId]
    );

    // Group chat rows by chat ID
    const chatMap = new Map<number, UserChat>();

    for (const row of rows) {
        const chatId = Number(row.chatId);

        if (!chatMap.has(chatId)) {
            chatMap.set(chatId, {
                chatId,
                createdAt: row.createdAt
                    ? new Date(row.createdAt).toISOString()
                    : null,
                members: []
            });
        }

        const chat = chatMap.get(chatId)!;
        const memberId = Number(row.memberId);

        if (!chat.members.includes(memberId)) {
            chat.members.push(memberId);
        }
    }

    return Array.from(chatMap.values());
};
