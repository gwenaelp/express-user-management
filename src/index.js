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

    const prefix = options.prefix;
    expressApp.post(prefix + '/login', adapter.loginRoute);
    expressApp.post(prefix + '/register', adapter.registerRoute);
    expressApp.get(prefix + '/activateAccount/:key', adapter.activateAccountRoute);
    expressApp.post(prefix + '/forgot', adapter.forgotPasswordRoute);
    expressApp.post(prefix + '/resetPassword/:token', adapter.resetPasswordRoute);
    expressApp.post(prefix + '/changePassword', adapter.auth.required, adapter.changePasswordRoute);
    expressApp.post(prefix + '/deleteAccount', adapter.auth.optional, adapter.deleteAccountRoute);
    if (options.tokenRevocation) {
      expressApp.get(prefix + '/revokeToken/:token', adapter.auth.required, revokeToken);
      expressApp.get(prefix + '/listTokens', adapter.auth.required, listTokens);
    }
    this.auth = adapter.auth;
  },
};
