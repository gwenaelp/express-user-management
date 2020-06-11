module.exports = {
    getCollection() {
        return require("./db").collection("user-token");
    },
    async newTokenForUser(username, token) {
        await this.getCollection().updateOne(
            { _id: token },
            { $set: { username, since: new Date().toJSON() } },
            { upsert: true }
        );
    },
    async isTokenValid(tokenToCheck) {
        const token = await this.getCollection().findOne({_id: tokenToCheck });
        if (!!token) {
            await this.getCollection().updateOne(
                { _id: tokenToCheck },
                { $set: { lastUsed : new Date().toJSON() } }
            );
            return true;
        } else {
            return false;
        }
    },
    async listTokens() {
        const tokenDocuments = await this.getCollection().find().toArray();
        return tokenDocuments;
    },
    async revokeToken(token) {
        await this.getCollection().deleteOne({_id: token});
    }
}
