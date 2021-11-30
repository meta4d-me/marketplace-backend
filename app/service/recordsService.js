const Service = require('egg').Service;

class RecordsService extends Service {
    async queryRecord(contract, tokenId) {
        return this.app.mysql.select('deal', {
            where: {contract: contract, token_id: tokenId}
        });
    }
}

module.exports = RecordsService;
