module.exports = {
  getManager() {
    const adapter = require('./options').get().adapter;
    return {
      'passport-mongo': require('./adapters/passport-mongo/tokenExpirationManager'),
      'passport-postgre': require('./adapters/passport-postgre/tokenExpirationManager'),
    }[adapter];
  },
  newTokenForUser(username, token, deviceDetect) {
    return this.getManager().newTokenForUser(username, token, deviceDetect);
  },
  isTokenValid(tokenToCheck, _this) {
    if (_this === undefined) {
      _this = this;
    }
    return _this.getManager().isTokenValid(tokenToCheck);
  },
  async listTokens() {
    const tokens = await this.getManager().listTokens();
    return tokens;
  },
  revokeToken(token) {
    return this.getManager().revokeToken(token);
  }
};
