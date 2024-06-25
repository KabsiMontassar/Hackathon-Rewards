// src/services/hederaService.js
import { Client, TokenCreateTransaction, AccountCreateTransaction, Hbar, PrivateKey } from '@hashgraph/sdk';

// Initialize Hedera client
const client = Client.forTestnet();
const operatorPrivateKey = PrivateKey.fromString(process.env.REACT_APP_OPERATOR_PRIVATE_KEY);
const operatorAccountId = process.env.REACT_APP_OPERATOR_ACCOUNT_ID;

client.setOperator(operatorAccountId, operatorPrivateKey);

/**
 * Create a new token on Hedera network
 * @param {string} tokenName - Name of the token
 * @param {number} initialSupply - Initial supply of the token
 * @returns {Promise<string>} - Returns token ID
 */
export const createToken = async (tokenName, initialSupply) => {
  try {
    const tokenResponse = await new TokenCreateTransaction()
      .setTokenName(tokenName)
      .setTokenSymbol('SYM')
      .setTreasuryAccountId(operatorAccountId)
      .setInitialSupply(initialSupply)
      .execute(client);

    const tokenId = (await tokenResponse.getReceipt(client)).tokenId;
    console.log(`Token created with ID: ${tokenId}`);
    return tokenId;
  } catch (error) {
    console.error('Error creating token:', error);
    throw error;
  }
};

/**
 * Create a new Hedera account
 * @returns {Promise<{ accountId: string, privateKey: PrivateKey }>} - Returns account ID and private key
 */
export const createAccount = async () => {
  try {
    const newAccountPrivateKey = PrivateKey.generate();
    const newAccountPublicKey = newAccountPrivateKey.publicKey;

    const newAccount = await new AccountCreateTransaction()
      .setKey(newAccountPublicKey)
      .setInitialBalance(new Hbar(1))
      .execute(client);

    const accountId = (await newAccount.getReceipt(client)).accountId;
    console.log(`Account created with ID: ${accountId}`);
    return { accountId, privateKey: newAccountPrivateKey };
  } catch (error) {
    console.error('Error creating account:', error);
    throw error;
  }
};
