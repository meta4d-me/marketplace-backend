# marketplace-backend

```
curl -d '{
  "addr": "0x",
  "platform":"Meta4D",
  "tid": "aa",
  "sig": "0x"
}' -H "Content-Type: application/json" -X POST http://localhost:7001/api/v1/bind-addr

curl -d '{
  "addr": "0x",
  "platform":"Meta4D",
  "tid": "aa",
  "content_id": "12345"
}' -H "Content-Type: application/json" -X POST http://localhost:7001/api/v1/bind-addr/record

curl -d '{
  "addr": "0x",
  "platform":"Meta4D",
  "tid": "aa"
}' -H "Content-Type: application/json" -X POST http://localhost:7001/api/v1/unbind-addr

http://localhost:7001/api/v1/bind-attr?addr=0x&tid=aa

curl -d '{
  "addr": "0x",
  "contract": "0x",
  "token_id": "1",
  "uri": "uri",
  "fav": 1
}' -H "Content-Type: application/json" -X POST http://localhost:7001/api/v1/favorite-nft

http://localhost:7001/api/v1/favorite?addr=0x&contract=0x

http://localhost:7001/api/v1/nfts?addr=0x&contract=0x

http://localhost:7001/api/v1/orders?order_id=1

http://localhost:7001/api/v1/orders?token_id=2

http://localhost:7001/api/v1/records?contract=0x&tokenId=0
```

## TODO

- contract interface document;
    - need more;
- paging query;
- support ERC-1155;
- test with DAI;
