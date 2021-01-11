//include this file to get options, including the user's defined ones!

const defaultOptions = {
  adapter: 'passport-mongo',
  usersTable: 'users',
  jwtSecret: undefined,
  additionalTokenKeys: [],
  apiKey: {
    table: 'projects',
    documentKey: 'apiKey.apiKey',
  },
  mongoUrl: '',
  passwordResetAdress: 'http://localhost:30000/resetPassword',
  accountActivationAdress: 'http://localhost:30000/activate',
  nodeMailerConfig: undefined,
  activationRequired: true,
  tokensCollection: 'user-token',
  tokenExpirationTime:  1000 * 60 * 60 * 24,
  mails: {
    activation: {
      subject: 'Activate your account!',
      sender: 'express-user-management@logicraft.fr',
      body: `Almost done!
             Please click this link to activate your account!

             {{accountActivationAdress}}/activate/{{user.activation.code.apiKey}}`,
    },
    passwordReset: {
      subject: 'Password reset link',
      sender: 'express-user-management@logicraft.fr',
      body: `You are receiving this because you (or someone else) have requested the reset of the password for your account.
            Please click on the following link, or paste this into your browser to complete the process:
            {{passwordResetAdress}}{{token}}
            If you did not request this, please ignore this email and your password will remain unchanged.`,
    },
  }
};


module.exports = {
  init(userOptions) {
    this.options = {
      ...defaultOptions,
      ...userOptions,
    };
  },
  get() {
    return this.options;
  },
};
