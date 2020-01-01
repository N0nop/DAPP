const Note = artifacts.require("NoteContract");

module.exports = function(deployer)
{
    deployer.deploy(Note);
};