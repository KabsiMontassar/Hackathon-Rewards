import { Client, PrivateKey, AccountCreateTransaction, TransferTransaction, Hbar } from '@hashgraph/sdk';


// Load the operator details from environment variables
const operatorPrivateKey = PrivateKey.fromStringECDSA(process.env.REACT_APP_HEDERA_OPERATOR_PRIVATE_KEY);
const operatorAccountId = process.env.REACT_APP_HEDERA_OPERATOR_ID;

const client = Client.forTestnet();
client.setOperator(operatorAccountId, operatorPrivateKey);

// Function to create a new Hedera account
export const createHederaAccount = async () => {
  const privateKey = await PrivateKey.generate();
  const publicKey = privateKey.publicKey;

  const transaction = new AccountCreateTransaction()
    .setKey(publicKey)
    .setInitialBalance(new Hbar(0));

  const txResponse = await transaction.execute(client);
  const receipt = await txResponse.getReceipt(client);
  const newAccountId = receipt.accountId;

  return { newAccountId: newAccountId.toString(), privateKey: privateKey.toString() };
};

// Function to transfer Hbars
export const transferHbars = async (fromAccountId, toAccountId, amount) => {
  const transferTransaction = new TransferTransaction()
    .addHbarTransfer(fromAccountId, new Hbar(-amount))
    .addHbarTransfer(toAccountId, new Hbar(amount));

  const txResponse = await transferTransaction.execute(client);
  await txResponse.getReceipt(client);
};

// Export the operator's account ID as the merchant account ID
export const merchantAccountId = operatorAccountId;
