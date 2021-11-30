# Marketplace DB

## Twitter & Address

用来绑定Twitter账号和用户地址

| Key | type |Desc | Note |
| --- | --- | --- | --- |
| addr | varchar | 用户地址 | 与ID共同构成主键 | 
| tid | string | 用户社交平台的id | 共同构成主键 |
| platform | string | 用户社交平台 | 共同构成主键 |
| content_id | string | 绑定时发的推文内容的id |  |

## Favorite

用户收藏了哪些NFT

| Key | type |Desc | Note |
| --- | --- | --- | --- |
| addr | varchar | 用户地址 | |
| contract | varchar | NFT合约 | |
| token_id | 大整型 | NFT token_id | |
| uri | string | Token uri |

> (addr, contract, token_id)构成唯一约束

## NFT

| Key | type |Desc | Note |
| --- | --- | --- | --- |
| contract | varchar | NFT合约地址 |  |
| ERC | string | 721或者1155 | 协议标准 |
| token_id | 大整型 | NFT ID ||
| amount | 大整型 | 1155的同ID的NFT数量不止一个，721的只有1个| |
| uri | string | Token uri |
| owner | varchar | token持有人 | 如果token被挂单出售了，则持有人是订单的seller |
| update_block | 大整型 | 数据库中NFT对应的区块高度 | |

> (contract, token_id, amount, owner)是主键

## Order

与合约数据保持一致

| Key | type |Desc | Note |
| --- | --- | --- | --- |
| order_id | 大整型 | 订单ID | 主键 |
| status | 小整型 | 订单状态 | |
| contract | varchar | NFT合约地址 | | 
| erc | string | 721或者1155 | 协议标准 |
| token_id | 大整型 | NFT ID ||
| uri | string | Token uri |
| seller | varchar | 挂单用户地址 | |
| sell_token | varchar | 挂单用户出售NFT想获得的ERC20代币地址，如果是0，则表示ETH | |
| init_amount | 字符串 | 订单初始数量 | |
| mint_price | 字符串 | 订单最低价 | |
| max_price | 字符串 | 订单最高价 | |
| start_block | 大整型 | 订单价格开始下降的区块 | |
| duration |  大整型 | 订单价格下降的持续时长 | |
| amount | 字符串 | 剩余未售出的NFT数量 | |
| final_price | 字符串 | 订单全部成交时，最后一笔成交时的价格 | |
| buyers | varchar | 所有购买人 | |
| update_block | 大整型 | 数据库中订单对应的区块高度 | |

## Deal

ERC-1155的订单成交可能分好几次

| Key | type |Desc | Note |
| --- | --- | --- | --- |
| order_id | 大整型 | 订单ID | 主键 |
| contract | varchar | NFT合约地址 | |
| token_id | 大整型 | NFT ID ||
| seller | varchar | 挂单用户地址 | |
| buyer | varchar | 购买人 | |
| sell_token | varchar | 出售NFT获得的ERC20代币地址，如果是0，则表示ETH | |
| amount | 字符串 | 成交量 | |
| cash_amount | 字符串 | 成交额 | |
| deal_block | 大整型 | 成交的区块号 | |
| tx_index | int | 成交的交易在块中的顺序 | |
| log_index | int | event在交易中的顺序 | |
