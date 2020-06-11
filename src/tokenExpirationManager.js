module.exports = {
  getManager() {
    const adapter = require('./options').get().adapter;
    return {
      'passport-mongo': require('./adapters/passport-mongo/tokenExpirationManager'),
      'passport-postgre': require('./adapters/passport-postgre/tokenExpirationManager'),
    }[adapter];
  },
  newTokenForUser(username, token) {
    return this.getManager().newTokenForUser(username, token);
  },
  isTokenValid(tokenToCheck) {
    return this.getManager().isTokenValid(tokenToCheck);
  },
  async listTokens() {
    const tokens = await this.getManager().listTokens();
    console.log('listTokens', tokens);
    return tokens;
  },
  revokeToken(token) {
    return this.getManager().revokeToken(token);
  }
};
