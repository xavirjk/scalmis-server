module.exports = (app) => {
  const errH = (err, req, res, next) => {
    const errMsg = 'Internal Server Error';
    console.error('Error Handler encountered following error', err);
    res.status(500).send(errMsg);
  };

  app.use(errH);
};
