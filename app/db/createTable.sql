create table if not exists `bind_addr`
(
    addr       varchar(42)  not null,
    platform   varchar(10)  not null,
    tid        varchar(100) not null,
    content_id varchar(100) not null,
    primary key (addr, platform, tid)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

create table if not exists `favorite`
(
    addr     varchar(42)   not null,
    contract varchar(42)   not null,
    token_id BIGINT        not null,
    uri      varchar(1000) not null,
    primary key (addr, contract, token_id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

create table if not exists `nft`
(
    contract     varchar(42)   not null,
    erc          varchar(5)    not null,
    token_id     BIGINT        not null,
    amount       BIGINT        not null,
    uri          varchar(1000) not null,
    owner        varchar(42)   not null,
    update_block BIGINT        not null,
    primary key (contract, token_id, amount, owner)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

create table if not exists `order`
(

    order_id     bigint         not null
        primary key,
    status       tinyint        not null,
    contract     varchar(42)    not null,
    erc          varchar(5)     not null,
    token_id     bigint         not null,
    uri          varchar(1000)  not null,
    seller       varchar(42)    not null,
    sell_token   varchar(42)    not null,
    init_amount  bigint         not null,
    min_price    varchar(40)    not null,
    max_price    varchar(40)    not null,
    start_block  bigint         not null,
    duration     bigint         not null,
    amount       varchar(40)    not null,
    final_price  varchar(40)    not null,
    buyers       varchar(10240) not null,
    update_block bigint         not null
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

create table if not exists `deal`
(
    order_id    bigint      not null,
    contract    varchar(42) not null,
    token_id    bigint      not null,
    seller      varchar(42) not null,
    buyer       varchar(42) not null,
    sell_token  varchar(42) not null,
    amount      varchar(40) not null,
    cash_amount varchar(40) not null,
    deal_block  bigint      not null,
    tx_index    int         not null,
    log_index   int         not null,
    primary key (deal_block, tx_index, log_index)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;
