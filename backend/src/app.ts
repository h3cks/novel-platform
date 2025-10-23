import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import novelRoutes from './routes/novel.routes';
import chapterRoutes from './routes/chapter.routes';
import reportRoutes from './routes/report.routes';
import taskRoutes from './routes/task.routes';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/novels', novelRoutes);
app.use('/', chapterRoutes);
app.use('/reports', reportRoutes);
app.use('/moderation/tasks', taskRoutes);

export default app;
