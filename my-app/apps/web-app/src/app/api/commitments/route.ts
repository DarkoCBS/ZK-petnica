import { Contract, InfuraProvider, JsonRpcProvider, Wallet } from "ethers"
import { NextRequest } from "next/server"
import Feedback from "../../../../contract-artifacts/Feedback.json"

export async function GET(req: NextRequest) {
    if (typeof process.env.NEXT_PUBLIC_FEEDBACK_CONTRACT_ADDRESS !== "string") {
        throw new Error("Please, define NEXT_PUBLIC_FEEDBACK_CONTRACT_ADDRESS in your .env file")
    }

    if (typeof process.env.NEXT_PUBLIC_DEFAULT_NETWORK !== "string") {
        throw new Error("Please, define NEXT_PUBLIC_DEFAULT_NETWORK in your .env file")
    }

    if (typeof process.env.INFURA_API_KEY !== "string" && process.env.NEXT_PUBLIC_DEFAULT_NETWORK !== "localhost") {
        throw new Error("Please, define INFURA_API_KEY in your .env file")
    }

    if (typeof process.env.ETHEREUM_PRIVATE_KEY !== "string") {
        throw new Error("Please, define ETHEREUM_PRIVATE_KEY in your .env file")
    }

    const ethereumPrivateKey = process.env.ETHEREUM_PRIVATE_KEY
    const ethereumNetwork = process.env.NEXT_PUBLIC_DEFAULT_NETWORK
    const infuraApiKey = process.env.INFURA_API_KEY
    const contractAddress = process.env.NEXT_PUBLIC_FEEDBACK_CONTRACT_ADDRESS

    const provider =
        ethereumNetwork === "localhost"
            ? new JsonRpcProvider("http://127.0.0.1:8545")
            : new InfuraProvider(ethereumNetwork, infuraApiKey)

    const signer = new Wallet(ethereumPrivateKey, provider)
    const contract = new Contract(contractAddress, Feedback.abi, signer)

    const url = new URL(req.url);
    const queryParams = url.searchParams;
  
    // Example: Get a specific query parameter
    const paramValue = queryParams.get('groupId'); // replace 'paramName' with your query parameter key
    
    try {
        const transaction = await contract.getIdentityCommitments(paramValue)

        const data = transaction.map((comm: any) => BigInt(comm).toString())

        return new Response(JSON.stringify({
          data: data,
          status: 200
        }))
    } catch (error: any) {
        console.error(error)

        return new Response(`Server error: ${error}`, {
            status: 500
        })
    }
}
