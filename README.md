
# Node.js Chat Backend

A chat backend application built using Node.js, TypeScript, MySQL and Firebase Firestore.

## Technologies Used

- Node.js
- TypeScript
- Express.js
- MySQL
- Firebase Firestore
- Firebase Admin SDK

## Features

1. Create or get one-to-one chat.
2. Send chat messages.
3. Retrieve chat messages with pagination limit.
4. Mark messages as read.
5. Update user last seen.
6. Retrieve all chats for a user.

## Installation

Clone the repository:

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Navigate to the project:

```bash
cd nodejs-chat-backend
```

Install dependencies:

```bash
npm install
```

## Environment Configuration

Create a `.env` file in the root directory:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=chat_backend
GOOGLE_APPLICATION_CREDENTIALS=./credentials/firebase-service-account.json
```

Add your own Firebase service account credentials locally. Never commit them to GitHub.

## Run the Project

```bash
npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /chat/create | Create or get chat |
| POST | /chat/:chatId/message/send | Send message |
| GET | /chat/:chatId/messages | Get messages |
| POST | /chat/:chatId/message/:messageId/read | Mark as read |
| POST | /chat/:chatId/lastseen | Update last seen |
| GET | /user/:userId/chats | Get user chats |
