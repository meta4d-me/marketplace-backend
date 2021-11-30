const Controller = require('egg').Controller;
const data = require('./data');
const Web3 = require('web3');
const web3 = new Web3();
const constant = require('../utils/constant');

class NFTController extends Controller {
    async favoriteNFT() {
        const {ctx} = this;
        let param = ctx.request.body;
        ctx.validate({
            contract: 'address'
        }, param);
        if (!param.token_id) {
            ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, 'illegal param: token_id', {});
            return;
        }
        ctx.logger.info(param.addr, param.contract, param.token_id, param.fav);
        if (param.fav === 1 || param.fav === '1') {
            await ctx.service.nftService.favorite(param.addr, param.contract, param.token_id, param.uri);
        } else if (param.fav === 0 || param.fav === '0') {
            await ctx.service.nftService.notFavorite(param.addr, param.contract, param.token_id);
        }
        ctx.body = data.newNormalResp({});
    }

    async queryFavorite() {
        const {ctx} = this;
        let param = ctx.query;
        ctx.validate({
            addr: 'address'
        }, param);
        if (!web3.utils.isAddress(param.contract)) {
            param.contract = undefined;
        }
        ctx.body = data.newNormalResp(await ctx.service.nftService.queryFavorite(param.addr, param.contract));
    }

    async queryNFT() {
        const {ctx} = this;
        let param = ctx.query;
        if (!web3.utils.isAddress(param.contract)) {
            param.contract = undefined;
        }
        if (!web3.utils.isAddress(param.addr)) {
            param.addr = undefined;
        }
        if (!param.addr && !param.contract) {
            ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, 'illegal user addr and contract addr', {});
        }
        ctx.body = data.newNormalResp(await ctx.service.nftService.queryNFT(param.addr, param.contract, param.token_id));
    }
}

module.exports = NFTController;
