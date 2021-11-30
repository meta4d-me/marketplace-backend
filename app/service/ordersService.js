const Service = require('egg').Service;
const constant = require('../utils/constant');

class OrdersService extends Service {
    async queryOrder(order_id, token_id, status, contract, seller, buyer) {
        if (!order_id && !token_id && !status && !contract && !seller && !buyer) {
            return this.app.mysql.select('order', {where: {status: constant.OrderStatusInit}});
        }
        let sql = 'select * from `order`';
        let condition = [];
        let param = [];
        if (order_id) {
            condition.push('order_id=?');
            param.push(order_id);
        }
        if (token_id) {
            condition.push('token_id=?');
            param.push(token_id);
        }
        if (status) {
            condition.push('status=?');
            param.push(status);
        }
        if (contract) {
            condition.push('contract=?');
            param.push(contract);
        }
        if (seller) {
            condition.push('seller=?');
            param.push(seller);
        }
        if (buyer) {
            condition.push('buyers LIKE ?');
            param.push("%" + buyer + "%");
        }
        sql += ' where ' + condition.join(' and ');
        return await this.app.mysql.query(sql, param);
    }
}

module.exports = OrdersService;
