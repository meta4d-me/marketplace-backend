const Service = require('egg').Service;

class NFTService extends Service {
    async queryNFT(addr, contract, tokenId) {
        let opt = {};
        if (addr) {
            opt.owner = addr;
        }
        if (contract) {
            opt.contract = contract;
            if (tokenId) {
                opt.token_id = tokenId;
            }
        }
        return this.app.mysql.select('nft', {where: opt});
    }

    async queryFavorite(addr, contract) {
        let opt = {addr: addr};
        if (contract) {
            opt.contract = contract;
        }
        return this.app.mysql.select('favorite', {where: opt});
    }

    async favorite(addr, contract, token_id, uriParam) {
        let uri = await this.app.mysql.select('nft', {
            where: {contract: contract, token_id: token_id},
            columns: ['uri'],
            distinct: true
        });
        if (uri === undefined || uri.length === 0) {
            uri = uriParam;
        } else {
            uri = uri[0].uri;
        }
        await this.app.mysql.insert('favorite', {addr: addr, contract: contract, token_id: token_id, uri: uri});
    }

    async notFavorite(addr, contract, token_id) {
        await this.app.mysql.delete('favorite', {addr: addr, contract: contract, token_id: token_id});
    }
}

module.exports = NFTService;
