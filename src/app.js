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

// init database
require("./dbs/init.mongodb");

// init routes
app.get("/", (req, res, next) => {
    const strCompress = "Hello Fantipjs!";
    return res.status(200).json({
        message: "Welcom Fantipjs!",
        metadata: strCompress.repeat(1000),
  });
});

// handle error

module.exports = app;
