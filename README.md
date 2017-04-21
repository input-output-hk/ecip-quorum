# ECIP-Quorum #

Simple voting application. Includes contracts, migrations, tests, user interface and webpack build pipeline.

## Installation ##

### Prerequisites ###

You'll need [Truffle](http://truffleframework.com/), [TestRPC](https://github.com/ethereumjs/testrpc) and [Mist](https://github.com/ethereum/mist) installed in order to run this project.

#### Install Truffle ####

``` bash
sudo npm install -g truffle
```

#### Install Testrpc ####

``` bash
sudo npm install -g ethereumjs-testrpc
```

### Build ###

``` bash
git clone https://github.com/input-output-hk/ecip-quorum
cd ecip-quorum
npm install
truffle compile
```

### Test ###

We'll use TestRPC node to run tests. *Consider running it as a daemon (`&`), in a separate console or in a [Docker container](https://github.com/ethereumjs/testrpc#docker).*

``` bash
testrpc
truffle migrate # optional, just to check if everything goes well
truffle test
```

### Frontend ###

This section describes how to set up a private test net on a `geth` node, deploy the contracts on it and start a Dapp which is able to connect to these contracts.

#### Deployment on private testnet ####

We'll use a [CustomGenesis.json](https://github.com/input-output-hk/ecip-quorum/blob/master/CustomGenesis.json) to create a testnet.

**WARNING:** newer versions of `geth` may require a slightly different syntax.

Initialize a testnet:

``` bash
geth \
--rpc --rpcapi eth,web3,personal,admin \
--datadir ./geth-data \
--rpcport 8545 \
--port 30309 \
--nodiscover \
--identity "PrivNet" \
--networkid 1999 \
init CustomGenesis.json
```

Run the console:

``` bash
geth \
--datadir ./geth-data \
--identity "PrivNet" \
--networkid 1999 \
--nodiscover \
--port 30309 \
--rpc \
--rpcaddr 0.0.0.0 \
--rpcapi 'db,net,eth,web3,personal,admin' \
--rpcport 8545 \
--verbosity 2 \
console
```

Create a new account in JS console and exit:

``` javascript
> personal.newAccount('123')
"0x92439f5066e0e5313bc265824de63ca1a4089645"
> exit
```

Start the console with an `--unlock` parameter added:

``` bash
./geth-etc \
--datadir ./geth-data \
--identity "PrivNet" \
--networkid 1999 \
--nodiscover \
--port 30309 \
--rpc \
--rpcaddr 0.0.0.0 \
--rpcapi 'db,net,eth,web3,personal,admin' \
--rpcport 8545 \
--rpccorsdomain "*" \
--unlock YOUR_ACCOUNT_ADDRESS \
--verbosity 2 \
console
```

Start mining:

``` javascript
miner.start()
```

Or, if your computer is melting:

``` javascript
miner.start(1)
```

#### Running frontend ####

Run dev server:

``` bash
npm run dev
```

Run Mist which connects to the local testnet:

``` bash
/Applications/Mist.app/Contents/MacOS/Mist --rpc "http://localhost:8545" --datadir ./geth-data/
```

In Mist, navigate to http://localhost:8080.

CONNECT your account to the dapp (_hit CONNECT button in the top right corner of the window_).

Now, you are ready to create your first ballot.
