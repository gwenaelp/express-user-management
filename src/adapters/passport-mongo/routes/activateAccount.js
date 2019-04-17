const optionsManager = require('../../../options');
const db = require('../db');

module.exports = (req, res, next) => {
  const options = optionsManager.get();

  const usersCollection = db.collection(options.usersTable);
  usersCollection.find({ 'activation.code.apiKey': req.params.key }).toArray((err, docs) => {
    const user = docs[0];
    const tsYesterday = Math.round(new Date().getTime() / 1000) - (24 * 3600);
    const tsUser = new Date(user.activation.dateCreation);

    if(user.activated) {
      res.send({ success: false, error: 'User account already activated.' });
      return;
    }

    if(tsUser > tsYesterday) {
      user.activated = true;
      db.collection(options.usersTable).update({ 'activation.code.apiKey': req.params.key }, user, (err, user) => {
        if(err) {
          res.send({ success: false, error: 'Something unexpected occured during the activation process.' });
        } else {
          res.send({ success: true });
        }
      });
    } else {
      res.send({ success: false, error: 'Cannot proceed to activation, the activation token is not valid anymore.' });
    }
  });
};
