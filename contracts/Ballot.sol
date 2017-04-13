pragma solidity ^0.4.8;

import "./Ownable.sol";

contract Vote is Ownable {
    event LogVote(address indexed addr);

    string public name;
    uint public ballotEnd;

    function Vote(string _name, uint _ballotEnd) {
        name = _name;
        ballotEnd = _ballotEnd;
    }

    function() payable {
        if (msg.value > 0 ||
            block.number > ballotEnd) {
            throw;
        }
        LogVote(msg.sender);
    }

    function kill() onlyOwner {
        selfdestruct(owner);
    }

}

contract Proposal is Ownable {

    string public title;
    string public url;
    string public hash;
    uint public ballotEnd;

    address public voteYes;
    address public voteNo;

    uint constant startingBlock = block.number;

    function Proposal(string _title,
                      string _url,
                      string _hash,
                      uint _ballotEnd,
                      address _voteYes,
                      address _voteNo) public {
        title = _title;
        url = _url;
        hash = _hash;
        ballotEnd = _ballotEnd;
        voteYes = _voteYes;
        voteNo = _voteNo;
    }

    function kill() onlyOwner {
        selfdestruct(owner);
    }

}

contract Ballot {

    event NewBallot(address proposal, address voteYes, address voteNo);
    event BallotAborted(address proposal);

    uint public requiredDeposit;
    // in bytes
    uint public maxDataSize;

    // TODO allow for more than one ballot created by one account
    // TODO check if not modifiable from the outside?
    mapping(address => address) public ballots;

    // TODO option to register ballot on the list
    function Ballot(uint _requiredDeposit, uint _maxDataSize) {

        if (_requiredDeposit <= 0 || _maxDataSize <= 0) {
            throw;
        }

        requiredDeposit = _requiredDeposit;
        maxDataSize = _maxDataSize;
    }

    function beginBallot(string title,
                         string url,
                         string hash,
                         uint ballotEnd) external payable {

        if (msg.value != requiredDeposit ||
            ballotEnd <= block.number ||
            ballots[msg.sender] != 0 ||
            (bytes(title).length + bytes(url).length + bytes(hash).length) > maxDataSize) {
            throw;
        }

        Vote voteYes = new Vote("yes", ballotEnd);
        Vote voteNo = new Vote("no", ballotEnd);
        Proposal proposal = new Proposal(title, url, hash, ballotEnd, voteYes, voteNo);
        ballots[msg.sender] = proposal;

        NewBallot(proposal, voteYes, voteNo);

    }

    function endBallot() external {

        address proposalAddr = ballots[msg.sender];

        if (proposalAddr == 0 ||
            !msg.sender.send(requiredDeposit)) {
            throw;
        }

        Proposal proposal = Proposal(proposalAddr);

        if (block.number <= proposal.ballotEnd()) {
            BallotAborted(proposalAddr);
        }

        Vote(proposal.voteYes()).kill();
        Vote(proposal.voteNo()).kill();
        proposal.kill();

    }

}
