const passport = require('passport');
const LocalStrategy = require('passport-local');
const dbObject = require('./db');
const jwt = require('../../utils/getExpressJwt');

const loginRoute = require('./routes/login');
const registerRoute = require('./routes/register');
const activateAccountRoute = require('./routes/activateAccount');
const forgotPasswordRoute = require('./routes/forgotPassword');
const resetPasswordRoute = require('./routes/resetPassword');
const changePasswordRoute = require('./routes/changePassword');
const deleteAccountRoute = require('./routes/deleteAccount');

const optionsManager = require('../../options');
const generatePassword = require('../../utils/generatePassword');

const getTokenFromHeaders = (req) => {
  const { headers: { authorization } } = req;

  if(authorization && authorization.split(' ')[0] === 'Token') {
    return authorization.split(' ')[1];
  }
  return null;
};

const getApiKeyFromHeaders = (req) => {
  const { headers: { authorization } } = req;

  if(authorization && authorization.split(' ')[0] === 'ApiKey') {
    return authorization.split(' ')[1];
  }
  return null;
};

module.exports = {
  async init(app, options) {
    app.use(passport.initialize());
    app.use(passport.session());

    this.auth.required = jwt({
      secret: optionsManager.get().jwtSecret,
      userProperty: 'user',
      getToken: getTokenFromHeaders,
      algorithms: ['HS256']
    });

    this.auth.optional = jwt({
      secret: optionsManager.get().jwtSecret,
      userProperty: 'user',
      getToken: getTokenFromHeaders,
      credentialsRequired: false,
      algorithms: ['HS256']
    });

    passport.use(new LocalStrategy({}, (username, password, done) => {
      try {
        const db = dbObject.db;

        dbObject.findUserByUsernameOrEmail(options.usersTable, username).then((userFound) => {
          let user = [userFound];

          console.log('passportStrategy user', user);
          if (!user || user.length < 1) { return done(null, { success: false, error: 'Impossible to login with those credentials.' }); }
          if (user[0].activated !== true) { return done(null, { success: false, error: 'User not activated.' }); }

          try {
            user = user[0];
            password = generatePassword(password, user.salt);
            if(user.hash === password)
              return done(null, user);
            else
              return done(null, { success: false, error: 'Impossible to login with those credentials.' });
          } catch(e) {
            console.error('impossible to perform user login :', JSON.stringify(user), e);
            return done(null, { success: false, error: 'Impossible to login with those credentials.' });
          }
        });
      } catch(e) {
        console.log('error', e);
      }
    }));

    await dbObject.init(options);
  },

  loginRoute,
  registerRoute,
  activateAccountRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  changePasswordRoute,
  deleteAccountRoute,

  auth: {
    apiKey: (req, res, next) => {
      const options = optionsManager.get();

      const apiKey = getApiKeyFromHeaders(req);
      if(apiKey) {
        const db = dbObject.db;
        db.collection(options.apiKey.table).find({ [options.apiKey.documentKey]: apiKey }).toArray((err, docs) => {
          if(docs && docs.length) {
            req.apiKeyDocument = docs[0];
            next(null, docs[0]);
          } else {
            res.send({ success: false, error: 'Incorrect API key provided' });
          }
        });
      } else {
        res.send({ success: false, error: 'No API key provided' });
      }
    },
  },
};
