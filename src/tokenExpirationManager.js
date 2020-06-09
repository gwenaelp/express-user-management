module.exports = {
  getManager() {
    const adapter = require('./options').get().adapter;
    return {
      'passport-mongo': require('./adapters/passport-mongo/tokenExpirationManager'),
      'passport-postgre': require('./adapters/passport-postgres/tokenExpirationManager'),
    }[adapter];
  },
  newTokenForUser(username, token) {
    return this.getManager().newTokenForUser(username, token);
  },
  isTokenValid(tokenToCheck) {
    return this.getManager().isTokenValid(tokenToCheck);
  },
  listTokens() {
    return this.getManager().listTokens();
  },
  revokeToken(token) {
    return this.getManager().revokeToken(token);
  }
};
