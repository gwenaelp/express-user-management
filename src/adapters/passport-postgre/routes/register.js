const Handlebars = require('handlebars');
const User = require('../../../models/user');
const dbObject = require('../db');
const optionsManager = require('../../../options');
const uuidAPIKey = require('uuid-apikey');
const mailer = require('../../../mailer');
const formatKeys = require('../formatKeys');

const createInDb = (user) => {
  const options = optionsManager.get();

  return new Promise(async (resolve, reject) => {
    try {
      const { docs } = await dbObject.db.query(`SELECT * FROM ${options.usersTable} WHERE email='${user.email}' OR username='${user.username}'`);

      if(docs && docs.length > 0) {
        reject({ success: false, error: 'Username or mail already taken' });
      } else {
        //TODO add hooks to options
        //mkdirp(`${config.usersFolder}/${this.username}/views`);
        const activated = options.activationRequired ? false : true;
        const activation = {
          dateCreation: new Date().toJSON(),
        };

        const userDocument = {
          id: Math.trunc(Math.random() * 100000),
          email: user.email,
          username: user.username,
          hash: user.hash,
          activated,
          activation: JSON.stringify(activation),
          salt: user.salt,
        };

        const keys = Object.keys(userDocument).join(',');
        const values = formatKeys(Object.values(userDocument)).join(',');

        const query = `INSERT INTO ${options.usersTable} (${keys}) VALUES (${values})`;
        console.log('register query ', query);
        try {
          await dbObject.db.query(query);
          resolve(user);
        } catch(e) {
          reject(e);
        }
      }
    } catch(e) {
      console.log('ERR', e);
    }
  });
}

function sendActivationMail(user) {
  const options = optionsManager.get();

  const mailBodyTemplate = Handlebars.compile(options.mails.activation.body);
  var mailOptions = {
    to: user.email,
    from: options.mails.activation.sender,
    subject: options.mails.activation.subject,
    text: mailBodyTemplate({
      options,
      user,
    }),
  };

  mailer.send(mailOptions, function(err) {
  //  //req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
  //  done(err, 'done');
  });
  //smtpTransport.sendMail();
}

module.exports = (req, res, next) => {
  console.log('registerRoute');
  const options = optionsManager.get();

  const user = req.body;

  if(!user.username)
    return res.status(422).json({ success: false, error: 'Username is required' });

  if(!user.email)
    return res.status(422).json({ success: false, error: 'Email is required' });

  if(!user.password)
    return res.status(422).json({ success: false, error: 'Password is required' });


  const finalUser = new User(user);

  finalUser.setPassword(user.password);
  return createInDb(finalUser)
    .then((userCreated) => {
      if(options.activationRequired) {
        try {
          sendActivationMail(userCreated);
        } catch (e) {
          console.error(e);
        }
      }
      res.json({
        success:true,
        user: finalUser.toAuthJSON()
      });
    })
    .catch((err) => res.json(err));
};
