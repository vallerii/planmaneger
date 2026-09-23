import type { Size } from "./types";

/** Шаблон дорожной карты из прототипа — можно выбрать при создании проекта. */
export const ROADMAP_TEMPLATE: { name: string; tasks: [string, Size][] }[] = [
  {
    name: "Prototype",
    tasks: [
      ["Главная страница", "L"],
      ["Website Check", "XL"],
      ["Google Maps Check", "XL"],
      ["News Monitoring", "L"],
      ["Onboarding клиента", "L"],
      ["Кабинет клиента", "XL"],
      ["Управление продуктами и ценами", "L"],
    ],
  },
  {
    name: "MVP Launch",
    tasks: [
      ["Единый user flow", "L"],
      ["Авторизация и аккаунт", "L"],
      ["Создание заявки", "M"],
      ["Результат проверки", "XL"],
      ["Semi-automatic processing", "L"],
    ],
  },
  {
    name: "Validation",
    tasks: [
      ["10–30 первых пользователей", "XL"],
      ["Product analytics", "M"],
      ["Интервью с клиентами", "L"],
      ["Тест pricing и CTA", "M"],
      ["Приоритизация 3 продуктов", "M"],
    ],
  },
  {
    name: "Automation",
    tasks: [
      ["Автоматический сбор данных", "XXL"],
      ["История проверок", "L"],
      ["AI-рекомендации", "XL"],
      ["Фоновые проверки", "XL"],
      ["Admin workflow", "L"],
    ],
  },
  {
    name: "Retention",
    tasks: [
      ["Регулярный monitoring", "XXL"],
      ["Email / WhatsApp alerts", "L"],
      ["Monthly reports", "L"],
      ["История изменений", "XL"],
      ["Подписка", "XL"],
    ],
  },
  {
    name: "Growth",
    tasks: [
      ["Blog + Glossary", "XL"],
      ["SEO landing pages", "XL"],
      ["Free checks as lead magnet", "L"],
      ["Referral flow", "L"],
      ["LinkedIn outreach", "M"],
    ],
  },
  {
    name: "Platform",
    tasks: [
      ["Multi-location", "XXL"],
      ["Команды и роли", "XL"],
      ["Agency white-label", "XXL"],
      ["API и интеграции", "XXL"],
      ["AI Assistant", "XXL"],
    ],
  },
];
