let optionsManager = require('./options');
const bodyParser = require("body-parser");
const revokeToken = require("./revokeToken");
const listTokens = require("./listTokens");

const adapters = {
  'passport-mongo': require('./adapters/passport-mongo'),
  'passport-postgre': require('./adapters/passport-postgre'),
}

module.exports = {
  async init(expressApp, userOptions) {
    optionsManager.init(userOptions);
    const options = optionsManager.get();
    if (process.env.DEBUG) {
      console.log('OPTIONS', options);
    }

    const adapter = adapters[options.adapter];
    await adapter.init(expressApp, options);

    expressApp.post('/login', adapter.loginRoute);
    expressApp.post('/register', adapter.registerRoute);
    expressApp.get('/activateAccount/:key', adapter.activateAccountRoute);
    expressApp.post('/forgot', adapter.forgotPasswordRoute);
    expressApp.post('/resetPassword/:token', adapter.resetPasswordRoute);
    expressApp.post('/changePassword', adapter.auth.required, adapter.changePasswordRoute);
    expressApp.post('/deleteAccount', adapter.auth.optional, adapter.deleteAccountRoute);
    if (options.tokenRevocation) {
      expressApp.get('/revokeToken/:token', adapter.auth.required, revokeToken);
      expressApp.get('/listTokens', adapter.auth.required, listTokens);
    }
    this.auth = adapter.auth;
  },
};
