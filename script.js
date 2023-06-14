const contracts = {
	"3333": "0x0f96E331b1DC1DbbC1B8526F391C52B5C8f0d7F4",
	"167005": "0x73C9F6e1B870a9447E329a3d6D20360D56988A0f",
	"84531": "0xce1e3733c981f19f340a6eefe8f6031ccd880c39",
	"534353": "0x0f96E331b1DC1DbbC1B8526F391C52B5C8f0d7F4",
	"59140": "0xe03e74a3ffac37da8389deed05cd0fd826aa472b",
	"97": "0xa18ee4748d26b6c254c67e32465c04c0b5a0c82f"
}

const explorers = {
	"3333": "https://scan.testnet.metagarden.io",
	"167005": "https://explorer.test.taiko.xyz",
	"84531": "https://goerli.basescan.org",
	"534353": "https://blockscout.scroll.io",
	"59140": "https://goerli.lineascan.build",
	"97": "https://bscscan.com"
}

const tokens = {
	"3333": "MEGA2",
	"167005": "ETH",
	"84531": "ETH",
	"534353": "ETH",
	"59140": "ETH",
	"97": "BNB"
}

var chain_id = "3333";

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

const faucetAddress = '0xf38b87e411d33bA24f627719c2c3979855Bb0AD8';
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

var provider = new ethers.providers.Web3Provider(window.ethereum, "any")
let signer;
let signerAddress;
let contract;
let faucetContract;
let game_variant = ['Rock', 'Scissors', 'Paper'];

const event = "Gamed";

var contractAddress = contracts[chain_id];

provider.send("eth_requestAccounts", []).then(()=>{
    provider.listAccounts().then( async (accounts) => {
        signer = provider.getSigner(accounts[0]); //account in metamask
        signerAddress = await signer.getAddress();

    
    }
    )
}
)

const checkNetwork = async (targetNetworkId) => {
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

const switchNetwork = async (chainId) => {
	chain_id = chainId.toString();
document.getElementById('nativeToken').innerHTML = tokens[chain_id]
if (chain_id !== '3333') 	document.getElementById('faucetBlock').style.display = 'none';
const targetNetworkId = ethers.utils.hexValue(chainId);
	const network_status = await checkNetwork(targetNetworkId);
	if (network_status === true) return;
await window.ethereum.request({
	  method: 'wallet_switchEthereumChain',
	  params: [{ chainId: targetNetworkId }],
	});
	provider = new ethers.providers.Web3Provider(window.ethereum, chainId)
  };

  async function runGame(){
	let _option = parseInt(document.getElementById("game_item").value);
	let amountInEth = document.getElementById("amountInEth").value;
    
	let amountInWei = ethers.utils.parseEther(amountInEth.toString())
	contractAddress = contracts[chain_id];
	const contract = new ethers.Contract(contractAddress, contractABI, signer)

    let resultOfGame = await contract.selectRPS(_option, {value: amountInWei});
    const res = await resultOfGame.wait();
    console.log(res);
    
	await handleEvent();
}

async function faucet(){
	await switchNetwork(3333);

try {
	const faucetContract = new ethers.Contract(faucetAddress, faucetABI, signer)
	let resultOfFaucet = await faucetContract.requestToken(signerAddress);
    const res = await resultOfFaucet.wait();
    window.alert(JSON.stringify(res));
} catch(e) {
	window.alert(JSON.stringify(e));
}
}

async function handleEvent(){
	contractAddress = contracts[chain_id];
	const contract = new ethers.Contract(contractAddress, contractABI, signer)
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
    stake amount: ${ethers.utils.formatEther(amount.toString())} ${tokens[chain_id]}, 
    player: ${player}, 
    player chose: ${game_variant[option]}, 
    Contract chose: ${game_variant[contractOption]},
    result: ${status}`;
    console.log(resultLogs);

    let resultLog = document.getElementById("resultLog");
    resultLog.innerText = resultLogs;
    
}