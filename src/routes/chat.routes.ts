
import { Router } from 'express';

import {
    createChat,
    sendChatMessage,
    getChatMessages
} from '../controllers/chat.controller';
import { markChatMessageAsRead } from '../controllers/chat.controller';
import { updateChatLastSeen } from '../controllers/chat.controller';

const router = Router();

router.post('/create', createChat);
router.post('/:chatId/message/send', sendChatMessage);
router.get('/:chatId/messages', getChatMessages);
router.post('/:chatId/message/:messageId/read', markChatMessageAsRead);
router.post('/:chatId/lastseen', updateChatLastSeen);

export default router;
