import { defineConfig } from '@prisma/config'

export default defineConfig({
  datasource: {
    // Тимчасово вставляємо URL напряму:
    url: "postgresql://devuser:devpass@localhost:5432/novel_db?schema=public",
  },
})