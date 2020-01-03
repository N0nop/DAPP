# 使用方法
在Ganache中配置好区块链模拟环境，绑定`notebook/truffle-config.json`配置文件并设置一致端口

在`notebook/`路径下:
<br />进行合约的迁移部署和测试
```bash
truffle migrate
truffle test
```

在Ganache中获取部署的<b>NoteStorage</b>合约地址，并相应修改`src/Navi/Navi.js`下的<b>CONTRACT</b>的值

在`/`路径下：
<br />在本地运行Web服务
```bash
yarn start
```

# 要求
具备matemask环境，否则需要修改`src/Navi/Navi.js`下对<b>web3.eth.abi.defaultAccount</b>的账户地址进行手动修改赋值，因为源代码中的地址是本地的测试账户地址，否则会出现读取不到数据的结果。
