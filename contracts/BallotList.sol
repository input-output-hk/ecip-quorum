pragma solidity ^0.4.8;

// import "./Strings.sol";
import "./Ownable.sol";

contract BallotList is Ownable {

    struct BallotData {
        address proposalAddr;
        string title;
        string url;
        string hash;
        uint ballotStart;
        uint ballotEnd;
        string status;
        uint weiYes;
        uint weiNo;
    }

    BallotData[] public ballots;

    // TODO support "s in BallotData
    string public ballotsJson = "{\"ballots\":[]}";

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
        BallotData memory ballotData = BallotData(proposalAddr, title, url, hash, block.number, ballotEnd, "active", 0, 0);
        ballots.push(ballotData);
        updateBallotsJson();
    }

    function abortBallot(uint blockNumber, address proposalAddr) external onlyOwner {

    }

    function endBallot(uint blockNumber, address proposalAddr, uint weiYes, uint weiNo) external onlyOwner {

    }

    function updateBallotsJson() internal {
        if (ballots.length == 0) {
            ballotsJson = "{\"ballots\":[]}";
        } else {
            string memory aggr = ballotDataToString(ballots[0]);
            for (uint i = 1; i < ballots.length; ++i) {
                aggr = strConcat(aggr, ",", ballotDataToString(ballots[i]));
            }
            ballotsJson = strConcat("{\"ballots\":[", aggr, "]}");
        }
    }

    // This is the ugliest piece of code I have ever written in this millenium.
    // {\"proposalAddr\":\"X\",\"title\":\"X\",\"url\":\"X\",\"hash\":\"X\",\"ballotStart\":0,\"ballotEnd\":0,\"status\":\"X\",\"weiYes\":0,\"weiNo\":0}
    function ballotDataToString(BallotData bd) constant internal returns (string) {
        var a = strConcat("{\"proposalAddr\":\"0x",
                          addressToString(bd.proposalAddr),
                          "\",\"title\":\"",
                          bd.title,
                          "\",\"url\":\"");
        var b = strConcat(bd.url,
                          "\",\"hash\":\"",
                          bd.hash,
                          "\",\"ballotStart\":",
                          uintToString(bd.ballotStart));
        var c = strConcat(",\"ballotEnd\":",
                          uintToString(bd.ballotEnd),
                          ",\"status\":\"",
                          bd.status,
                          "\",\"weiYes\":");
        var d = strConcat(uintToString(bd.weiYes),
                          ",\"weiNo\":",
                          uintToString(bd.weiNo),
                          "}");
        return strConcat(a, b, c, d);
    }

    function strConcat(string _a, string _b, string _c, string _d, string _e) constant internal returns (string) {
        bytes memory _ba = bytes(_a);
        bytes memory _bb = bytes(_b);
        bytes memory _bc = bytes(_c);
        bytes memory _bd = bytes(_d);
        bytes memory _be = bytes(_e);
        string memory abcde = new string(_ba.length + _bb.length + _bc.length + _bd.length + _be.length);
        bytes memory babcde = bytes(abcde);
        uint k = 0;
        for (uint i = 0; i < _ba.length; i++) babcde[k++] = _ba[i];
        for (i = 0; i < _bb.length; i++) babcde[k++] = _bb[i];
        for (i = 0; i < _bc.length; i++) babcde[k++] = _bc[i];
        for (i = 0; i < _bd.length; i++) babcde[k++] = _bd[i];
        for (i = 0; i < _be.length; i++) babcde[k++] = _be[i];
        return string(babcde);
    }

    function strConcat(string _a, string _b, string _c, string _d) constant internal returns (string) {
        return strConcat(_a, _b, _c, _d, "");
    }

    function strConcat(string _a, string _b, string _c) constant internal returns (string) {
        return strConcat(_a, _b, _c, "", "");
    }

    function addressToString(address x) constant internal returns (string) {
        bytes memory s = new bytes(40);
        for (uint i = 0; i < 20; i++) {
            byte b = byte(uint8(uint(x) / (2**(8*(19 - i)))));
            byte hi = byte(uint8(b) / 16);
            byte lo = byte(uint8(b) - 16 * uint8(hi));
            s[2*i] = char(hi);
            s[2*i+1] = char(lo);
        }
        return string(s);
    }

    function char(byte b) constant internal returns (byte c) {
        if (b < 10) return byte(uint8(b) + 0x30);
        else return byte(uint8(b) + 0x57);
    }

    function bytes32ToString(bytes32 x) constant internal returns (string) {
        bytes memory bytesString = new bytes(32);
        uint charCount = 0;
        for (uint j = 0; j < 32; j++) {
            byte char = byte(bytes32(uint(x) * 2 ** (8 * j)));
            if (char != 0) {
                bytesString[charCount] = char;
                charCount++;
            }
        }
        bytes memory bytesStringTrimmed = new bytes(charCount);
        for (j = 0; j < charCount; j++) {
            bytesStringTrimmed[j] = bytesString[j];
        }
        return string(bytesStringTrimmed);
    }

    function uintToString(uint v) constant internal returns (string) {
        bytes32 ret;
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
        return bytes32ToString(ret);
    }

}
