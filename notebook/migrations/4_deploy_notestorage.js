const NoteStorage = artifacts.require("NoteStorage");

module.exports = function(deployer)
{
    deployer.deploy(NoteStorage);
};