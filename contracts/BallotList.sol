pragma solidity ^0.4.8;

import "./Strings.sol";
import "./Ownable.sol";

contract BallotList is Ownable {

    enum State {Active, Ended, Aborted}

    struct BallotData {
        address proposalAddr;
        string title;
        string url;
        string hash;
        uint ballotStart;
        uint ballotEnd;
        State state;
        uint weiYes;
        uint weiNo;
    }

    BallotData[] public ballots;

    string public ballotsJson = "{\"ballots\": []}";

    function newBallot(address proposalAddr,
                       string title,
                       string url,
                       string hash,
                       uint ballotEnd) external onlyOwner {
        for (uint i = 0; i < ballots.length; ++i) {
            if (ballots[i].proposalAddr == proposalAddr) {
                throw;
            }
        }
        BallotData memory ballotData = BallotData(proposalAddr, title, url, hash, block.number, ballotEnd, State.Active, 0, 0);
        ballots.push(ballotData);
        updateBallotsJson();
    }

    function abortBallot(uint blockNumber, address proposalAddr) external onlyOwner {

    }

    function endBallot(uint blockNumber, address proposalAddr, uint weiYes, uint weiNo) external onlyOwner {

    }

    function updateBallotsJson() internal {
        ballotsJson = "asdasdfasdf";
    }

    function ballotDataToString(BallotData bd) internal returns (string) {

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
