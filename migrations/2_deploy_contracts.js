var Ownable = artifacts.require("./Ownable.sol");
var Strings = artifacts.require("./Strings.sol");
var Ballot = artifacts.require("./Ballot.sol");
var BallotList = artifacts.require("./BallotList.sol");

// TODO set separate deployment for production and testrpc
module.exports = function(deployer) {
    deployer.deploy([Ownable,
                     Strings,
                     [Ballot, web3.toWei(1, "ether"), 4096],
                     BallotList]);
    deployer.link(Ballot, [Ownable]);
    deployer.link(BallotList, [Ownable, Strings]);
};
