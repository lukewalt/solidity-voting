import React, { Component } from 'react';
import './App.css';
import Web3 from 'web3';
import _ from 'lodash'


const ETHEREUM_PROVIDER = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
const BALLOT_ADDRESS = '0xbce093b79456e2241a9ba97395d05cebc2027ed3';
const BALLOT_ABI = [{"constant":false,"inputs":[{"name":"prop","type":"uint256"}],"name":"vote","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"proposals","outputs":[{"name":"name","type":"bytes32"},{"name":"voteCount","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"chairperson","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"winningProposal","outputs":[{"name":"winningProp","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"voters","outputs":[{"name":"weight","type":"uint256"},{"name":"voted","type":"bool"},{"name":"delegate","type":"address"},{"name":"vote","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"returnWinner","outputs":[{"name":"winnerName","type":"bytes32"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"getTotalCurrentVotes","outputs":[{"name":"totalCurrentVotes","type":"uint256[]"},{"name":"ballotNameTotals","type":"bytes32[]"}],"payable":false,"type":"function"},{"inputs":[{"name":"proposalNames","type":"bytes32[]"}],"payable":false,"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"voter","type":"address"},{"indexed":false,"name":"proposal","type":"uint256"},{"indexed":false,"name":"dateCasted","type":"uint256"}],"name":"voteCasted","type":"event"}]
const BALLOT = ETHEREUM_PROVIDER.eth.contract(BALLOT_ABI).at(BALLOT_ADDRESS);
const coinbase = ETHEREUM_PROVIDER.eth.coinbase;

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isButtonDisabled: false,
      candidateNames: [],
      candidateAggregateVotes: [],
      winner: false
    }
  }

  componentDidMount() {

    let initBallotAggregates = BALLOT.getTotalCurrentVotes()[0]
    let convertedAggregates = [];
    let ballotNames = BALLOT.getTotalCurrentVotes()[1];

    initBallotAggregates.forEach((BigNumber, index) => {
      convertedAggregates.push(parseInt(BigNumber.toString(10)))
    })

    this.setState({
      candidateNames: ballotNames,
      candidateAggregateVotes: convertedAggregates
    })

    this._broadcastVote()


  }


  // calls event from contract
  _broadcastVote() {
    // call watch on event from contract
    BALLOT.voteCasted({ fromBlock: ETHEREUM_PROVIDER.eth.currentBlock, toBlock: 'latest' }).watch((err, res) => {
      let voteIndex = res.args.proposal.toString(10);
      let updatedAggregate = this.state.candidateAggregateVotes

      // calculates total votes casted
      let sum = updatedAggregate.reduce((sum, value) => {
        return sum + value
      }, 0)

      if (sum < 1){
        updatedAggregate.splice(voteIndex, 1, this.state.candidateAggregateVotes[voteIndex] + 1);
        this.setState({
          candidateAggregateVotes: updatedAggregate
        });
      } else {
        this.setState({
          isButtonDisabled: true,
          winner: ETHEREUM_PROVIDER.toAscii(this.state.candidateNames[voteIndex])
        })
      }

    })
  }


  _vote(proposalIndex) {
    BALLOT.vote(proposalIndex, {from: coinbase, gas: 2100000}, (err, res) => {
      console.log(err);
      // if user clicks vote after vote is recorded it will alert else it will allow vote and remove buttons
      if (err) {
        alert("Already Voted")
      } else {
        this.setState({
          isButtonDisabled: true
        });
      }

    })

  }

  _declareWinner(){
    // adds up total votes in the current state of the contract
    let total = this.state.candidateAggregateVotes.reduce((sum, value) => {
      return sum + value
    }, 0)

    // if all candidates have 0 votes, no winner can be declared
    if (total < 1) {
      alert("No Votes Cated Yet")
    } else {
      let winner = ETHEREUM_PROVIDER.toAscii(BALLOT.returnWinner());
      this.setState({
        winner: winner
      })
    }

  }


  render() {

    let disabled = this.state.isButtonDisabled ? 'disabled' : '';
    // creates empty array to push JSX from state
    let candidates = [];
    let candidateVotes = [];
    // pushes 'value', value, 'index', indexs of candidate
    _.each(this.state.candidateNames, (value, index) => {
      candidates.push(
        <div key={index}>
          <h1>{ETHEREUM_PROVIDER.toAscii(value)}</h1>
          <h2>{this.state.candidateAggregateVotes[index]}</h2>
          <button onClick={()=>{this._vote(index)}} disabled={this.state.isButtonDisabled} >Vote</button>
        </div>
      )
    })

    let banner = this.state.winner ? "Winner " + this.state.winner : "Candidates"


    return (
      <div className="App">
        <h1 className="title">{banner}</h1>
        <div className="candidates">
          {candidates}
        </div>
        <div className="candidates">
          {candidateVotes}
        </div>
        <div>
          <button className="winnerBtn" onClick={()=>{this._declareWinner()}} disabled={this.state.winner}>Declare Winner</button>
        </div>
      </div>
    );
  }
}

export default App;
