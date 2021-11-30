const Web3 = require('web3');
const eventHandle = require('./app/db/eventHandle')
const Market = require('./contracts/Market.json');
const Meme = require('./contracts/MetaMEME.json');
const Meme2 = require('./contracts/MetaMEME2.json');
const Meme2WithoutRPC = require('./contracts/MetaBatchMEME.json');
const ERC721 = require('./contracts/ERC721.json');
const ERC1155 = require('./contracts/ERC1155.json');

module.exports = async agent => {
    agent.erc721Abi = ERC721.abi;
    agent.erc1155Abi = ERC1155.abi;
    let latestHeight = await getLatestBlock(agent);
    if (agent.config.startHeight > 0) {
        // we specify start height
        latestHeight = agent.config.startHeight;
    }
    await listenToContract(agent, latestHeight);

    setInterval(async () => {
        agent.web3.eth.getBlockNumber().then(
            (height) => agent.logger.info('current height is', height),
            (async reason => {
                agent.logger.error('cannot access to web3, reason: ', reason);
                agent.logger.info('reconnect...');
                await agent.web3.eth.clearSubscriptions();
                let maxHeight = await getLatestBlock(agent);
                await listenToContract(agent, maxHeight);
                agent.logger.info('reconnected');
            })
        )
    }, 5 * 60 * 1000);
};

async function listenToContract(agent, resetHeight) {
    agent.logger.info('listenToContract', resetHeight);
    // firstly, we clear deal record that deal_block > config.startHeight, so that we can re-sync
    await agent.mysql.query('delete from deal where deal_block>= ?', resetHeight);
    let web3 = new Web3(agent.config.web3Provider);
    let market = new web3.eth.Contract(Market.abi, agent.config.contracts.MarketProxyWithoutRPC);
    let meme = new web3.eth.Contract(Meme.abi, agent.config.contracts.MetaMEME);
    let meme2 = new web3.eth.Contract(Meme2.abi, agent.config.contracts.MetaMEME2);
    let meme2WithoutRPC = new web3.eth.Contract(Meme2.abi, agent.config.contracts.MetaMEME2WithoutRPC);
    agent.market = market;
    agent.web3 = web3;
    let makeOrderEmitter = market.events.MakeOrder({fromBlock: resetHeight}, (err, evt) => handleWeb3Err(agent, err));
    let takeOrderEmitter = market.events.TakeOrder({fromBlock: resetHeight}, (err, evt) => handleWeb3Err(agent, err));
    let cancelOrderEmitter = market.events.CancelOrder({fromBlock: resetHeight}, (err, evt) => handleWeb3Err(agent, err));
    let memeTransferEmitter = meme.events.Transfer({fromBlock: resetHeight}, (err, evt) => handleWeb3Err(agent, err));
    let meme2TransferEmitter = meme2.events.Transfer({fromBlock: resetHeight}, (err, evt) => handleWeb3Err(agent, err));
    let meme2WithoutRPCTransferEmitter = meme2WithoutRPC.events.Transfer({fromBlock: resetHeight}, (err, evt) =>
        handleWeb3Err(agent, err));

    // re-connect while error
    makeOrderEmitter.on('error', err => handleWeb3Err(agent, err));
    takeOrderEmitter.on('error', err => handleWeb3Err(agent, err));
    cancelOrderEmitter.on('error', err => handleWeb3Err(agent, err));
    memeTransferEmitter.on('error', err => handleWeb3Err(agent, err));
    meme2TransferEmitter.on('error', err => handleWeb3Err(agent, err));
    meme2WithoutRPCTransferEmitter.on('error', err => handleWeb3Err(agent, err));

    // connect success
    makeOrderEmitter.on('connected', id => agent.logger.info('makeOrder subscribed,', id));
    takeOrderEmitter.on('connected', id => agent.logger.info('takeOrder subscribed,', id));
    cancelOrderEmitter.on('connected', id => agent.logger.info('cancelOrder subscribed,', id));
    memeTransferEmitter.on('connected', id => agent.logger.info('transfer meme subscribed,', id));
    meme2TransferEmitter.on('connected', id => agent.logger.info('transfer meme2 subscribed,', id));
    meme2WithoutRPCTransferEmitter.on('connected', id => agent.logger.info('transfer meme2WithoutRPC subscribed,', id));

    // handle event
    makeOrderEmitter.on('data', evt => eventHandle.handleMakeOrder(agent, evt));
    takeOrderEmitter.on('data', evt => eventHandle.handleTakeOrder(agent, evt));
    cancelOrderEmitter.on('data', evt => eventHandle.handleCancelOrder(agent, evt));
    memeTransferEmitter.on('data', evt => eventHandle.handleERC721Transfer(agent, evt));
    meme2TransferEmitter.on('data', evt => eventHandle.handleERC721Transfer(agent, evt));
    meme2WithoutRPCTransferEmitter.on('data', evt => eventHandle.handleERC721Transfer(agent, evt));

    // event removed
    makeOrderEmitter.on('changed', evt => eventHandle.removeMakeOrder(agent, evt));
    takeOrderEmitter.on('changed', evt => eventHandle.removeTakeOrder(agent, evt));
    cancelOrderEmitter.on('changed', evt => eventHandle.removeCancelOrder(agent, evt));
    memeTransferEmitter.on('changed', evt => eventHandle.removeERC721Transfer(agent, evt));
    meme2TransferEmitter.on('changed', evt => eventHandle.removeERC721Transfer(agent, evt));
    meme2WithoutRPCTransferEmitter.on('changed', evt => eventHandle.removeERC721Transfer(agent, evt));
}

async function handleWeb3Err(agent, err) {
    if (err) {
        agent.logger.error('handleWeb3Err: %s', err);
    }
}

async function getLatestBlock(agent) {
    // query max reset height
    let dealMaxHeight = await agent.mysql.query('select max(deal_block) from deal');
    dealMaxHeight = dealMaxHeight[0]['max(deal_block)'];
    if (dealMaxHeight === null) {
        dealMaxHeight = 0;
    }
    let nftMaxHeight = await agent.mysql.query('select max(update_block) from nft');
    nftMaxHeight = nftMaxHeight[0]['max(update_block)'];
    if (nftMaxHeight === null) {
        nftMaxHeight = 0;
    }
    let orderMaxHeight = await agent.mysql.query('select max(update_block) from `order`');
    orderMaxHeight = orderMaxHeight[0]['max(update_block)'];
    if (orderMaxHeight === null) {
        orderMaxHeight = 0;
    }
    let maxHeight = dealMaxHeight;
    if (maxHeight < nftMaxHeight) {
        maxHeight = nftMaxHeight;
    }
    if (maxHeight < orderMaxHeight) {
        maxHeight = orderMaxHeight;
    }
    // Minus one is to prevent multiple events in the same block from being processed by only half
    if (maxHeight > 0) {
        maxHeight = maxHeight - 1;
    }
    return maxHeight;
}
