const Service = require('egg').Service;

class SocialMediaService extends Service {
    async addBind(addr, platform, tid) {
        await this.app.mysql.query('replace into bind_addr values (?,?,?,?)', [addr, platform, tid, '']);
    }

    async recordContentId(addr, platform, tid, contentId) {
        await this.app.mysql.update('bind_addr', {content_id: contentId}, {
            where: {
                addr: addr,
                platform: platform,
                tid: tid,
            }
        });
    }

    async unbind(addr, platform, tid) {
        await this.app.mysql.delete('bind_addr', {
            addr: addr,
            platform: platform,
            tid: tid
        });
    }

    async queryBind(addr, tid) {
        let condition = [];
        let param = [];
        if (addr) {
            condition.push('addr=?');
            param.push(addr);
        }
        if (tid) {
            condition.push('tid=?');
            param.push(tid);
        }
        let sql = 'select * from bind_addr where ' + condition.join(' and ');
        return this.app.mysql.query(sql, param);
    }
}

module.exports = SocialMediaService;
