
import express from 'express';
import cors from 'cors';
import chatRoutes from './routes/chat.routes';
import userRoutes from './routes/user.routes';

const app = express();

// Middleware must come BEFORE routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/user', userRoutes);

// Routes
app.use('/chat', chatRoutes);

app.get('/', (req, res) => {
    res.send('Chat Backend API is running');
});

export default app;
