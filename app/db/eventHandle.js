const zeroAddr = require('../utils/constant').zeroAddr;

async function handleMakeOrder(agent, event) {
    try {
        await syncOrder(agent, event);
        agent.logger.info('handle make order, height', event.blockNumber);
    } catch (e) {
        agent.logger.error('handle make order event failed, event: %s, err: %s', JSON.stringify(event), e);
    }
}

async function handleTakeOrder(agent, event) {
    try {
        await syncOrder(agent, event);
        agent.logger.info('handle take order, height', event.blockNumber);
    } catch (e) {
        agent.logger.error('handle take order event failed, event: %s, err: %s', JSON.stringify(event), e);
    }
}

async function handleCancelOrder(agent, event) {
    try {
        await syncOrder(agent, event);
        agent.logger.info('handle cancel order, height', event.blockNumber);
    } catch (e) {
        agent.logger.error('handle cancel order event failed, event: %s, err: %s', JSON.stringify(event), e);
    }
}

async function handleERC721Transfer(agent, event) {
    try {
        await syncERC721(agent, event.address, event.returnValues.tokenId);
        agent.logger.info('handle %s:%s transfer, height', event.address, event.returnValues.tokenId, event.blockNumber);
    } catch (e) {
        agent.logger.error('handle ERC721 transfer event failed, event: %s, err: %s', JSON.stringify(event), e);
    }
}

async function removeMakeOrder(agent, event) {
    try {
        await syncOrder(agent, event);
        agent.logger.info('handle remove make order, height', event.blockNumber);
    } catch (e) {
        agent.logger.error('handle remove make order event failed, event: %s, err: %s', JSON.stringify(event), e);
    }
}

async function removeTakeOrder(agent, event) {
    try {
        await syncOrder(agent, event);
        agent.logger.info('handle remove take order, height', event.blockNumber);
    } catch (e) {
        agent.logger.error('handle remove take order event failed, event: %s, err: %s', event, e);
    }
}

async function removeCancelOrder(agent, event) {
    try {
        await syncOrder(agent, event);
        agent.logger.info('handle remove cancel order, height', event.blockNumber);
    } catch (e) {
        agent.logger.error('handle remove cancel order event failed, event: %s, err: %s', JSON.stringify(event), e);
    }
}

async function removeERC721Transfer(agent, event) {
    try {
        await syncERC721(agent, event.address, event.returnValues.tokenId);
        agent.logger.info('handle remove %s transfer, height', event.address, event.blockNumber);
    } catch (e) {
        agent.logger.error('handle remove ERC721 transfer event failed, event: %s, err: %s', JSON.stringify(event), e);
    }
}

async function syncERC721(agent, contract, tokenId) {
    let opt = {
        contract: contract,
        token_id: tokenId
    };
    let dbNFT = await agent.mysql.get('nft', opt);
    let currentHeight = await agent.web3.eth.getBlockNumber();
    let nft = await new agent.web3.eth.Contract(agent.erc721Abi, contract);
    if (!dbNFT) {
        let owner = await nft.methods.ownerOf(tokenId).call();
        let uri = await nft.methods.tokenURI(tokenId).call();
        let row = {
            contract: contract,
            erc: 721,
            token_id: tokenId,
            amount: 1,
            uri: uri,
            owner: owner,
            update_block: currentHeight,
        };
        await agent.mysql.insert('nft', row);
        await agent.mysql.update('favorite', {uri: uri}, {where: opt})
    } else if (dbNFT.update_block <= currentHeight) {
        let row = {owner: await nft.methods.ownerOf(tokenId).call(), update_block: currentHeight};
        await agent.mysql.update('nft', row, {where: opt});
    }
}

async function syncOrder(agent, event) {
    let isTakeOrderEvent = event.event === 'TakeOrder';
    let conn = await agent.mysql.beginTransaction();
    try {
        let orderId = event.returnValues.orderId;
        let opt = {order_id: orderId};
        let order = await agent.market.methods.orders(orderId).call();
        if (order.seller === zeroAddr) {
            await conn.delete('order', opt);
            return;
        }
        let buyers = await agent.market.methods.orderBuyers(orderId).call();
        let dbOrder = await conn.get('order', opt);
        let currentHeight = await agent.web3.eth.getBlockNumber();
        if (!dbOrder) {
            let erc, uri;
            if (order.is721) {
                erc = 721;
                let nft = new agent.web3.eth.Contract(agent.erc721Abi, order.nft);
                uri = await nft.methods.tokenURI(order.tokenId).call();
            } else {
                erc = 1155;
                let nft = new agent.web3.eth.Contract(agent.erc1155Abi, order.nft);
                uri = await nft.methods.uri(order.tokenId).call();
                uri = uri.replace('{id}', order.tokenId);
            }
            await conn.query(
                'REPLACE into `order` (order_id,status,contract,erc,token_id,uri,seller,sell_token,init_amount,min_price,max_Price,' +
                'start_block,duration,amount,final_price,buyers,update_block) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                [orderId, order.status, order.nft, erc, order.tokenId, uri, order.seller, order.sellToken,
                    order.initAmount, order.minPrice, order.maxPrice, order.startBlock, order.duration, order.amount,
                    order.finalPrice, buyers.join(','), currentHeight]);
        } else if (dbOrder.update_block <= currentHeight) {
            await conn.update(`order`, {
                status: order.status,
                amount: order.amount,
                final_price: order.finalPrice,
                buyers: buyers.join(','),
                update_block: currentHeight
            }, {where: opt});
        }
        if (isTakeOrderEvent) {
            if (!event.removed) {
                await conn.insert('deal', {
                    order_id: orderId,
                    contract: order.nft,
                    token_id: order.tokenId,
                    seller: order.seller,
                    buyer: event.returnValues.buyer,
                    sell_token: order.sellToken,
                    amount: event.returnValues.amount,
                    cash_amount: event.returnValues.rpcAmount,
                    deal_block: event.blockNumber,
                    tx_index: event.transactionIndex,
                    log_index: event.logIndex
                });
            } else {
                conn.delete('deal', {tx_index: event.transactionIndex, log_index: event.logIndex});
            }
        }
        conn.commit();
    } catch (e) {
        conn.rollback()
        throw e;
    }
}

module.exports = {
    handleMakeOrder, handleTakeOrder, handleCancelOrder,
    handleERC721Transfer,
    removeMakeOrder, removeTakeOrder, removeCancelOrder,
    removeERC721Transfer,
}
