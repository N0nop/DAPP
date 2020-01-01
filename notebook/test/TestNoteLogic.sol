pragma solidity >= 0.4.21 < 0.7.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/NoteLogic.sol";
import "../contracts/NoteStorage.sol";

contract TestNoteLogic
{
    address testAddress = address(this);
    NoteStorage noteStorage = new NoteStorage();
    address testNoteStorageAddress = address(noteStorage);
    NoteLogic noteLogic = new NoteLogic(testNoteStorageAddress);

    constructor() public
    {
        noteStorage.AllowAccess(address(noteLogic));
    }

    function testNoteLogicLength() public
    {
        string memory testAddString = "Hello, this is the first note.";
        uint256 length;

        length = noteLogic.Length(testAddress);
        Assert.equal(length, 0, "Length error");

        noteLogic.Write(testAddress, testAddString);

        length = noteLogic.Length(testAddress);
        Assert.equal(length, 1, "Length error");
    }
    /*
    function testNoteLogicView() public
    {
        string memory testAddString = "Hello, this is the first note.";
        string memory testGetString;
        uint256 view1;
        uint256 view2;

        noteLogic.Write(testAddress, testAddString);
        view1 = noteLogic.Views(testAddress, 0);

        testGetString = noteLogic.Read(testAddress, 0);
        view2 = noteLogic.Views(testAddress, 0);

        Assert.equal(view1, 0, "Views initialize error!");
        Assert.equal(view2, 1, "Views update error!");
    }
    */
    function testNoteLogicWriteAndRead() public
    {
        string memory testAddString = "Hello, this is the first note.";
        string memory testAddString2 = "Hello, this is the second note.";
        string memory testGetString;
        string memory testGetString2;

        noteLogic.Write(testAddress, testAddString);
        noteLogic.Write(testAddress, testAddString2);

        testGetString = noteLogic.Read(testAddress, 0);
        testGetString2 = noteLogic.Read(testAddress, 0);

        Assert.equal(testGetString, testAddString, "Write or read note error!");
        Assert.equal(testGetString2, testAddString, "Write or read note error!");
    }

    function testNoteLogicModify() public
    {
        string memory testAddString = "Hello, this is the first note.";
        string memory testModString = "Hello, this is the second note.";
        string memory testGetString;

        noteLogic.Write(testAddress, testAddString);
        noteLogic.Modify(testAddress, 0, testModString);
        testGetString = noteLogic.Read(testAddress, 0);

        Assert.equal(testModString, testGetString, "Modify note error!");
    }
}