const optionsManager = require('../../../options');
const generatePassword = require('../../../utils/generatePassword');
const db = require('../db');

module.exports = (req, res, next) => {
  const options = optionsManager.get();

  const passwords = req.body;
  const user = req.user;

  db.collection(options.usersTable).find({ username: req.user.username }).toArray((err, docs) => {
    const user = docs[0];
    if(generatePassword(passwords.oldPassword, user.salt) === user.hash) {
      user.hash = generatePassword(passwords.newPassword, user.salt);

      db.collection(options.usersTable).update({
        username: req.user.username,
      }, user, (err, user) => {
        if (err) {
          res.send({ success: false, error: err });
        }
        res.send({ success: true });
      });
    } else {
      res.send({ success: false, error: 'Password incorrect' });
    }
  });
};
