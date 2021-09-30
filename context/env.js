require('dotenv').config();
const envVar = process.env;

module.exports = {
  PORT: envVar.PORT,
  MONGO_URI: envVar.MONGO_URI,
  SESSION_SECRET: envVar.SESSION_SECRET,
};
