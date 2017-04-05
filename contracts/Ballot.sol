pragma solidity ^0.4.4;

// TODO owned
contract Vote {
    event LogVote(address indexed addr);

    string public name;

    function Vote(string _name) {
        name = _name;
    }

    function() payable {
        if (msg.value > 0) {
            throw;
        }
        LogVote(msg.sender);
    }

}

// TODO owned
// TODO send message on selfdestruct
// TODO destroy Vote contracts as well
contract Proposal {

    // TODO move to struct
    string public title;
    string public url;
    string public hash;
    uint public ballotEnd;

    address public voteYes;
    address public voteNo;

    uint constant startingBlock = block.number;

    function Proposal(
        string _title,
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

}

contract Ballot {

    event NewBallot(address proposal, address voteYes, address voteNo);

    uint256 public constant requiredDeposit = 1 ether;

    function beginBallot(
        string title,
        string url,
        string hash,
        uint ballotEnd) external payable { //TODO ballotEnd or ballotDuration in blocks?

        if (msg.value != requiredDeposit || ballotEnd <= block.number) {
            throw;
        }

        Vote voteYes = new Vote("yes");
        Vote voteNo = new Vote("no");
        Proposal proposal = new Proposal(
            title,
            url,
            hash,
            ballotEnd,
            voteYes,
            voteNo);

        NewBallot(proposal, voteYes, voteNo);

    }

}
