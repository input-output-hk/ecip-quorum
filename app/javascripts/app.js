import "../stylesheets/app.css";
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract';
import ballot_artifacts from '../../build/contracts/Ballot.json';

var Ballot = contract(ballot_artifacts);

var account;

window.App = {

    setAccounts: function() {
        web3.eth.getAccounts(function(err, accounts) {
            if (err) {
                alert("There was an error fetching your accounts.");
                return;
            }
            if (!accounts.length) {
                alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
                return;
            }
            account = accounts[0];
        });
    },

    start: function() {
        console.log(">>> Starting");
        var self = this;
        Ballot.setProvider(web3.currentProvider);
        this.setAccounts();
        // Ballot.at('0x3c3E95825A00AA544f38AB1cF1629d93bbc30667').then(function(instance) {
        //     console.log(">>> X: ", instance);
        //     instance.allEvents({fromBlock: 0}).watch(function(error, result){
        //         if (!error) {
        //             console.log(">>> RESULT:", JSON.stringify(result));
        //         } else {
        //             console.log(">>> ERROR:", JSON.stringify(error));
        //         }
        //     });
        // }).catch(function(e) {
        //     console.log(">>> Error:", e);
        // });
    },

    setStatus: function(message) {
        //        var status = document.getElementById("status");
        //      status.innerHTML = message;
    },

    beginBallot: function() {
        console.log("Begin ballot");
        var self = this;
        var ballotId = parseInt(document.getElementById("ballotId").value);
        var title = document.getElementById("title").value;
        var url = document.getElementById("url").value;
        var hash = document.getElementById("hash").value;
        var ballotEnd = parseInt(document.getElementById("ballotEnd").value);
        this.setStatus("Creating new ballot... (please wait)");
        var ballot;
        console.log("!!!");
        Ballot.deployed().then(function(instance) {
            ballot = instance;
            console.log(">>>>", ballotId, title, url, hash, ballotEnd, web3.toWei(1, "ether"));
            console.log(">>> DEPLOYED? ", Ballot.isDeployed());
            console.log(">>> DEFAULTS ", Ballot.defaults());
            console.log(">>> NETWORK ", Ballot.detectNetwork());
            console.log(">>> ACCOUNT ", account);
//            console.log(">>>>>>>>>>>>", instance);
            return ballot.beginBallot(new Date().getTime(),
                                      "Precompiled contracts for addition and scalar multiplication on the elliptic curve alt_bn128",
                                      "https://github.com/ethereum/EIPs/pull/213", "c935937a8fc17e9f870cd811e228a021",
                                      420000,
                                      {value: web3.toWei(1, "ether"), from: account});
        }).then(function() {
            self.setStatus("Ballot created!");
        }).catch(function(e) {
            console.log("Error:", e);
            self.setStatus("Error. " + e);
            e.then(function(x) {console.log("EEE", x);});
        });
    }
};

window.addEventListener('load', function() {
    //console.log(">>>>");
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    // if (typeof web3 !== 'undefined') {
    //     console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask");
    //     // Use Mist/MetaMask's provider
    //     window.web3 = new Web3(web3.currentProvider);
    // } else {
    //     console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    //     // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    //     window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    // }
    window.web3 = new Web3(web3.currentProvider);
    //window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    console.log(">>> PROVIDER:", web3.currentProvider);
    App.start();
});

// $(function() {

//     var mbtn = $('#moreBtn');
//     var lbtn = $('#lessBtn');
//     var content = $('.hidden');

//     mbtn.click(function() {
//         lbtn.show();
//         mbtn.hide();
//         content.toggle();
//     });

//     lbtn.click(function() {
//         mbtn.show();
//         lbtn.hide();
//         content.toggle();
//     });

// });
