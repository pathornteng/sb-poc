// Import ethers
const { ethers } = require("ethers");

async function main() {
  // Connect to Ethereum provider (for example Infura or Alchemy)
  const provider = new ethers.JsonRpcProvider("http://localhost:7546");

  // Create a signer (your wallet)
  const wallet = new ethers.Wallet("0x", provider);

  // ERC20 contract address (for example USDT)
  const tokenAddress = "0x000000000000000000000000000000000000043f";

  // ERC20 ABI fragment (only what we need: transfer)
  const erc20Abi = [
    "function associate() external returns (uint256 responseCode)",
  ];

  // Create contract instance
  const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, wallet);

  // Call transfer
  const tx = await tokenContract.associate();
  console.log("Transaction hash:", tx.hash);

  // Wait for confirmation
  const receipt = await tx.wait();
  console.log("Transaction confirmed in block:", receipt.blockNumber);
}

main().catch(console.error);
