// Змінено: імпортуємо dotenv до будь-яких інших локальних імпортів
import 'dotenv/config';
import app from './app';
import { PORT } from './config';

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});