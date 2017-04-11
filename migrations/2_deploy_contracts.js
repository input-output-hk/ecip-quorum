var Ballot = artifacts.require("./Ballot.sol");

// TODO set separate deployment for production and testrpc
module.exports = function(deployer) {
    deployer.deploy(Ballot, web3.toWei(1, "ether"), 100);
};
