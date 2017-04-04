pragma solidity ^0.4.4;

contract Ballot {

    uint256 public constant requiredDeposit = 1 ether;

    function beginBallot(
        string title,
        string author,
        string description,
        string url,
        string hash,
        uint ballotEnd) external payable {

        if (msg.value != requiredDeposit || ballotEnd <= block.number) {
            throw;
        }

    }

}
