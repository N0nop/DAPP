pragma solidity >= 0.4.21 < 0.6.0;

contract NoteStorage
{
    // Owner of the notes
    mapping(address => string[]) public Notes;
    // Access control
    mapping(address => bool) AccessRight;
    /*
    // View times
    mapping(address => uint256[]) public Views;
    */

    // Only the logic layer can access the NoteStorage directly
    constructor() public
    {
        AccessRight[msg.sender] = true;
    }

    // Check the access right
    modifier platform()
    {
        require(AccessRight[msg.sender] == true, "Access deny");
        _;
    }

    // Allow a logic layer to access (for updating the logic layer)
    function AllowAccess(address _address) public platform
    {
        AccessRight[_address] = true;
    }

    // Deny a old logic layer to access (for delete the unused logic)
    function DenyAccess(address _address) public platform
    {
        AccessRight[_address] = false;
    }

    // Get a note from specific index
    function GetNote(address _address, uint256 index) public view returns(string memory)
    {
        return Notes[_address][index];
    }

    // Set a note for specific index (maybe add or edit)
    function SetNote(address _address, uint256 index, string memory note) public platform
    {
        if(index >= Notes[_address].length)
        {
            Notes[_address].push(note);
            //Views[_address].push(0);
        }
        else
        {
            Notes[_address][index] = note;
        }
    }

    /*
    // The times that a note has been viewed
    function GetView(address _address, uint256 index) public view returns(uint256)
    {
        return Views[_address][index];
    }
    */

    // The number of notes
    function GetLength(address _address) public view returns(uint256)
    {
        return Notes[_address].length;
    }

    /*
    // Update View
    function UpdateView(address _address, uint256 index) public
    {
        Views[_address][index]++;
    }
    */
}