const Handlebars = require('handlebars');
const User = require('../../../models/user');
const db = require('../db');
const optionsManager = require('../../../options');
const uuidAPIKey = require('uuid-apikey');
const mailer = require('../../../mailer');

const createInDb = (user) => {
  const options = optionsManager.get();

  return new Promise((resolve, reject) => {
    try {
      //TODO check collection name in options
      const usersCollection = db.collection(options.usersTable);
      usersCollection.find({
        $or: [{ email: user.email }, { username: user.username }]
      }).toArray((err, docs) => {
        if(docs && docs.length > 0) {
          reject({ success: false, error: 'Username or mail already taken' });
        } else {
          //TODO add hooks to options
          //mkdirp(`${config.usersFolder}/${this.username}/views`);
          const activated = options.activationRequired ? false : true;
          const activation = {
            dateCreation: new Date().toJSON(),
          };

          if(options.activationRequired) {
            activation.code = uuidAPIKey.create();
          }

          const userDocument = {
            email: user.email,
            username: user.username,
            hash: user.hash,
            activated,
            activation,
            salt: user.salt,
          };
          usersCollection.insertOne(userDocument, (err, newDoc) => {
            if (err) {
              console.log('reject', err);
              reject(err);
              throw new Error(err);
            }
            resolve(userDocument);
          });
        }
      });
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
      res.status(200).send({
        success:true,
        user: finalUser.toAuthJSON()
      });
      return;
    })
    .catch((err) => {
      console.log('ERR registerRoute', err);
      res.status(422).send(err);
    });
};
