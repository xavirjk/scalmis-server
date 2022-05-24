require('dotenv').config();
const envVar = process.env;

module.exports = {
  PORT: envVar.PORT,
  MONGO_URI: envVar.MONGO_URI,
  SESSION_SECRET: envVar.SESSION_SECRET,
  CLIENT_ID: envVar.CLIENT_ID,
  CLIENT_SECRET: envVar.CLIENT_SECRET,
  REDIRECT_URL: envVar.REDIRECT_URL,
  REFRESH_TOKEN: envVar.REFRESH_TOKEN,
  EMAIL: envVar.EMAIL,
};
