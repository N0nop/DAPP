const NoteStorage = artifacts.require("./NoteStorage.sol")
const NoteLogic = artifacts.require("./NoteLogic.sol")

module.exports = function(deployer)
{
    deployer.deploy(NoteLogic, NoteStorage.address).then
    (
        () =>
        {
            NoteStorage.deployed().then
            (
                inst =>
                {
                    return inst.AllowAccess(NoteLogic.address);
                }
            );    
        }
    );
};