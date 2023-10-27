const dayjs = require('dayjs');
const db = require('../db');
const optionsManager = require('../../../options');
const generatePassword = require('../../../utils/generatePassword');

module.exports = async (req, res) => {
  const options = optionsManager.get();

  try {
    const docs = await db.collection(options.usersTable).find({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    }).toArray();
    if (docs.length === 1) {
      const user = docs[0];
      const hash = generatePassword(req.body.password, user.salt);
      resetPasswordToken = undefined;
      resetPasswordExpires = undefined;

      await db.collection(options.usersTable).findOneAndUpdate({
        email: user.email
      }, {
        $set: {
          hash,
          passwordLastChange: dayjs().format('YYYY-MM-DD'),
        },
        $unset: {
          resetPasswordToken: 1,
          resetPasswordExpires: 1,
        },
      });

      res.send({ success: true });
    } else {
      res.send({ success: false });
    }
  } catch(e) {
    res.send({ success: false });
  }
};
