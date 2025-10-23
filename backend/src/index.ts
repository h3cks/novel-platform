import app from './app';
import { PORT } from './config';
import { startModerationCron } from './cron/moderation.cron';

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  if (process.env.NODE_ENV !== 'test') {
    startModerationCron();
  }
});
