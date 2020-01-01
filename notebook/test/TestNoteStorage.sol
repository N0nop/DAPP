pragma solidity >= 0.4.21 < 0.7.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/NoteStorage.sol";

contract TestNoteStorage
{
    address testAddress = address(this);
    NoteStorage noteStorage = new NoteStorage();

    function testNoteStorageGetLength() public
    {
        string memory testAddString = "Hello, this is the first note.";
        uint256 length;

        length = noteStorage.GetLength(testAddress);
        Assert.equal(length, 0, "Length initialize error!");

        noteStorage.SetNote(testAddress, 0, testAddString);

        length = noteStorage.GetLength(testAddress);
        Assert.equal(length, 1, "Length update error!");
    }
    /*
    function testNoteStorageViews() public
    {
        string memory testAddString = "Hello, this is the first note.";
        string memory testGetString;
        uint256 views1;
        uint256 views2;

        noteStorage.SetNote(testAddress, 0, testAddString);
        views1 = noteStorage.GetView(testAddress, 0);

        testGetString = noteStorage.GetNote(testAddress, 0);
        views2 = noteStorage.GetView(testAddress, 0);

        Assert.equal(views1, 0, "Views initialize error!");
        Assert.equal(views2, 1, "Views update error!");
    }
    */
    function testNoteStorageSetAndGetNote() public
    {
        string memory testAddString = "Hello, this is the first note.";
        string memory testGetString;

        noteStorage.SetNote(testAddress, 0, testAddString);
        testGetString = noteStorage.GetNote(testAddress, 0);

        Assert.equal(testAddString, testGetString, "Add or get note error!");
    }
}