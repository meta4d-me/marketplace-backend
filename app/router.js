module.exports = app => {
    const {router, controller} = app;
    router.get('/', controller.index.index);
    router.get('/api/v1', controller.index.index);

    router.post('/api/v1/bind-addr', controller.socialMedia.bindAddr);
    router.post('/api/v1/bind-addr/record', controller.socialMedia.recordContentId);
    router.post('/api/v1/unbind-addr', controller.socialMedia.unbind);
    router.post('/api/v1/favorite-nft', controller.nft.favoriteNFT);

    router.get('/api/v1/favorite', controller.nft.queryFavorite);
    router.get('/api/v1/bind-attr', controller.socialMedia.bindAttr);
    router.get('/api/v1/nfts', controller.nft.queryNFT);
    router.get('/api/v1/orders', controller.orders.queryOrder);
    router.get('/api/v1/records', controller.records.queryRecord);
};
