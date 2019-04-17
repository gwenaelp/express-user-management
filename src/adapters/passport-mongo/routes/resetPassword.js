const db = require('../db');
const optionsManager = require('../../../options');
const generatePassword = require('../../../utils/generatePassword');

module.exports = (req, res) => {
  const options = optionsManager.get();

  db.collection(options.usersTable).find({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  }).toArray((err, docs) => {
    if(docs.length === 1) {
      const user = docs[0];
      user.hash = generatePassword(req.body.password, user.salt);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      db.collection(options.usersTable).update({
        email: user.email
      }, user, (err, user) => {
        if(err)
          res.send({ success: false });
        else {
          res.send({ success: true });
        }
      });
    } else {
      res.send({ success: false });
    }
  });
};
