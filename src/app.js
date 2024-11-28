require("dotenv").config();
const compression = require("compression");
const express = require("express");
const { default: helmet } = require("helmet");
const app = express();
const morgan = require("morgan");

// init middlewares
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// init database
require("./dbs/init.mongodb");

// init routes
app.use('/', require('./routes'));

// handle error

module.exports = app;
