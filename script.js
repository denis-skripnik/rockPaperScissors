const contracts = {
	"9999": "0xc5076e7470e7bb1B16A84142F79F6fCbA83fb9fD",
	"167005": "0x73C9F6e1B870a9447E329a3d6D20360D56988A0f",
	"84531": "0xce1e3733c981f19f340a6eefe8f6031ccd880c39",
	"534353": "0x0f96E331b1DC1DbbC1B8526F391C52B5C8f0d7F4",
	"59140": "0xe03e74a3ffac37da8389deed05cd0fd826aa472b",
	"97": "0xa18ee4748d26b6c254c67e32465c04c0b5a0c82f",
	"7001": "0x20543ab6d8a90abb0b9402bf1e83858979bbce94"
}

const explorers = {
	"9999": "https://scan.metagarden.io",
	"167005": "https://explorer.test.taiko.xyz",
	"84531": "https://goerli.basescan.org",
	"534353": "https://blockscout.scroll.io",
	"59140": "https://goerli.lineascan.build",
	"97": "https://bscscan.com",
	"7001": "https://explorer.zetachain.com"
}

const tokens = {
	"9999": "MEGA",
	"167005": "ETH",
	"84531": "ETH",
	"534353": "ETH",
	"59140": "ETH",
	"97": "BNB",
	"7001": "ZETA"
}

var chain_id = "9999";

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

var provider = new ethers.providers.Web3Provider(window.ethereum, "any")
let signer;
let signerAddress;
let contract;
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
document.getElementById('smartContractAddress').innerHTML = contracts[chain_id]
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