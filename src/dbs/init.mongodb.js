'use strict'

const mongoose = require('mongoose');
const { db: {host, name, port, userName, password}} = require('../configs/config.mongodb');

const connectString = `mongodb://${userName}:${password}@${host}:${port}/${name}?authSource=admin`;
const { countConnect } = require('../helpers/check.connect');

class Database {
    constructor() {
        this.connect();
    }

    // connect
    connect(type = "mongodb") {
        if (1 === 1) {
            mongoose.set("debug", true);
            mongoose.set("debug", { color: true });
        }
        mongoose
            .connect(connectString, {
                maxPoolSize: 50,
            })
            .then((_) => {
                console.log(`${connectString}`);
                console.log(`Connected Mongodb Success PRO`);
                countConnect();
            })
            .catch((err) => console.log(`Error Connect!`));
    }

    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
}

const instanceMongodb = Database.getInstance()
module.exports = instanceMongodb