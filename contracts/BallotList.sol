pragma solidity ^0.4.8;

import "./Strings.sol";
import "./Ownable.sol";

contract BallotList is Ownable {

    uint public maxBallots;
    string[] public ballots;

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
