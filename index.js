const { MONGO_URI } = require('./context').env;
const { establishConnection } = require('./models').utils;

const app = require('./app');
const PORT = process.env.PORT || 3200;
establishConnection(MONGO_URI).then(
  () => {
    app.listen(PORT);
    console.log(`app listening port ${PORT}`);
  },
  (err) => {
    console.error('err', err);
  }
);
