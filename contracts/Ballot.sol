pragma solidity ^0.4.4;

contract Ownable {
    address public owner;

    function Ownable() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) {
            throw;
        }
        _;
    }

    function transferOwnership(address newOwner) onlyOwner {
        if (newOwner != address(0)) {
            owner = newOwner;
        } else {
            throw;
        }
    }

}

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

contract BallotList is Ownable {

    uint public maxBallots;
    string[] public ballots;

    function BallotList(uint _maxBallots) {
        if (_maxBallots <= 0) {
            throw;
        }
        maxBallots = _maxBallots;
    }

    function addBallot(string title, string url, string hash, uint ballotEnd) external onlyOwner {
        ballots.push(concatStrings(title, url, hash, ballotEnd));
    }

    function uintToBytes(uint v) constant internal returns (bytes32 ret) {
        if (v == 0) {
            ret = '0';
        }
        else {
            while (v > 0) {
                ret = bytes32(uint(ret) / (2 ** 8));
                ret |= bytes32(((v % 10) + 48) * 2 ** (8 * 31));
                v /= 10;
            }
        }
        return ret;
    }

    // ['title','url','hash',234]
    function concatStrings(string title, string url, string hash, uint ballotEnd) internal returns(string) {
        bytes memory titleArr = bytes(title);
        bytes memory urlArr = bytes(title);
        bytes memory hashArr = bytes(title);
        bytes32 ballotEndArr = uintToBytes(ballotEnd);
        string memory data = new string(11 + titleArr.length + urlArr.length + hashArr.length + ballotEndArr.length);
        bytes memory dataArr = bytes(data);
        uint k = 0;
        uint i = 0;
        dataArr[k++] = '[';
        dataArr[k++] = '\'';
        for (i = 0; i < titleArr.length; i++) dataArr[k++] = titleArr[i];
        dataArr[k++] = '\'';
        dataArr[k++] = ',';
        dataArr[k++] = '\'';
        for (i = 0; i < urlArr.length; i++) dataArr[k++] = urlArr[i];
        dataArr[k++] = '\'';
        dataArr[k++] = ',';
        dataArr[k++] = '\'';
        for (i = 0; i < hashArr.length; i++) dataArr[k++] = hashArr[i];
        dataArr[k++] = '\'';
        dataArr[k++] = ',';
        for (i = 0; i < ballotEndArr.length; i++) dataArr[k++] = ballotEndArr[i];
        dataArr[k++] = ']';
        return string(dataArr);
    }


}

contract Ballot {

    event NewBallot(address proposal, address voteYes, address voteNo);
    event BallotAborted(address proposal);

    uint public requiredDeposit;
    // in bytes
    uint public maxDataSize;
    address public ballotList;

    // TODO allow for more than one ballot created by one account
    // TODO check if not modifiable from the outside?
    mapping(address => address) public ballots;

    // TODO option to register ballot on the list
    function Ballot(uint _requiredDeposit, uint _maxDataSize, uint maxBallots) {
        if (_requiredDeposit <= 0 || _maxDataSize <= 0) {
            throw;
        }

        if (maxBallots > 0) {
            BallotList _ballotList = new BallotList(maxBallots);
            _ballotList.transferOwnership(this); // TODO works?
            ballotList = _ballotList;
        } else {
            ballotList = 0;
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
        Proposal proposal = new Proposal(title,
                                         url,
                                         hash,
                                         ballotEnd,
                                         voteYes,
                                         voteNo);

        ballots[msg.sender] = proposal;

        if (ballotList != 0) {
            BallotList(ballotList).addBallot(title, url, hash, ballotEnd);
        }

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
