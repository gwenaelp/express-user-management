const passport = require('passport');
const db = require('../db');
const optionsManager = require('../../../options');

module.exports = (req, res, next) => {
  const options = optionsManager.get();

  if(req.params.username !== req.user.username) {
    const usersCollection = db.collection(options.usersTable);
    usersCollection.deleteOne({
      username: req.body.username,
    }, (err, result) => {
      if(err) {
        return res.status(500).json({
          success: false,
          err,
        });
      }
      return res.status(200).json({
        success: true
      });
    });
  } else {
    return res.status(422).json({
      success: false,
      error: 'The username or password you entered is incorrect, please try again.',
    });
  }
};
