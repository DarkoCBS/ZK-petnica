import { ethers } from "hardhat";

async function main() {
// The Contract interface
let abi = [
    "event GreeterEvent(string NewGreeting)",
];

// Connect to the network
// let provider = ethers.getDefaultProvider("homestead");
let httpProvider = new ethers.JsonRpcProvider();

// The address from the above deployment example
let contractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

// We connect to the Contract using a Provider, so we will only
// have read-only access to the Contract
let contract = new ethers.Contract(contractAddress, abi, httpProvider);

contract.on("GreeterEvent", (setter: any, NewGreeting: any, event: any)=> {
	console.log("New Greeting is", NewGreeting);
})

}

main();