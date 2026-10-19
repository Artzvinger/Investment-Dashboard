// Временная заглушка, пока нет авторизации.
// Замени на реальный id из таблицы User (npx prisma studio)
const DEV_USER_ID = 1;

export function getCurrentUserId(): number {
    return DEV_USER_ID;
}