var Ownable = artifacts.require("./Ownable.sol");
var Ballot = artifacts.require("./Ballot.sol");

module.exports = function(deployer) {
    deployer.deploy([Ownable,
                     [Ballot, web3.toWei(1, "ether"), 4096]]);
    deployer.link(Ballot, [Ownable]);
};
