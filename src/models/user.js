const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const optionsManager = require('../options');

class UsersSchema {
  //email: '',
  //hash: '',
  //salt: '',
  constructor(data) {
    const dataKeys = Object.keys(data);
    for (let i = 0; i < dataKeys.length; i++) {
      this[dataKeys[i]] = data[dataKeys[i]];
    }
  }

  setPassword(password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  }

  validatePassword(password) {
    const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    return this.hash === hash;
  }

  generateJWT() {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + 60);

    const tokenObject = {
      email: this.email,
      username: this.username,
      id: this._id,
      exp: parseInt(expirationDate.getTime() / 1000, 10),
    };

    const additionalTokenKeys = optionsManager.get().additionalTokenKeys;
    if(additionalTokenKeys) {
      for (var i = 0; i < additionalTokenKeys.length; i++) {
        tokenObject[additionalTokenKeys[i]] = this[additionalTokenKeys[i]];
      }
    }

    return jwt.sign(tokenObject, optionsManager.get().jwtSecret);
  }

  toAuthJSON() {
    return {
      _id: this._id,
      email: this.email,
      username: this.username,
      plan: this.plan,
      token: this.generateJWT(),
    };
  }
}

module.exports = UsersSchema;
