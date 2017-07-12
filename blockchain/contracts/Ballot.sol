pragma solidity ^0.4.11;


contract Ballot {

    // complex type that defines properties on a voter
    struct Voter {
        // aggregate of votes
        uint weight;
        // status of voter
        bool voted;
        // key of deligated candidate
        address delegate;
        // index of the vote
        uint vote;

    }

    struct Proposal {
        bytes32 name;
        // number of aggregate votes
        uint voteCount;
    }

    // variable definition to store the voter
    address public chairperson;

    // stores Voter for each possible address by declaring a state variable
    mapping(address => Voter) public voters;

    event voteCasted(address voter, uint proposal, uint dateCasted);

    // dynamically sixed array of Proposal structs to talley votes
    Proposal[] public proposals;

    // constructs the ballot to choose candidate
    function Ballot(bytes32[] proposalNames) {
        //assigns sender to variable
        chairperson = msg.sender;

        //for each of the proposal names inserted into the ballot
        //create a new proposal object and add it to the end of the array
        for (uint i = 0; i < proposalNames.length; i++) {
            // pushes a new struct on to the proposals array
            proposals.push(Proposal({
                name: proposalNames[i],
                voteCount: 0
            }));
        }
    }


    function vote(uint prop) {
        // assigns instance of Voter 'sender' as the msg.sender referenced in the voters array
        Voter sender = voters[msg.sender];
        // this sender can not have voted before
        require(!sender.voted);
        sender.voted = true;
        sender.vote =  prop;

        // increases the number of votes by voters weight
        proposals[prop].voteCount += sender.weight;
        voteCasted(msg.sender, prop, now);
    }

    function getTotalCurrentVotes() constant returns(uint256[] totalCurrentVotes, bytes32[] ballotNameTotals){

      uint256[] memory eachBallotTotal = new uint256[](proposals.length);
      bytes32[] memory eachBallotName = new bytes32[](proposals.length);

      for (uint i = 0; i < proposals.length; i++) {
        eachBallotTotal[i] = proposals[i].voteCount;
        eachBallotName[i] = proposals[i].name;
      }

      return (eachBallotTotal, eachBallotName);
    }

    // computes winning total
    function winningProposal() constant returns(uint winningProp) {
        uint winningVoteCount = 0;
        for (uint i = 0; i < proposals.length; i++) {
            // increases vote count and sets winning proposal with index of loop to be passed to the return winner fx
            if(proposals[i].voteCount > winningVoteCount) {
                winningVoteCount = proposals[i].voteCount;
                winningProp = i;
            }
        }
    }

    // calls winningProposal fx to get the index of the winner from the proposals array and returns the name
    function returnWinner() constant returns(bytes32 winnerName) {
        winnerName = proposals[winningProposal()].name;
    }


}
