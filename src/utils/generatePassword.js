const crypto = require('crypto');

module.exports = (password, salt) => {
  return crypto.pbkdf2Sync(password, salt, 10000, 512, 'sha512').toString('hex');
}
