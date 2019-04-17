# express-user-management

A ready-to-use library for authentication and user management with express.

Uses mongo, passport, and jwt by default.

# What does it do?

express-user-management will automatically create API endpoints for :
- user registration
- user account activation
- user login
- password forgotten
- password change with a token for the previous route
- password change when logged in
- account deletion

It handles everything you need to handle in those routes. You can set various options to adapt it to your project.

It uses nodemailer to send mails, and you can link it easily to your mail service.

# Installation

```npm i express-user-management```

# Usage

```
const userManagement = require('express-user-management');
userManagement.init(expressApp, options);
```
# Options

Here are the available options with their default values :
```javascript
const options = {
  /* Adapter to use under the hood. */
  adapter: 'passport-mongo',
  /* Table in the database where users are stored */
  usersTable: 'users',
  /* How API key is handled */
  apiKey: {
    /* Table where to look at API keys */
    table: 'projects',
    /* Key in the document that stores the API key */
    documentKey: 'apiKey.apiKey',
  },
  /* URL of the database */
  mongoUrl: '',
  /* Password reset URL. Used in mail templates below */
  passwordResetAdress: 'http://localhost:30000/resetPassword',
  /* Account activation URL. Used in mail templates below */
  accountActivationAdress: 'http://localhost:30000/activate',
  nodeMailerConfig: undefined,
  /* Whether or not you need to handle account activation on your project */
  activationRequired: true,
  /* Mail templates. See dedicated section in the readme for more info */
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
```

# Mailing

node-mailer is used to handle mailing. Simply put in the options the config object you would give to node-mailer directly.

If no configuration object is provided, mails are not being sent but the output is logged.

# Hooks

This feature is not implement yet!

In order to allow you to execute some arbitrary code when the endpoints are called, some hooks can be provided to the options.
