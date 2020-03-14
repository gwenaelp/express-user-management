module.exports = {
  tokens: {},
  newTokenForUser (username, token) {
    this.tokens[token] = { username, since: new Date().toJSON() };
  },
  isTokenValid (tokenToCheck) {
    const token = this.tokens[tokenToCheck];
    if(token !== undefined) {
      this.tokens[tokenToCheck].lastUsed = new Date().toJSON();
      return true;
    } else {
      return false;
    }
  },
  listTokens () {
    return this.tokens;
  },
  revokeToken (token) {
    console.log('revoke token', this.tokens[token]);
    delete this.tokens[token];
  }
};
