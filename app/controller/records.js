const Controller = require('egg').Controller;
const data = require('./data');

class RecordController extends Controller {
    async queryRecord() {
        const {ctx} = this;
        let param = ctx.query;
        ctx.logger.info(param.contract, param.tokenId);
        ctx.validate({
            contract: 'address'
        }, param);
        ctx.body = data.newNormalResp(await ctx.service.recordsService.queryRecord(param.contract, param.tokenId));
    }
}

module.exports = RecordController;
