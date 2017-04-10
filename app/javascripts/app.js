import "../stylesheets/app.css";
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract';
import ballot_artifacts from '../../build/contracts/Ballot.json';

var Ballot = contract(ballot_artifacts);

var accounts;
var account;

window.App = {
    start: function() {
        var self = this;
        Ballot.setProvider(web3.currentProvider);
        web3.eth.getAccounts(function(err, accs) {
            if (err != null) {
                alert("There was an error fetching your accounts.");
                return;
            }
            if (accs.length == 0) {
                alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
                return;
            }
            accounts = accs;
            account = accounts[0];
        });
    },

    setStatus: function(message) {
        var status = document.getElementById("status");
        status.innerHTML = message;
    },

    beginBallot: function() {
        console.log("Begin ballot");
        var self = this;
        var title  = parseInt(document.getElementById("title").value);
        var url = document.getElementById("url").value;
        var hash = parseInt(document.getElementById("hash").value);
        var ballotEnd = parseInt(document.getElementById("ballotEnd").value);
        this.setStatus("Creating new ballot... (please wait)");
        var ballot;
        Ballot.deployed().then(function(instance) {
            ballot = instance;
            console.log(title);
            return ballot.beginBallot(title, url, hash, ballotEnd, {from: account});
        }).then(function() {
            self.setStatus("Ballot created!");
        }).catch(function(e) {
            console.log("Error:", e);
            self.setStatus("Error. " + e);
        });
    }
};

window.addEventListener('load', function() {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
        // Use Mist/MetaMask's provider
        window.web3 = new Web3(web3.currentProvider);
    } else {
        console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }

    App.start();
});
