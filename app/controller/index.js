const Controller = require('egg').Controller;

class IndexController extends Controller {
    async index() {
        const {ctx} = this;
        ctx.body = 'The Meta4D marketplace';
    }
}

module.exports = IndexController;
