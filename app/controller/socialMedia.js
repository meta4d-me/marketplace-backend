const Controller = require('egg').Controller;
const data = require('./data');
const Web3 = require('web3');
const web3 = new Web3();
const constant = require('../utils/constant');

class SocialMediaController extends Controller {
    async bindAddr() {
        const {ctx} = this;
        let param = ctx.request.body;
        ctx.validate({
            addr: 'address'
        }, param);
        let valid = false;
        for (let i = 0; i < constant.SOCIAL_MEDIAS.length; i++) {
            if (constant.SOCIAL_MEDIAS[i] === param.platform) {
                valid = true;
                break;
            }
        }
        if (!valid) {
            ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, 'illegal param: platform', {});
            return;
        }
        let message = param.platform + param.tid;
        let signer = web3.eth.accounts.recover(message, param.sig);
        valid = signer === param.addr;
        if (valid) {
            await this.ctx.service.socialMediaService.addBind(param.addr, param.platform, param.tid);
            ctx.body = data.newNormalResp({});
        } else {
            ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_SIG, 'illegal sig', {});
        }
    }

    async recordContentId() {
        const {ctx} = this;
        let param = ctx.request.body;
        ctx.validate({
            addr: 'address'
        }, param);
        let valid = false;
        for (let i = 0; i < constant.SOCIAL_MEDIAS.length; i++) {
            if (constant.SOCIAL_MEDIAS[i] === param.platform) {
                valid = true;
                break;
            }
        }
        if (!valid) {
            ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, 'illegal param: platform', {});
            return;
        }
        await this.ctx.service.socialMediaService.recordContentId(param.addr, param.platform, param.tid, param.content_id);
        ctx.body = data.newNormalResp({});
    }

    async unbind() {
        const {ctx} = this;
        let param = ctx.request.body;
        ctx.validate({
            addr: 'address'
        }, param);
        let valid = false;
        for (let i = 0; i < constant.SOCIAL_MEDIAS.length; i++) {
            if (constant.SOCIAL_MEDIAS[i] === param.platform) {
                valid = true;
                break;
            }
        }
        if (!valid) {
            ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, 'illegal param: platform', {});
            return;
        }
        await this.ctx.service.socialMediaService.unbind(param.addr, param.platform, param.tid);
        ctx.body = data.newNormalResp({});
    }

    async bindAttr() {
        const {ctx} = this;
        let param = ctx.request.query;
        if (param.addr || param.tid) {
            this.ctx.body = data.newNormalResp(await this.ctx.service.socialMediaService.queryBind(param.addr, param.tid));
        } else {
            this.ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, 'empty param', {});
        }

    }
}

module.exports = SocialMediaController;
