import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';

import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import novelRoutes from './routes/novel.routes';
import chapterRoutes from './routes/chapter.routes';
import commentRoutes from './routes/comment.routes';
import reportsRouter from './routes/report.routes';
import metaRouter from './routes/meta.routes';
import uploadRoutes from './routes/upload.routes';
import adminRoutes from './routes/admin.routes';
import notificationRoutes from './routes/notification.routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const apiRouter = express.Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/profile', profileRoutes);
apiRouter.use('/novels', novelRoutes);
apiRouter.use('/', chapterRoutes);
apiRouter.use('/', commentRoutes);
apiRouter.use('/reports', reportsRouter);
apiRouter.use('/meta', metaRouter);
apiRouter.use('/upload', uploadRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/notifications', notificationRoutes);

app.use('/api/v1', apiRouter);

app.use(errorHandler);

export default app;