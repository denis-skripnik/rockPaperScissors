const contractAddress = "0x0f96E331b1DC1DbbC1B8526F391C52B5C8f0d7F4";
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
				"internalType": "uint256",
				"name": "option",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "contractOption",
				"type": "uint256"
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
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	}
]

const faucetAddress = '0xbc05Cc40eC89554ae9067426d12Cc087b377084C';
const faucetABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "lastRequest",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "lastRequestFromWhiteList",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "recipientAddress",
				"type": "address"
			}
		],
		"name": "requestToken",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	}
]

const provider = new ethers.providers.Web3Provider(window.ethereum, 3333)//ChainID 97 Meganet testnet
let signer;
let signerAddress;
let contract;
let faucetContract;
let game_variant = ['Rock', 'Scissors', 'Paper'];

const event = "Gamed";

provider.send("eth_requestAccounts", []).then(()=>{
    provider.listAccounts().then( async (accounts) => {
        signer = provider.getSigner(accounts[0]); //account in metamask
        signerAddress = await signer.getAddress();

		contract = new ethers.Contract(
            contractAddress,
            contractABI,
            signer
        )
     
		faucetContract = new ethers.Contract(
            faucetAddress,
            faucetABI,
            signer
        )
    }
    )
}
)

const targetNetworkId = '0xd05';

const checkNetwork = async () => {
	if (window.ethereum) {
	  const currentChainId = await window.ethereum.request({
		method: 'eth_chainId',
	  });

	  // return true if network id is the same
	  if (currentChainId == targetNetworkId) return true;
	  // return false is network id is different
	  return false;
	}
  };

const switchNetwork = async () => {
	const network_status = await checkNetwork();
	if (network_status === true) return;
	await window.ethereum.request({
	  method: 'wallet_switchEthereumChain',
	  params: [{ chainId: targetNetworkId }],
	});
	// refresh
	window.location.reload();
  };

switchNetwork();

async function runGame(){
	await switchNetwork();
	let _option = parseInt(document.getElementById("game_item").value);
	let amountInEth = document.getElementById("amountInEth").value;
    
	let amountInWei = ethers.utils.parseEther(amountInEth.toString())

    let resultOfGame = await contract.selectRPS(_option, {value: amountInWei});
    const res = await resultOfGame.wait();
    console.log(res);
    
	await handleEvent();
}

async function faucet(){
	await switchNetwork();

try {
	let resultOfFaucet = await faucetContract.requestToken(signerAddress);
    const res = await resultOfFaucet.wait();
    window.alert(JSON.stringify(res));
} catch(e) {
	window.alert(JSON.stringify(e));
}
}

async function handleEvent(){
    await switchNetwork();
	let queryResult =  await contract.queryFilter('Gamed', await provider.getBlockNumber() - 5000, await provider.getBlockNumber());
    let queryResultRecent = queryResult[queryResult.length-1]
    let amount = await queryResultRecent.args.amount.toString();
	let player = await queryResultRecent.args.player.toString();
    let option = await queryResultRecent.args.option.toString();
    let contractOption = await queryResultRecent.args.contractOption.toString();
	let result = await queryResultRecent.args.result.toString();
	let status = 'WIN 🎉';
if (result == 0) {
    status = 'Draw. 50% of the bet will be refunded.'
} else if (result == -1) {
    status = 'LOSE 😥';
}

    let resultLogs = `
    stake amount: ${ethers.utils.formatEther(amount.toString())} MEGA2, 
    player: ${player}, 
    player chose: ${game_variant[option]}, 
    Contract chose: ${game_variant[contractOption]},
    result: ${status}`;
    console.log(resultLogs);

    let resultLog = document.getElementById("resultLog");
    resultLog.innerText = resultLogs;
    
}