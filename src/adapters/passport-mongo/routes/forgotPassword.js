const async = require('async');
const crypto = require('crypto');
const Handlebars = require('handlebars');

const db = require('../db');
const optionsManager = require('../../../options');
const mailer = require('../../../mailer');

module.exports = (req, res, next) => {
  const options = optionsManager.get();
  async.waterfall([
    (done) => {
      crypto.randomBytes(20, (err, buf) => {
        const token = buf.toString('hex');
        done(err, token);
      });
    },
    async (token, done) => {
      const docs = await db.collection(options.usersTable).find({ email: req.body.email }).toArray();
      let user = docs[0];
      if (!user) {
        //req.flash('error', 'No account with that email address exists.');
        console.error('no user found for this email adress');
        return res.redirect('/forgot');
      }
      const operation = {
        $set: {},
      };

      operation.$set.resetPasswordToken = token;
      operation.$set.resetPasswordExpires = Date.now() + 3600000;

      const newUser = await db.collection(options.usersTable).findOneAndUpdate({
        email: req.body.email
      }, operation, { returnOriginal: false });

      return { token, user: newUser };
    },
    async ({ token, user }, done) => {
      const mailBodyTemplate = Handlebars.compile(options.mails.passwordReset.body);

      const mailOptions = {
        to: req.body.email,
        from: options.mails.passwordReset.sender,
        subject: options.mails.passwordReset.subject,
        html: mailBodyTemplate({
          ...options,
          token,
        }),
      };

      try {
        await mailer.send(mailOptions);
      } catch (e) {
        console.error('forgot password error', e);
        res.send({ success: false, error: e });
        return;
      }

      res.send({ success: true });
    }
  ], function(err) {
    // if (err) return next(err);
    // res.redirect('/forgot');
  });
};
