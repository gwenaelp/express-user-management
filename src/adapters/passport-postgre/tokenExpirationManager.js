module.exports = {
    tokens: {},
    newTokenForUser(username, token) {
        this.tokens[token] = { username, since: new Date().toJSON() };
    },
    isTokenValid(tokenToCheck) {
        const token = this.tokens[tokenToCheck];
        if (token !== undefined) {
            this.tokens[tokenToCheck].lastUsed = new Date().toJSON();
            return true;
        } else {
            return false;
        }
    },
    async listTokens() {
        return await this.tokens;
    },
    revokeToken(token) {
        delete this.tokens[token];
    }
}
