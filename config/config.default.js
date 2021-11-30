const env = require('./env.json');

exports.keys = 'my-cookie-secret-key';
exports.security = {
    csrf: {
        enable: false,
    },
};

exports.cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH'
};

// block chain config
exports.web3Provider = 'wss://ws-matic-mumbai.chainstacklabs.com';
exports.contracts = {
    MockRPC: '0x',
    RPCRouter: '0x',
    MetaMEME: '0x',
    MetaMEME2: '0x',
    MetaBatchMeme: '0x',
    Market: '0x',
    MarketProxy: '0x',
    TestERC20: '0x',
    DealRouter: '0x',
    MarketWithoutRPC: '0x',
    MarketProxyWithoutRPC: '0x',
    MetaMEME2WithoutRPC: '0x'
}

exports.startHeight = 20319006;

exports.mysql = {
    client: {
        host: 'localhost',
        port: '3306',
        user: env.MYSQL_USER,
        password: env.MYSQL_PASSWORD,
        database: 'meta4d',
    },
    app: true,
    agent: true
};
