const contractAddress = "0x125910Ea9c6d1cCF5ae66967F4E202b8e3743787";
const contractABI = [
	{
		"inputs": [],
		"stateMutability": "payable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint8",
				"name": "option",
				"type": "uint8"
			},
			{
				"indexed": false,
				"internalType": "int8",
				"name": "result",
				"type": "int8"
			}
		],
		"name": "Gamed",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint8",
				"name": "_option",
				"type": "uint8"
			}
		],
		"name": "selectRPS",
		"outputs": [
			{
				"internalType": "int8",
				"name": "",
				"type": "int8"
			}
		],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "withdraw",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
]

const provider = new ethers.providers.Web3Provider(window.ethereum, 97)//ChainID 97 BNBtestnet
let signer;
let contract;
let game_variant = ['Rock', 'Scissors', 'Paper'];


const event = "Gamed";

provider.send("eth_requestAccounts", []).then(()=>{
    provider.listAccounts().then( (accounts) => {
        signer = provider.getSigner(accounts[0]); //account in metamask
        
        contract = new ethers.Contract(
            contractAddress,
            contractABI,
            signer
        )
     
    }
    )
}
)

async function runGame(){
	let _option = parseInt(document.getElementById("game_item").value);
	let amountInEth = document.getElementById("amountInEth").value;
    let amountInWei = ethers.utils.parseEther(amountInEth.toString())
    console.log(amountInWei);

    let resultOfGame = await contract.selectRPS(_option, {value: amountInWei});
    const res = await resultOfGame.wait();
    console.log(res);
    
	await handleEvent();
}

async function handleEvent(){

    let queryResult =  await contract.queryFilter('Gamed', await provider.getBlockNumber() - 10000, await provider.getBlockNumber());
    let queryResultRecent = queryResult[queryResult.length-1]
    let amount = await queryResultRecent.args.amount.toString();
    let player = await queryResultRecent.args.player.toString();
    let option = await queryResultRecent.args.option.toString();
    let result = await queryResultRecent.args.result.toString();
let status = 'WIN 🎉';
if (result == 0) {
    status = 'Draw. 50% of the bet will be refunded.'
} else if (result == -1) {
    status = 'LOSE 😥';
}

    let resultLogs = `
    stake amount: ${ethers.utils.formatEther(amount.toString())} BNB, 
    player: ${player}, 
    player chose: ${game_variant[option]}, 
    result: ${status}`;
    console.log(resultLogs);

    let resultLog = document.getElementById("resultLog");
    resultLog.innerText = resultLogs;
    
}








