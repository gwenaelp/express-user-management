const dayjs = require('dayjs');
const optionsManager = require('../../../options');
const generatePassword = require('../../../utils/generatePassword');
const db = require('../db');

module.exports = async (req, res, next) => {
  const options = optionsManager.get();

  const passwords = req.body;
  const user = req.user;

  try {
    const docs = await db.collection(options.usersTable).find({ username: req.user.username }).toArray();

    const user = docs[0];
    if (generatePassword(passwords.oldPassword, user.salt) === user.hash) {
      const hash = generatePassword(passwords.newPassword, user.salt);

      await db.collection(options.usersTable).findOneAndUpdate({
        username: req.user.username,
      }, { $set: {
        hash,
        passwordLastChange: dayjs().format('YYYY-MM-DD'),
      } });
      res.send({ success: true });
    } else {
      res.send({ success: false, error: 'Password incorrect' });
    }
  } catch(e) {
    res.send({ success: false, error: e });
  }
};
