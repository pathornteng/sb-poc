#!/usr/bin/env node
import 'dotenv/config';
import { ethers } from 'ethers';

const RPC_URL = 'https://testnet.hashio.io/api'; 
const RESERVE_FACET_ADDRESS = '0x6632463E3aa2Da84806b257782bb2A30698998d6'; 
const NEW_AMOUNT_RAW = 123_456_789n; 

if (!process.env.PRIVATE_KEY) {
  console.error('Missing PRIVATE_KEY in .env');
  process.exit(1);
}

const ABI = [
  'function setAmount(int256 newValue) external',
  'function latestRoundData() view returns (uint80,int256,uint256,uint256,uint80)',
  'function reserveAmount() view returns (int256)',
];

async function readAmount(contract) {
  try {
    const [, answer,, updatedAt] = await contract.latestRoundData();
    return { value: answer, source: 'latestRoundData', updatedAt };
  } catch {}
  try {
    const v = await contract.reserveAmount();
    return { value: v, source: 'reserveAmount', updatedAt: 0n };
  } catch {}
  return { value: null, source: 'unknown', updatedAt: 0n };
}

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const contract = new ethers.Contract(RESERVE_FACET_ADDRESS, ABI, wallet);

  const before = await readAmount(contract);
  if (before.value !== null) {
    console.log(`Before [${before.source}]: ${before.value.toString()}`);
  } else {
    console.log('Before: (could not read amount; proceeding anyway)');
  }

  const tx = await contract.setAmount(NEW_AMOUNT_RAW);
  console.log(`Tx sent: ${tx.hash}`);
  const rcpt = await tx.wait();
  console.log(`Confirmed in block: ${rcpt.blockNumber}`);

  const after = await readAmount(contract);
  if (after.value !== null) {
    console.log(`After  [${after.source}]: ${after.value.toString()}`);
  } else {
    console.log('After: (could not read amount)');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
