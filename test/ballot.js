var Ballot = artifacts.require("Ballot");
var Proposal = artifacts.require("Proposal");

function assertInvalidJump(err) {
    if (/invalid JUMP/.exec(err.message)) {
        assert(true);
    } else {
        throw err;
    }
}

var proposalData = {
    title: "ECIP 42",
    url: "https://iohk.io",
    hash: "c935937a8fc17e9f870cd811e228a021",
    ballotEnd: 4200
};

contract('Ballot', function(accounts) {
    var voterYes = accounts[1];
    var voterNo = accounts[2];
    it("should create voting contracts and register votes", function() {
        var ballot;
        var newBallotEvt;
        return Ballot.deployed()
            .then(function(instance) {
                ballot = instance;
                return ballot.requiredDeposit.call();
            })
            .then(function(requiredDeposit) {
                return ballot.beginBallot(
                    proposalData.title,
                    proposalData.url,
                    proposalData.hash,
                    proposalData.ballotEnd,
                    { value: requiredDeposit });
            })
            .then(function(result) {
                assert(result.logs[0].event, "NewBallot", "Unexpected type of an event");
                assert.equal(result.logs.length, 1, "Unexpected number of logs");
                newBallotEvt = result.logs[0].args;
                console.log(">>>", newBallotEvt);
               return Proposal.at(newBallotEvt.proposal).hash.call();
            })
            .then(function(hash) { // TODO check other fields as well
               assert.equal(hash, proposalData.hash, "Invalid hash of a proposal data");
            });

    });
    it("should throw an exception if ether received by the contract doesn't match a required deposit", function() {
        var ballot;
        return Ballot.deployed()
            .then(function(instance) {
                ballot = instance;
                return ballot.requiredDeposit.call();
            })
            .then(function(requiredDeposit) {
                return ballot.beginBallot(
                    proposalData.title,
                    proposalData.url,
                    proposalData.hash,
                    proposalData.ballotEnd,
                    { value: requiredDeposit + 1});
            })
            .then(function(result) {
                assert(false, "Ether received by the contract doesn't match a required deposit but an exception wasn't thrown");
            })
            .catch(function(err) {
                assertInvalidJump(err);
            });
    });
    it("should throw an exception if a block number marking the end of ballot is smaller or equal to a current block number", function() {
        var ballot;
        return Ballot.deployed()
            .then(function(instance) {
                ballot = instance;
                return ballot.requiredDeposit.call();
            })
            .then(function(requiredDeposit) {
                return ballot.beginBallot(
                    proposalData.title,
                    proposalData.url,
                    proposalData.hash,
                    0,
                    { value: requiredDeposit });
            })
            .then(function(result) {
                assert(false, "Block number marking the end of ballot is smaller or equal to a current block number but an exception wasn't thrown");
            })
            .catch(function(err) {
                assertInvalidJump(err);
            });
    });
});
