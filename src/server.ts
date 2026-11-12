import dotenv from 'dotenv';
dotenv.config();
import app from './app';
import { db } from './config/database';
import './config/firebase';


const PORT = process.env.PORT || 3000;

async function startServer(): Promise<void> {
    try {
        await db.query('SELECT 1');

        console.log('MySQL connected successfully');

        app.listen(PORT, () => {
            console.log(
                `Server running at http://localhost:${PORT}`
            );
        });

    } catch (error) {
        console.error('Server startup failed:', error);
        process.exit(1);
    }
}

startServer();