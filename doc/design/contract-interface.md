# 合约接口

## RPCRouter

RPCRouter主要用来收集手续费，用户铸造NFT、交易NFT都需要支付手续费，铸造NFT的手续费数量和交易NFT的手续费费率都可以从RPCRouter合约中查询。

## 铸造NFT

铸造过程：

- 调用RPCRouter，检查NFT铸造费；
- 如果NFT铸造费大于零，则检查用户是否对RPCRouter授权过rpc
- 如果未授权，则需要用户approve
- 授权结束后，开始铸造NFT
    - 先上传图片到IPFS，拿到URI
    - 调用合约的铸造接口

具体过程可参考[example](./example.js)

### 铸造MEME

MEME的URI（图片等资源链接）是预定义的，所以用户铸造MEME时不需要传URI作为参数

```
function mint(address to) public
```

### 铸造MEME2

MEME2的URI是自定义的，所以用户铸造MEME时需要传URI作为参数

```
function mint(address to, string memory uri) public
```
