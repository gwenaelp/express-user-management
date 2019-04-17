const MongoClient = require('mongodb').MongoClient;

let db;

const dbObject = {
  db: undefined,
  users: undefined,
  dashboards: undefined,

  init: (options) => {
    return new Promise((resolve, reject) => {
      if(!options.mongoUrl) {
        options.mongoUrl = process.env.MONGO_URL;
      }
      MongoClient.connect(options.mongoUrl, { useNewUrlParser: true }, (err, client) => {
        if(err) {
          console.error(err.toString());
          reject(err.toString());
        } else {
          const urlSplit = options.mongoUrl.split('/');
          console.log("Connected successfully to server", urlSplit[urlSplit.length - 1]);
          db = client.db(urlSplit[urlSplit.length - 1]);
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
