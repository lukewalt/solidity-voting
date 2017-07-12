import React, { Component } from 'react';
import './App.css';
import Web3 from 'web3';
import _ from 'lodash'


const ETHEREUM_PROVIDER = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
const BALLOT_ADDRESS = '0xea16ad5ee3a505b0da26606c3b335a5c1dcbdf2d';
const BALLOT_ABI = [{"constant":false,"inputs":[{"name":"prop","type":"uint256"}],"name":"vote","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"proposals","outputs":[{"name":"name","type":"bytes32"},{"name":"voteCount","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"chairperson","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"winningProposal","outputs":[{"name":"winningProp","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"voters","outputs":[{"name":"weight","type":"uint256"},{"name":"voted","type":"bool"},{"name":"delegate","type":"address"},{"name":"vote","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"returnWinner","outputs":[{"name":"winnerName","type":"bytes32"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"getTotalCurrentVotes","outputs":[{"name":"totalCurrentVotes","type":"uint256[]"},{"name":"ballotNameTotals","type":"bytes32[]"}],"payable":false,"type":"function"},{"inputs":[{"name":"proposalNames","type":"bytes32[]"}],"payable":false,"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"voter","type":"address"},{"indexed":false,"name":"proposal","type":"uint256"},{"indexed":false,"name":"dateCasted","type":"uint256"}],"name":"voteCasted","type":"event"}]
const BALLOT = ETHEREUM_PROVIDER.eth.contract(BALLOT_ABI).at(BALLOT_ADDRESS);
const coinbase = ETHEREUM_PROVIDER.eth.coinbase;

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      candidateNames: [],
      candidateAggregateVotes: []
    }
  }

  componentDidMount() {

    let initBallotAggregates = BALLOT.getTotalCurrentVotes()[0]
    let initBallotNames = BALLOT.getTotalCurrentVotes()[1];

    this.setState({
      candidateNames: initBallotNames,
      candidateAggregateVotes: initBallotAggregates
    })


    this._broadcastVote()
  }

  // calls event from contract
  _broadcastVote() {
    BALLOT.voteCasted({ fromBlock: ETHEREUM_PROVIDER.eth.currentBlock, toBlock: 'latest' }).watch((err, res) => {
      console.log(res.args);
    })
  }

  _vote(proposalIndex) {
    console.log('voted', proposalIndex + 1);

    BALLOT.vote(proposalIndex, {from: coinbase, gas: 210000}, (err, res) => {
      console.log(res);
      console.log(err);
    })
  }


  render() {
    // creates empty array to push JSX from state
    let candidates = [];
    let candidateVotes = [];
    // pushes values of candidate
    _.each(this.state.candidateNames, (value, index) => {
      candidates.push(
        <div key={index}>
          <h1>{ETHEREUM_PROVIDER.toAscii(value)}</h1>
          <button onClick={()=>{this._vote(index)}}>Vote</button>
        </div>
      )
    })
    _.each(this.state.candidateAggregateVotes, (value, index) => {
      console.log(value.toString(10));
      candidateVotes.push(
        <div key={index}>
          <h5>{value.toString(10)}</h5>
        </div>
      )
    })

    return (
      <div className="App">
        <h1 className="title">Candidates</h1>
        <div className="candidates">
          {candidates}
        </div>
        <div className="candidates">
          {candidateVotes}
        </div>
      </div>
    );
  }
}

export default App;
