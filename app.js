const express = require('express');
const path = require('path');

const { preConfig, postConfig } = require('./appMiddlewares');
const { routes } = require('./config');

const loader = require('./loader');

const app = express();

app.use(express.static(path.join()));
app.use('/Data', express.static(path.join(__dirname, 'Data')));
loader(app, preConfig);
routes(app);
loader(app, postConfig);

module.exports = app;
