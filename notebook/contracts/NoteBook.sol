pragma solidity >= 0.4.21 < 0.7.0;

contract NoteContract
{
    mapping(address => string[]) public notes;

    constructor() public {}

    event NewNote(address, string note);

    function addNote(string memory note) public{
        notes[msg.sender].push(note);
        emit NewNote(msg.sender, note);
    }

    function getNotesLen(address own) public view returns(uint)
    {
        return notes[own].length;
    }

    event ModifyNote(address, uint index);

    function modifyNote(address own, uint index, string memory note) public
    {
        require(own == msg.sender, "Illegal modify request, wrong owner");
        notes[own][index] = note;
        emit ModifyNote(own, index);
    }
}