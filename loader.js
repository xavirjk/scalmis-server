module.exports = (app, config) => {
  for (const mw in config) {
    config[mw](app);
  }
};
