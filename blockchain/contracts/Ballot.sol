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

    // dynamically sixed array of Proposal structs to talley votes
    Proposal[] public proposals;

    // constructs the ballot to choose candidate
    function Ballot(bytes32[] proposalNames) {
        //assigns sender to variable
        chairperson = msg.sender;
        //assigns weight to instance of Voter
        voters[chairperson].weight = 1;

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

    function giveRightToVote(address voter) {
        require((msg.sender == chairperson) && !voters[voter].voted && (voters[voter].weight == 0));
        voters[voter].weight = 1;
    }

    // give vote to the voter 'to'
    function delegate(address to) {
        // instanciates Voter and assigns current sender to voter hash table
        Voter sender = voters[msg.sender];

        // checking to see if this user has voted
        require(!sender.voted);
        // prevents assigning vote to oneself
        require(to != msg.sender);

        while (voters[to].delegate != address(0)) {
            to = voters[to].delegate;
            // must prevent self delegation in the loop
            require(to != msg.sender);
        }

        sender.voted = true;
        sender.delegate = to;
        // instanciates Voter as delegate, assigns
        Voter delegate = voters[to];
        if (delegate.voted) {
            // if the delegate voted add number to the aggregate
            proposals[delegate.vote].voteCount += sender.weight;
        } else {
            // if not voted yet add to aggregate
            delegate.weight += sender.weight;
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
