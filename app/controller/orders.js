const Controller = require('egg').Controller;
const data = require('./data');

class OrderController extends Controller {
    async queryOrder() {
        const {ctx} = this;
        let param = ctx.query;
        ctx.body = data.newNormalResp(await ctx.service.ordersService.queryOrder(param.order_id, param.token_id,
            param.status, param.contract, param.seller, param.buyer));
    }
}

module.exports = OrderController;
