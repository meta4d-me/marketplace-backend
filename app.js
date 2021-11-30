const Web3 = require('web3');

module.exports = app => {
    app.validator.addRule('address', (rule, value) => {
        if (!Web3.utils.isAddress(value)) {
            return 'illegal addr';
        }
    })
};
