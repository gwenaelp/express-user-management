const passport = require('passport');
const User = require('../../../models/user');

module.exports = (req, res, next) => {
  const user = req.body;

  if(!user.username)
    return res.status(422).json({ success: false, error: 'Username is required.' });

  if(!user.password)
    return res.status(422).json({ success: false, error: 'Password is required.' });


  return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
    console.log('passportUser', passportUser, err);

    if(passportUser.success === false) {
      return res.status(422).json(passportUser);
    }
    if(err) {
      return next(err);
    }
    if(passportUser) {
      const user = new User(passportUser);
      user.token = user.generateJWT();
      return res.json({
        success: true,
        user: user.toAuthJSON()
      });
    }

    return res.status(422).json({
      success: false,
      error: 'The username or password you entered is incorrect, please try again.',
    });
  })(req, res, next);
};
