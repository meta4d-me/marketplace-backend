# 前后端接口

## Twitter等社交媒体相关

### 绑定社交账号和用户地址

method: POST

url: api/v1/bind-addr

params:

```json
{
  "addr": "",
  "tid": "",
  "platform": "",
  "sig": ""
}
```

> note: sig是`platform`+`tid`的签名，签名生成方式见[example.js](./example.js)
> paltform是{Twitter，Facebook，Instagram}中的一种，注意要区分大小写

return:

```json
{
  "code": "",
  "error": "",
  "data": {}
}
```

> note: 一个地址可以绑定不超过十个社交媒体账号

### 记录绑定推文

method: POST

url: api/v1/bind-addr/record

params:

```json
{
  "addr": "",
  "tid": "",
  "platform": "",
  "content_id": ""
}
```

return:

```json
{
  "code": "",
  "error": "",
  "data": {}
}
```

> note: `addr`, `platform`, `tid`都要传

### 解除绑定

method: POST

url: api/v1/unbind-addr

params:

```json
{
  "addr": "",
  "tid": "",
  "platform": ""
}
```

return:

```json
{
  "code": "",
  "error": "",
  "data": {}
}
```

> note: `addr`, `platform`, `tid`都要传

### 查询绑定关系

method: get

url: api/v1/bind-attr?addr=xxx&tid=xxx

> note: addr和tid可以都传，至少传一个

return:

```json
{
  "code": "",
  "error": "",
  "data": [
    {
      "addr": "",
      "tid": "",
      "platform": ""
    }
  ]
}
```

## NFT相关

### 将NFT加到收藏列表

method: POST

url: api/v1/favorite-nft

params:

```json
{
  "addr": "",
  "contract": "",
  "token_id": "",
  "uri": "",
  "fav": 0
}
```

> fav等于0表示取消收藏，等于1表示收藏
> contract, token_id必须传

return:

```json
{
  "code": "",
  "error": "",
  "data": {}
}
```

### 查询用户的收藏列表

method: get

url: api/v1/favorite?addr=xxx&contract=xxx

> note: addr必须传，contract可以传

return:

```
{
  "code": "",
  "error": "",
  "data": [
    {
      "addr": "",
      "contract": "",
      "token_id": "",
      "uri": "" // 资源定位符，ipfs索引或者其他服务器资源
    }
  ]
}
```

### 查询用户拥有的NFT

method: get

url: api/v1/nfts?addr=xxx&contract=xxx&token_id=xxx

> note: addr和contract必须至少传一个，token_id可以传

return:

```
{
  "code": "",
  "error": "",
  "data": [
    {
      "contract": "", // 合约地址
      "erc": "", // 协议标准，1155或者721
      "token_id": "", // 
      "amount": "", // 数量，1155的同ID的NFT数量不止一个，721的只有1个
      "uri": "", // 资源定位符，ipfs索引或者其他服务器资源
      "owner": "", // 拥有者，等于传的addr参数
      "update_block": "" // 该NFT状态更新的区块号
    }
  ]
}
```

### 查询订单

method: get

url: api/v1/orders?order_id=xxx&status=xxx&contract=xxx&seller=xxx&buyer=xxx&token_id=xxx

> note: 如果什么参数都不传，则默认返回的是最新的未成交的所有订单

return:

```
{
  "code": "",
  "error": "",
  "data": [
    {
      "order_id": "", // 订单id
      "status": "", // 订单状态
      "contract": "", // NFT合约地址
      "erc": "", // 721或者1155
      "token_id": "", // 
      "uri": "",
      "seller": "", // 挂单用户地址
      "sell_token": "", // 挂单用户出售NFT想获得的ERC20代币地址，如果是0，则表示ETH
      "init_amount": "", // 初始出售数量
      "min_price": "", // 最低出售价格
      "max_price": "", // 最高出售价格
      "start_block": "", // 订单价格开始下降的区块
      "duration": "", // 订单价格下降的持续时长
      "amount": "", // 剩余未售出的NFT数量
      "final_price": "", // 订单全部成交时，最后一笔成交时的价格，没有完全成交的话则为0
      "buyers": "", // 所有购买人
      "update_block": "" // 订单状态更新的区块号
    }
  ]
}
```

> note: 订单状态有(0,1,2,3,4)五种值，分别表示：刚创建、部分成交、完全成交、部分成交后被撤单、未成交就撤单

### 查询NFT成交记录

method: get

url: api/v1/records?contract=xxx&token_id=xxx

return:

```
{
  "code": "",
  "error": "",
  "data": [
    {
      "order_id": "", // 订单id
      "contract": "", // NFT合约地址
      "token_id": "", // 
      "seller": "",
      "buyer": "",
      "sell_token": "", // 出售NFT获得的ERC20代币地址，如果是0，则表示ETH
      "amount": "", // 成交量
      "cash_amount": "", // 成交额
      "deal_block": "", // 成交区块号
      "tx_index":"", // 成交的交易在区块中的顺序
      "log_index":"" // 成交event在同一笔交易中的位置（前端现在用不上）
    }
  ]
}
```

## 返回值

返回值的格式统一为

```json
{
  "code": "",
  "error": "",
  "data": {}
}
```

### code

`code=1`表示请求成功，其他表示失败。

### error

`code!=1`时，会有相关的错误信息。

### data

请求结果放在这个字段。
