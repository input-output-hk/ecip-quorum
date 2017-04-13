const assert = require('assert');

var BallotList = artifacts.require("BallotList");
var Proposal = artifacts.require("Proposal");
var Vote = artifacts.require("Vote");
var BallotList = artifacts.require("BallotList");

function assertInvalidJump(err) {
    if (/invalid JUMP/.exec(err.message)) {
        assert(true);
    } else {
        throw err;
    }
}

function displayGasCost(name, gas, gasCostInGwei = 20, etcPriceInUSD = 2.63) {
    var gwei = gas * gasCostInGwei;
    var usd = gwei * etcPriceInUSD * 0.000000001;
    console.log("    ξ", name, "| Gas:", gas, "| Gwei:", gwei, "| USD:", usd, "| (1 ETC =", etcPriceInUSD, "USD)");
}

var proposalData = [
    {
        proposalAddr: "0xfa6a886905ad44d39b0b7ea5512b65d46f9e6e57",
        title: "Precompiled contracts for addition and scalar multiplication on the elliptic curve alt_bn128",
        url: "https://github.com/ethereum/EIPs/pull/213",
        hash: "c935937a8fc17e9f870cd811e228a021",
        ballotEnd: 420000
    },
    {
        proposalAddr: "0xfa6a886905ad44d39b0b7ea5512b65d46f9e6e58",
        title: "Precompiled contracts for addition and scalar multiplication on the elliptic curve alt_bn128 [1]",
        url: "https://github.com/ethereum/EIPs/pull/214",
        hash: "c935937a8fc17e9f870cd811e228a021",
        ballotEnd: 420001
    },
    {
        proposalAddr: "0xfa6a886905ad44d39b0b7ea5512b65d46f9e6e59",
        title: "Precompiled contracts for addition and scalar multiplication on the elliptic curve alt_bn128 [2]",
        url: "https://github.com/ethereum/EIPs/pull/215",
        hash: "c935937a8fc17e9f870cd811e228a021",
        ballotEnd: 420002
    },
    {
        proposalAddr: "0xfa6a886905ad44d39b0b7ea5512b65d46f9e6e50",
        title: "Precompiled contracts for addition and scalar multiplication on the elliptic curve alt_bn128 [3]",
        url: "https://github.com/ethereum/EIPs/pull/215",
        hash: "c935937a8fc17e9f870cd811e228a021",
        ballotEnd: 420002
    },
    {
        proposalAddr: "0xfa6a886905ad44d39b0b7ea5512b65d46f9e6e51",
        title: "Precompiled contracts for addition and scalar multiplication on the elliptic curve alt_bn128 [4]",
        url: "https://github.com/ethereum/EIPs/pull/215",
        hash: "c935937a8fc17e9f870cd811e228a021",
        ballotEnd: 420002
    }];

// TODO test for already exisiting proposalAddr
contract('BallotList', function(accounts) {
    it("XXXXXXXXXXXXXXX", function() {
        var ballotList;
        return BallotList.deployed()
            .then(function(instance) {
                ballotList = instance;
                return ballotList.ballotsJson.call();
            })
            .then(function(ballotsJson) {
                var actual = JSON.parse(ballotsJson);
                var expected = {ballots: []};
                assert.deepStrictEqual(actual, expected, "List of ballots should be empty");

                return proposalData.map(function(pd) {
                    ballotList
                        .newBallot(pd.proposalAddr, pd.title, pd.url, pd.hash, pd.ballotEnd)
                        .then(function(result) {
                            displayGasCost("New ballot", result.receipt.gasUsed);
                            return ballotList.ballotsJson.call();
                        });
                });
            })
            .then(function() {
                return ballotList.ballotsJson.call();
            })
            .then(function(ballotsJson) {
                // var actual = JSON.parse(ballotsJson);
                // var expected = {ballots: []};
                // console.log(">>>", actual);
                // assert.deepStrictEqual(actual, expected, "List of ballots should be empty");
            });
    });
});
