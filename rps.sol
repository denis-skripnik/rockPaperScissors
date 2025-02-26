// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RockPaperScissors{

    //modifier onlyOwner
    modifier onlyOwner{
        require(msg.sender == owner);
        _;
    }

    //Owner's address
    address owner; 

    //event to track result of game.
    event Gamed(address player, uint256 amount, uint256 option, uint256 contractOption, int8 result); 

    //payable = user может заплатить в BNB (главная монета в блокчейне)
    //in Constructor we assign owner's address;
    constructor() payable {
        owner = msg.sender;
    }

    //function that asks for 0, 1 or 2 and returns if you win, lose or draw
    function selectRPS(uint8 _option) public payable returns (int8){ //view, pure = gassless 
        require(_option<3, "Please choose a rock, scissors or paper");
        require(msg.value>0, "Please add your bet"); //WEI smallest unit ETH 
        //1,000,000,000,000,000,000 WEI = 1 ETH 
        require(msg.value*2 <= address(this).balance, "Contract balance is insuffieient ");

        //PseudoRandom and check with _option 
        uint contractOption = block.timestamp*block.gaslimit%3; 
        int8 result = 0;
if (_option == contractOption) {
    payable(msg.sender).transfer(msg.value/2);
                } else if ((_option == 0 && contractOption == 1) ||
        (_option == 2 && contractOption == 0) ||
                (_option == 1 && contractOption == 2)) {
            result = 1;
        } else {
        result = -1;
        }

        //Emiting event of Coin Flip
        emit Gamed(msg.sender, msg.value, _option, contractOption, result);

        //If user wins he doubles his stake
        if (result == 1){
            payable(msg.sender).transfer(msg.value*2);
        }
        // Returning the result.
        return result;
        
    }

    //Owner can withdraw BNB amount
    function withdraw() public onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

}