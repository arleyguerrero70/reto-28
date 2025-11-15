export default () => ({
  supabase: {
    url: process.env.SUPABASE_URL ?? '',
    anonKey: process.env.SUPABASE_ANON_KEY ?? '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  },
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN ?? '',
    groupId: process.env.TELEGRAM_GROUP_ID ?? '',
  },
  langchain: {
    apiKey: process.env.LANGCHAIN_API_KEY ?? '',
  },
  timezone: process.env.TZ ?? 'America/Bogota',
});
