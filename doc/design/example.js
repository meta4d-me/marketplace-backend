const Web3 = require('web3');
const Market = require('../../contracts/Market.json');
const Meme = require('../../contracts/MetaMEME.json');
const Meme2 = require('../../contracts/MetaMEME2.json');
const Meme2WithoutRPC = require('../../contracts/MetaBatchMEME.json');
const RPCRouter = require('../../contracts/RPCRouter.json');
const DealRouter = require('../../contracts/DealRouter.json');
const RPC = require('../../contracts/ERC20.json');
const maxUint256 = web3.utils.toBN(2).pow(web3.utils.toBN(256)).sub(web3.utils.toBN(1));

let web3 = new Web3(config.web3Provider);
let market = new web3.eth.Contract(Market.abi, config.contracts.Market);
let meme = new web3.eth.Contract(Meme.abi, config.contracts.PlatwinMEME);
let meme2 = new web3.eth.Contract(Meme2.abi, config.contracts.PlatwinMEME2);
let batchMeme = new web3.eth.Contract(BatchMeme.abi, config.contracts.PlatwinBatchMeme);
let rpcRouter = new web3.eth.Contract(RPCRouter.abi, config.contracts.RPCRouter);
let dealRouter = new web3.eth.Contract(DealRouter.abi, config.contracts.DealRouter);
let cash = new web3.eth.Contract(RPC.abi, config.contracts.RPC);

/* 铸造MEME2 */
let mintFee = (await rpcRouter.methods.fixedAmountFee(config.contracts.PlatwinMEME2))[0];
// 手续费大于0
if (mintFee.gt(0)) {
    let allowance = await cash.methods.allowance(user, config.contracts.RPCRouter);
    if (allowance.lt(mintFee)) {
        await cash.approve(config.contracts.RPCRouter, maxUint256);
    }
}
// 铸造
let uri = 'ipfs://abcdefghijklmnopqrstuvwxyz';
let tokenId;
await meme2.mint(user, uri).send({from: user})
    .then(function (receipt) {
        // 从交易中取出铸造的NFT的tokenId
        let transferEvts = receipt.events.Transfer;
        for (let i = 0; i < transferEvts.length; i++) {
            if (transferEvts[i].address === config.contracts.PlatwinMEME2) {
                tokenId = transferEvts[i].returnValues.tokenId;
            }
        }
    });
// 查询token的minter
console.log('the minter of #%s meme2 is', tokenId, await meme2.minter(tokenId));

/* 出售NFT */
// 出售ERC-721的NFT
let approver = await meme2.methods.getApproved(tokenId).call();
let approved = approver === config.contracts.Market
    || await meme2.methods.isApprovedForAll(user, config.contracts.Market).call();
if (!approved) {
    // 授权单个NFT给market
    await meme2.approve(config.contracts.market, tokenId);
    // 或者授权所有meme2给market
    await meme2.setApprovalForAll(config.contracts.market, true);
}
// 调用market合约挂单出售
let minPrice = web3.utils.toBN('1000000000000000000');
let maxPrice = web3.utils.toBN('8000000000000000000');
let startBlock = (await web3.eth.getBlockNumber()).addn(10);
let duration = 100;
// 出售并获取订单Id
let orderId;
const emptyAddr = ethers.utils.getAddress("0x0000000000000000000000000000000000000000");
// RPCRouter升级成DealRouter之后，用户挂单需要指定sell token的地址，测试可以先用TestERC20地址，或者ETH地址，先不要用RPC地址
// 铸造的NFT不受影响，可以用之前的，也可以用新的PlatwinMEME2WithoutRPC，新的NFT不用花RPC
market.methods.makeOrder(true, config.contracts.PlatwinMEME2, tokenId, 1, emptyAddr, minPrice, maxPrice, startBlock,
    duration)
    .send({from: user})
    .then(function (receipt) {
        orderId = receipt.events.MakeOrder.returnValues.orderId;
    });

// 出售ERC-1155的NFT
approved = await batchMeme.isApprovedForAll(user, config.contracts.Market).call();
if (!approved) {
    await batchMeme.setApprovalForAll(config.contracts.market, true);
}
// 调用market合约挂单出售
await market.methods.makeOrder(false, config.contracts.PlatwinBatchMeme, tokenId, 1, emptyAddr, minPrice, maxPrice,
    startBlock, duration)
    .send({from: user})
    .then(function (receipt) {
        orderId = receipt.events.MakeOrder.returnValues.orderId;
    });

/* 查询订单 */
// 查询订单可以从后端服务查，也可以直接从链上查，这里是从链上查
let order = await market.methods.orders(orderId).call();

/* 撤单 */
await market.methods.cancelOrder(orderId).send({from: user});

/* 吃单 */
// 这里吃单的时候要注意，如果order的sell_token是ERC20合约，则要先做approve给router，例如
if (order.sellToken !== emptyAddr) {
    let sellToken = await RPC.attach(order.sellToken);
    let allowance = await sellToken.allowance(user, dealRouter.address);
    if (allowance.lt(order.amount.mul(order.maxPrice))) {
        await sellToken.approve(dealRouter.address, maxUint256);
    }
}
// 吃ERC-721的单，数量只能是1个
await market.methods.takeOrder(orderId, 1).send({from: user});
// 吃ERC-1155的单，第二个参数可以大于1，但是要小于订单的剩余数量
let amount = order.amount / 2;
await market.methods.takeOrder(orderId, amount).send({from: user});

// 如果sellToken是ETH，则记得把value带上，可以多带一点，合约会把多付的钱退回给用户，这样可以防止因为链下价格估算的偏差导致付款不足交易失败，例如
await market.methods.takeOrder(orderId, amount).send({from: user, value: amount * order.maxPrice});

/* 绑定Twitter账号 */
let platform = 'Twitter';
let tid = 'aaa123123132'
let message = platform + tid;
let sig = web3.eth.sign(platform + message, user.address);
