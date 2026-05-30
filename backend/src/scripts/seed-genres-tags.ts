import prisma from '../prisma/client';
import 'dotenv/config';

async function main() {

  async function upsertWithUniqueSlug(modelName: 'genre' | 'tag', data: any) {
    let finalSlug = data.slug;
    let counter = 1;

    while (true) {
      try {
        if (modelName === 'genre') {
          await prisma.genre.upsert({
            where: { name: data.name },
            update: { slug: finalSlug, description: data.description },
            create: { name: data.name, slug: finalSlug, description: data.description },
          });
        } else {
          await prisma.tag.upsert({
            where: { name: data.name },
            update: { slug: finalSlug },
            create: { name: data.name, slug: finalSlug },
          });
        }
        break; // Успішно збережено
      } catch (e: any) {
        if (e.code === 'P2002') {
          // Якщо slug зайнятий, додаємо лічильник і пробуємо знову
          finalSlug = `${data.slug}-${counter}`;
          counter++;
        } else {
          throw e; // Якщо інша помилка — кидаємо далі
        }
      }
    }
  }

  const genres = [
    // Основні
    { name: 'Фентезі', slug: 'fantasy', description: 'Магія, ельфи, інші світи' },
    { name: 'Наукова фантастика', slug: 'sci-fi', description: 'Космос, технології, майбутнє' },
    { name: 'Романтика', slug: 'romance', description: 'Кохання, стосунки' },
    { name: 'Бойовик / Екшн', slug: 'action', description: 'Битви, динамічний сюжет' },
    { name: 'Пригоди', slug: 'adventure', description: 'Подорожі, дослідження світу' },
    { name: 'Містика', slug: 'mystery', description: 'Загадки, надприродне' },
    { name: 'Жахи', slug: 'horror', description: 'Страх, монстри, виживання' },
    { name: 'Детектив', slug: 'detective', description: 'Розслідування злочинів' },
    { name: 'Трилер', slug: 'thriller', description: 'Напруга, небезпека, психологічний тиск' },
    { name: 'Драма', slug: 'drama', description: 'Складні емоції, конфлікти' },
    { name: 'Трагедія', slug: 'tragedy', description: 'Сумні події, важкі втрати' },
    { name: 'Повсякденність', slug: 'slice-of-life', description: 'Звичайне життя, спокійний темп' },
    { name: 'Гумор / Комедія', slug: 'comedy', description: 'Жарти, кумедні ситуації' },
    { name: 'Історична', slug: 'historical', description: 'Події в минулому' },
    { name: 'Сучасність / Урбан', slug: 'urban', description: 'Події в нашому часі/світі' },
    { name: 'Психологія', slug: 'psychological', description: 'Внутрішній світ, ігри розуму' },

    // Специфічні для веб-новел
    { name: 'LitRPG / GameLit', slug: 'litrpg', description: 'Світ за правилами рольової гри (рівні, статси)' },
    { name: 'Ісекай / Попаданці', slug: 'isekai', description: 'Перенесення в інший світ' },
    { name: 'Уся (Wuxia)', slug: 'wuxia', description: 'Китайські бойові мистецтва (без магії)' },
    { name: 'Сянься (Xianxia)', slug: 'xianxia', description: 'Безсмертя, даосизм, культивація (китайське фентезі)' },
    { name: 'Сюаньхуань (Xuanhuan)', slug: 'xuanhuan', description: 'Змішане фентезі (східне + західне)' },
    { name: 'Фанфік', slug: 'fanfiction', description: 'Твори за мотивами існуючих всесвітів' },

    // Піджанри
    { name: 'Кіберпанк', slug: 'cyberpunk', description: 'Високі технології, низький рівень життя' },
    { name: 'Стімпанк', slug: 'steampunk', description: 'Парові технології, вікторіанська епоха' },
    { name: 'Постапокаліптика', slug: 'post-apocalyptic', description: 'Життя після кінця світу' },
    { name: 'Темне фентезі', slug: 'dark-fantasy', description: 'Похмурий світ, жорстокість, моральні дилеми' },
    { name: 'Магічний реалізм', slug: 'magical-realism', description: 'Магія як звичайна частина реального світу' },
    { name: 'Меха', slug: 'mecha', description: 'Гігантські роботи, пілоти' },
    { name: 'Спорт', slug: 'sports', description: 'Спортивні змагання, тренування' },
    { name: 'Підліткова література', slug: 'young-adult', description: 'Орієнтовано на молодь (YA)' },
  ];

  const tags = [
    // Головний герой (ГГ)
    'ГГ чоловік', 'ГГ жінка', 'Розумний ГГ', 'Холоднокровний ГГ', 'Безжальний ГГ',
    'ГГ лиходій', 'Антигерой', 'Оверпауер ГГ (OP)', 'Слабий до сильного', 'Приховує силу',
    'Багатий ГГ', 'ГГ не людина', 'ГГ монстр', 'ГГ дитина', 'Сліпий/глухий ГГ',

    // Тропи та Сюжет
    'Реінкарнація', 'Повернення у минуле (Регресія)', 'Трансміграція', 'Система',
    'Розвиток королівства', 'Еволюція', 'Виживання', 'Помста', 'Зрада',
    'Академія', 'Шкільне життя', 'Турніри', 'Аранжований шлюб', 'Фіктивний шлюб',
    'Від ворогів до коханців', 'Друге обличчя', 'Повільний розвиток (Slow burn)',

    // Елементи Світу
    'Магія', 'Мечі та Магія', 'Культивація', 'Алхімія', 'Ковальство / Крафт',
    'Некромантія', 'Артефакти', 'Підземелля (Данжі)', 'Гільдії / Секти',
    'Віртуальна реальність (VRMMO)', 'Штучний інтелект', 'Космос', 'Зомбі',
    'Мутанти', 'Боги', 'Ангели', 'Демони', 'Ельфи', 'Звіролюди / Перевертні',
    'Вампіри', 'Дракони',

    // Романтика
    'Гарем', 'Зворотний гарем', 'Без романтики', 'Любовний трикутник',
    'Яндере', 'Цундере', 'Мила романтика (Fluff)',

    // Тон та Атмосфера
    'Жорстокість (Gore)', 'Трагічне минуле', 'Політика', 'Військова справа',
    'Економіка / Бізнес', 'Дружба', 'Братерство', 'Сімейні узи', 'Шоу-бізнес'
  ];

  console.log('Seeding genres...');
  for (const g of genres) {
    await upsertWithUniqueSlug('genre', g);
  }

  console.log('Seeding tags...');
  for (const tagName of tags) {
    const slug = tagName
      .toLowerCase()
      .trim()
      .replace(/[\s_/]+/g, '-')
      .replace(/[^\w-а-яіїєґ]/gi, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    await upsertWithUniqueSlug('tag', { name: tagName, slug });
  }

  console.log('Seed finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });