var Ballot = artifacts.require("Ballot");
var Proposal = artifacts.require("Proposal");
var Vote = artifacts.require("Vote");

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

var proposalData = {
    title: "Precompiled contracts for addition and scalar multiplication on the elliptic curve alt_bn128",
    url: "https://github.com/ethereum/EIPs/pull/213",
    hash: "c935937a8fc17e9f870cd811e228a021",
    ballotEnd: 420000
};

contract('Ballot', function(accounts) {
    var voterYes = accounts[1];
    var voterNo = accounts[2];
    var ballotId = new Date().getTime();
    it("should create a voting contract and register votes", function() {
        var ballot;
        var newBallotEvt;
        var thisBallotId;
        return Ballot.deployed()                                                                    // deploy contract
            .then(function(instance) {
                ballot = instance;
                return ballot.requiredDeposit.call();                                               // check required deposit
            })
            .then(function(requiredDeposit) {
                thisBallotId = ballotId++;
                return ballot.beginBallot(thisBallotId,
                                          proposalData.title,                                       // create new ballot
                                          proposalData.url,
                                          proposalData.hash,
                                          proposalData.ballotEnd,
                                          { value: requiredDeposit });
            })
            .then(function(result) {
                displayGasCost("Begin ballot", result.receipt.gasUsed);
                assert.equal(result.logs.length, 1, "Unexpected number of logs");
                assert.equal(result.logs[0].event, "NewBallot", "Unexpected type of an event");
                newBallotEvt = result.logs[0].args;
                return Proposal.at(newBallotEvt.proposal).hash.call();                              // check if proposal was properly saved
            })
            .then(function(hash) { // TODO check other fields as well
                assert.equal(hash, proposalData.hash, "Invalid hash of a proposal data");
            })
            .then(function() {
                return Vote.at(newBallotEvt.voteYes).sendTransaction({from: voterYes, value: 0});   // vote 'Yes'
            })
            .then(function(result) {
                displayGasCost("Vote 'yes' (send transaction)", result.receipt.gasUsed);
                assert.equal(result.logs.length, 1, "Unexpected number of logs");
                var evt = result.logs[0];
                assert.equal(evt.event, "LogVote", "Unexpected type of an event");
                assert.equal(evt.args.addr, voterYes, "Unexpected addres of a voter");
            })
            .then(function() {
                return Vote.at(newBallotEvt.voteNo).vote({from: voterNo});                         // vote 'No'
            })
            .then(function(result) {
                displayGasCost("Vote 'no' (call method)", result.receipt.gasUsed);
                assert.equal(result.logs.length, 1, "Unexpected number of logs");
                var evt = result.logs[0];
                assert.equal(evt.event, "LogVote", "Unexpected type of an event");
                assert.equal(evt.args.addr, voterNo, "Unexpected addres of a voter");
            })
            .then(function() {
                return ballot.endBallot(thisBallotId);                                             // abort ballot
            })
            .then(function(result) {
                displayGasCost("Abort ballot'", result.receipt.gasUsed);
                assert.equal(result.logs.length, 1, "Unexpected number of logs");
                var evt = result.logs[0];
                assert.equal(evt.event, "BallotAborted", "Unexpected type of an event");
                assert.equal(evt.args.proposal, newBallotEvt.proposal, "Unexpected addres of a proposal scheduled to delete");
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
                return ballot.beginBallot(ballotId++,
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
                return ballot.beginBallot(ballotId++,
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
    it("should throw an exception if data sent to the contract exceeds maximum allowed size", function() {
        var ballot;
        var requiredDeposit;
        return Ballot.deployed()
            .then(function(instance) {
                ballot = instance;
                return ballot.requiredDeposit.call();
            })
            .then(function(_requiredDeposit) {
                requiredDeposit = _requiredDeposit;
                return ballot.maxDataSize.call();
            })
            .then(function(maxDataSize) {
                var longTitle = new Array(maxDataSize - proposalData.url.length - proposalData.hash.length + 2).join('x');
                return ballot.beginBallot(ballotId++,
                                          longTitle,
                                          proposalData.url,
                                          proposalData.hash,
                                          proposalData.ballotEnd,
                                          { value: requiredDeposit });
            })
            .then(function(result) {
                assert(false, "Data sent to the contract exceeds maximum allowed size but an exception wasn't thrown");
            })
            .catch(function(err) {
                assertInvalidJump(err);
            });
    });
});
