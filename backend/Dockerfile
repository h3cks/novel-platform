# Етап 1: Збірка (Build)
FROM node:18-alpine AS builder

# Встановлюємо робочу директорію
WORKDIR /usr/src/app

# Копіюємо файли залежностей
COPY package*.json ./

# Встановлюємо всі залежності (включно з devDependencies для збірки TypeScript)
RUN npm install

# Копіюємо вихідний код
COPY . .

# Компілюємо TypeScript код (очікується, що скрипт build є в package.json)
RUN npm run build

# Етап 2: Продакшен (Production)
FROM node:18-alpine

WORKDIR /usr/src/app

# Копіюємо package.json для встановлення лише продакшен залежностей
COPY package*.json ./

# Встановлюємо лише необхідні для роботи пакети
RUN npm install --only=production

# Копіюємо скомпільований код з попереднього етапу (зазвичай у папку dist або build)
COPY --from=builder /usr/src/app/dist ./dist

# Відкриваємо порт, на якому працюватиме API
EXPOSE 3000

# Запускаємо скомпільований додаток
CMD ["node", "dist/index.js"]