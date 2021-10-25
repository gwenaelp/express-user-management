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
const tokenExpirationManager = require('../../tokenExpirationManager');
const sync = require('promise-synchronizer');

const getTokenFromHeaders = (req) => {
  const authorization = req.headers.authorization;
  const options = optionsManager.get();

  if(authorization && authorization.split(' ')[0] === 'Token') {
    const usertoken = authorization.split(' ')[1];
    return usertoken;
  }
  return null;
};

const getApiKeyFromHeaders = (req) => {
  const { headers: { authorization } } = req;

  if(authorization && authorization.split(' ')[0] === 'apiKey' || authorization && authorization.split(' ')[0] === 'ApiKey') {
    return authorization.split(' ')[1];
  }
  return null;
};


module.exports = {
  async init(app, options) {
    app.use(passport.initialize());
    app.use(passport.session());
    this.auth.required = (req, res, next) => {
      const authorization = req.headers.authorization;
      if(authorization && authorization.split(' ')[0] === 'Token') {
        const jwtCheck = jwt({
          secret: optionsManager.get().jwtSecret,
          userProperty: 'user',
          getToken: getTokenFromHeaders,
          algorithms: ['HS256']
        });

        jwtCheck(req, res, async () => {
          const authorization = req.headers.authorization;
          const options = optionsManager.get();
          if (authorization && authorization.split(' ')[0] === 'Token') {
            const usertoken = authorization.split(' ')[1];
            if (options.tokenRevocation) {
              const isTokenValid = await tokenExpirationManager.isTokenValid(usertoken, tokenExpirationManager);
              if (isTokenValid) {
                next();
              } else {
                res.status(422).send({ success: false, error: { message: 'User session has expired'} });
              }
            } else {
              next();
            }
          } else {
            res.status(500).send({ success: false, error: { message: 'User token not found' } });
          }
        });
      } else if(authorization && authorization.split(' ')[0] === 'apiKey') {
        this.auth.apiKey(req, res, next);
      }
    };
    this.auth.optional = jwt({
      secret: optionsManager.get().jwtSecret,
      userProperty: 'user',
      getToken: getTokenFromHeaders,
      credentialsRequired: false,
      algorithms: ['HS256']
    });

    passport.use(new LocalStrategy({}, function(username, password, done) {
      const db = dbObject.db;
      if (!db || !db.collection) {
        return done(null, { success: false, error: 'Impossible to connect to the database.' });
      }
      db.collection(options.usersTable).find({ $or: [{ username:username}, { email:username }] }).toArray((err, user) => {
        if (err) { return done(err); }
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
    }));

    await dbObject.init(options);

    module.exports = () => {
      setInterval(async () => {
        const lastweek = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
        await dbObject.collection('user-token').deleteMany({ lastUsed: { $lt: lastweek.toJSON() } });
        console.log('cleaned session tokens');
      }, options.tokenExpirationTime);
    };
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
            req.user = docs[0];
            next(null, docs[0]);
          } else {
            res.status(422).send({ success: false, error: 'Incorrect API key provided:' + apiKey});
          }
        });
      } else {
        res.status(500).send({ success: false, error: 'No API key provided' });
      }
    },
  },
};
