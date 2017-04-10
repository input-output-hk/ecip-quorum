// var ConvertLib = artifacts.require("./ConvertLib.sol");
// var MetaCoin = artifacts.require("./MetaCoin.sol");
var Ballot = artifacts.require("./Ballot.sol");

module.exports = function(deployer) {
    // deployer.deploy(ConvertLib);
    // deployer.link(ConvertLib, MetaCoin);
    // deployer.deploy(MetaCoin);
    deployer.deploy(Ballot);
};
