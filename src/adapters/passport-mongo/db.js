const MongoClient = require('mongodb').MongoClient;

let db;
let mongoclient = {};

const dbObject = {
  db: undefined,
  users: undefined,
  dashboards: undefined,

  init: (options) => {
    return new Promise((resolve, reject) => {
      if(!options.mongoUrl) {
        options.mongoUrl = process.env.MONGO_URL;
      }
      MongoClient.connect(options.mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
        if(err) {
          console.error(err.toString());
          reject(err.toString());
        } else {
          const urlSplit = options.mongoUrl.split('/');
          const databaseName = urlSplit[urlSplit.length - 1].split('?')[0];
          console.log("Express user management: connected successfully to database", databaseName);
          db = client.db(databaseName);
          dbObject.db = db;
          resolve(db);
        }
      });
    });
  },

  collection: (name) => {
    return dbObject.db.collection(name);
  },
};

module.exports = dbObject;
