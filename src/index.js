let optionsManager = require('./options');
const bodyParser = require("body-parser");

const adapters = {
  'passport-mongo': require('./adapters/passport-mongo'),
  'passport-postgre': require('./adapters/passport-postgre'),
}

module.exports = {
	init(expressApp, userOptions) {
    optionsManager.init(userOptions);
    const options = optionsManager.get();
    console.log('OPTIONS', options);

    const adapter = adapters[options.adapter];
    adapter.init(expressApp, options);

    expressApp.post('/login', adapter.loginRoute);
    expressApp.post('/register', adapter.registerRoute);
    expressApp.get('/activateAccount/:key', adapter.activateAccountRoute);
    expressApp.post('/forgot', adapter.forgotPasswordRoute);
    expressApp.post('/resetPassword/:token', adapter.resetPasswordRoute);
    expressApp.post('/changePassword', adapter.auth.required, adapter.changePasswordRoute);
    expressApp.post('/deleteAccount', adapter.auth.optional, adapter.deleteAccountRoute);

    this.auth = adapter.auth;
	},
};
