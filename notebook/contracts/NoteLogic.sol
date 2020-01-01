pragma solidity >= 0.4.22 < 0.6.0;

import "./NoteStorage.sol";

contract NoteLogic
{
    NoteStorage noteStorage;

    // Access the storage layer
    constructor(address noteStorageAddress) public
    {
        noteStorage = NoteStorage(noteStorageAddress);
    }

    // Only user itself can make operations
    modifier owner(address _address)
    {
        require(msg.sender == _address, "Access deny");
        _;
    }

    // Write a note
    function Write(address _address, string memory note) public owner(_address)
    {
        uint256 length = noteStorage.GetLength(_address);
        noteStorage.SetNote(_address, length, note);
    }

    // Read a note
    function Read(address _address, uint256 index) public view returns (string memory)
    {
        uint256 length = noteStorage.GetLength(_address);
        require(index < length, "Out of range");

        return noteStorage.GetNote(_address, index);
    }

    // Edit a note
    function Modify(address _address, uint256 index, string memory note) public owner(_address)
    {
        uint256 length = noteStorage.GetLength(_address);
        require(index < length, "Out of range");

        noteStorage.SetNote(_address, index, note);
    }

    // Get the number of notes in total
    function Length(address _address) public view returns (uint256)
    {
        return noteStorage.GetLength(_address);
    }

    /*
    // Get the view times for a specific note
    function Views(address _address, uint256 index) public view returns (uint256)
    {
        return noteStorage.GetView(_address, index);
    }
    */
}   