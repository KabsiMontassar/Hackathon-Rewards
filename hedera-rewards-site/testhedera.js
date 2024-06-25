// testhedera.js
import { createToken, createAccount } from './src/hedera.js';

(async () => {
  try {
    // Test creating a Hedera account
  
    const { accountId, privateKey } = await createAccount();
    console.log(`New account ID: ${accountId}, Private key: ${privateKey.toString()}`);

    // Test creating a token
    const tokenId = await createToken('TestToken', 1000);
    console.log(`New token ID: ${tokenId}`);
  } catch (error) {
    console.error('Test failed:', error);
  }
})();
