var ConvertLib = artifacts.require("./ConvertLib.sol");
var Ballot = artifacts.require("./Ballot.sol");

module.exports = function(deployer) {
  deployer.deploy(ConvertLib);
  deployer.link(ConvertLib, Ballot);
  deployer.deploy(Ballot, ['Gary', 'Jimmy', 'Tony']);
};
