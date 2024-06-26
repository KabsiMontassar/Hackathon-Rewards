import React, { useState, useEffect } from 'react';
import { Client, TransferTransaction, PrivateKey, Hbar, AccountBalanceQuery , AccountCreateTransaction } from '@hashgraph/sdk';
import { Auth, db } from './firebase';

const client = Client.forTestnet();

const pkey = "0x8da88d05b24618d4ccd8b004fdb207776261bdf6e21ec7a1dae30c78be0e2398";
const pId = '0.0.4474666';

const operatorPrivateKey = PrivateKey.fromStringECDSA(pkey);
client.setOperator(pId, operatorPrivateKey); // use fromStringECDSA 

const App = () => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [userfromDb , setUserfromDb] = useState([]);
  
  const [operatorBalance, setOperatorBalance] = useState(0);
  const [UserBalance, setUserBalance] = useState(0);

  const fetchOperatorBalance = async () => {
    try {
      if (!userfromDb || !userfromDb.hederaAccountId) {
        console.error('User data or Hedera account ID is not available.');
        return;
      }
  
      const operatorBalanceQuery = new AccountBalanceQuery()
        .setAccountId(pId);
      const operatorBalance = await operatorBalanceQuery.execute(client);
  
      const userBalanceQuery = new AccountBalanceQuery()
        .setAccountId(userfromDb.hederaAccountId);
      const userBalance = await userBalanceQuery.execute(client);
    
      setUserBalance( userBalance.hbars.toString()  );

     
     
    
      setOperatorBalance(operatorBalance.hbars.toString());
    } catch (error) {
      console.error('Error fetching operator balance:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const productsRef = await db.collection('Products').get();
      const productsData = productsRef.docs.map((doc) => doc.data());
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching Products:', error);
    }
  };

  useEffect(() => {
    Auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
         db.collection('utilisateurs').doc(user.uid).get().then((doc) => {
          if (doc.exists) {
            setUserfromDb(doc.data());
            console.log("User data from db:", doc.data());
          } else {
            console.log('No such document!');
          }
        }).catch((error) => {
          console.log('Error getting document:', error);
        });
       
        fetchOperatorBalance();
        fetchProducts();
      }
    });
  }, [userfromDb.balance]);

  const signUp = async (email, password) => {
    try {
      await Auth.createUserWithEmailAndPassword(email, password);
      const userId = Auth.currentUser.uid;
  
      // Generate a new private key for the user
      const newPrivateKey = PrivateKey.generate();
      const newAccountId = await createHederaAccount(newPrivateKey);
  
      const userData = {
        email: Auth.currentUser.email,
        balance: 0,
        hederaAccountId: newAccountId,
        privateKey: newPrivateKey.toString(), // Store the private key as a string
      };
  
      await storeUserData(userId, userData);
    } catch (error) {
      console.error('Sign up error:', error);
    }
  };
  
  const createHederaAccount = async (privateKey) => {
    try {
      // Use the private key to create a new account on Hedera
      const response = await new AccountCreateTransaction()
        .setKey(privateKey.publicKey)
        .setInitialBalance(new Hbar(0)) // Set initial balance as needed
        .execute(client);
  
      const receipt = await response.getReceipt(client);
      const newAccountId = receipt.accountId.toString();
      console.log('Account created on Hedera:', newAccountId);
      return newAccountId;
    } catch (error) {
      console.error('Hedera account creation error:', error);
      throw error;
    }
  };

  const storeUserData = async (userId, userData) => {
    try {
      // Store user data in Firestore database
      await db.collection('utilisateurs').doc(userId).set(userData);
      console.log('User data stored in database:', userId, userData);
    } catch (error) {
      console.error('Error storing user data:', error);
      throw error;
    }
  };

  const signIn = async (email, password) => {
    try {
      await Auth.signInWithEmailAndPassword(email, password);
      setUser(Auth.currentUser);
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const signOut = async () => {
    try {
      await Auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const purchaseProduct = async (product) => {
    try {
      if (!user) {
        console.error('Please sign in to purchase products.');
        return;
      }
  
      const userId = user.uid;
      const userRef = db.collection('utilisateurs').doc(userId);
      await db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        const userPrivateKey = PrivateKey.fromString(userDoc.data().privateKey);
  
        // Create and sign the transaction
        const transferTransaction = new TransferTransaction()
          .addHbarTransfer(userDoc.data().hederaAccountId, new Hbar(-product.cost)) // Ensure these IDs are correct
          .addHbarTransfer(pId, new Hbar(product.cost))
          .freezeWith(client);
  
        // Sign the transaction with the user's private key first
        const userSignedTransaction = await transferTransaction.sign(userPrivateKey);
  
        // Sign the transaction with the operator's private key
        const operatorSignedTransaction = await userSignedTransaction.sign(operatorPrivateKey);
  
        // Execute the transaction
        const txResponse = await operatorSignedTransaction.execute(client);
        const receipt = await txResponse.getReceipt(client);
        console.log(receipt.status.toString());
  
        // Fetch updated operator balance
        fetchOperatorBalance();
      });
    } catch (error) {
      console.error('Purchase error:', error);
    }
  };

  const claimHbar = async () => {

    try {
    
  
      const transferTransaction = await new TransferTransaction()
        .addHbarTransfer(pId, new Hbar(-10))
        .addHbarTransfer(userfromDb.hederaAccountId, new Hbar(10))
       
  

      const txResponse = await transferTransaction.execute(client);
      const receipt = await txResponse.getReceipt(client);
      console.log('Transaction receipt status:', receipt.status.toString());

      

   

    

  
      // Fetch updated operator balance
      fetchOperatorBalance();
    } catch (error) {
      console.error('Add Hbar to operator error:', error);
    }
  };
 
  return (
    <div>
      {user ? (
        <div>
          <h1>Hedera Rewards Platform</h1>
          <p>Operator Balance: {operatorBalance} </p>
          <p>User Balance: {UserBalance} </p>
          <p>Welcome, {userfromDb.email}!</p>
          <p>Your Hedera Account ID: {userfromDb.hederaAccountId}</p>
          <button onClick={signOut}>Sign Out</button>
          <button onClick={claimHbar}>Claim 10 hbar</button>
          <ProductList products={products} purchaseProduct={purchaseProduct} />
        </div>
      ) : (
        <div>
          <p>Please sign in to access the platform.</p>
          <SignInForm signIn={signIn} />
          <p>Don't have an account? Sign up below:</p>
          <SignUpForm signUp={signUp} />
        </div>
      )}
    </div>
  );
};

const SignInForm = ({ signIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    signIn(email, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Sign In</button>
    </form>
  );
};

const SignUpForm = ({ signUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    signUp(email, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Sign Up</button>
    </form>
  );
};

const ProductList = ({ products, purchaseProduct }) => {
  return (
    <div>
      <h2>Available Products</h2>
      <ul>
        {products.map((product, index) => (
                    <li key={index}>
                    <p>{product.name}</p>
                    <p>Cost: {product.cost} tokens</p>
                    <button onClick={() => purchaseProduct(product)}>Purchase</button>
                  </li>
                ))}
              </ul>
            </div>
          );
        };
        
        export default App;
        
