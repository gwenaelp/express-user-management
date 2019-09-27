const { Client } = require('pg');

const dbObject = {
  db: undefined,

  async init () {
    const client = new Client();
    this.db = client;
    return client.connect();
  },

  async findUserByUsernameOrEmail(usersTable, usernameOrEmail) {
    console.log(`SELECT * FROM ${usersTable} WHERE username='${usernameOrEmail}' OR email='${usernameOrEmail}'`)
    const { rows } = await dbObject.db.query(`SELECT * FROM ${usersTable} WHERE username='${usernameOrEmail}' OR email='${usernameOrEmail}'`);
    console.log('findUserByUsernameOrEmail', rows);
    return rows[0];
  }
};

module.exports = dbObject;
