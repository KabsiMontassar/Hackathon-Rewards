// App.js
import React, { useState, useEffect } from 'react';
import { Client, TransferTransaction  , PrivateKey, Hbar} from '@hashgraph/sdk';
import { Auth, db } from './firebase';

const client = Client.forTestnet();

const operatorPrivateKey = PrivateKey.fromStringECDSA('0x8da88d05b24618d4ccd8b004fdb207776261bdf6e21ec7a1dae30c78be0e2398');
client.setOperator('0.0.4474666', operatorPrivateKey); // use fromStringECDSA 


const App = () => {
  const [user, setUser] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [products, setProducts] = useState([]);

  const fetchTokenBalance = async (userId) => {
    try {
      const tokenBalanceRef = await db.collection('utilisateurs').doc(userId).get();
      const tokenBalanceData = tokenBalanceRef.data();
      setTokenBalance(tokenBalanceData.balance);
    } catch (error) {
      console.error('Error fetching token balance:', error);
    }
  };

  useEffect(() => {
    Auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        fetchTokenBalance(user.uid);
        fetchProducts();
      }
    });
  }, []);

  const signUp = async (email, password) => {
    try {
      await Auth.createUserWithEmailAndPassword(email, password);
        const userId = Auth.currentUser.uid;
        const userData = {
            email: Auth.currentUser.email,
            balance: 100,
            hederaAccountId: await createHederaAccount(),
        };
        await storeUserData(userId, userData);


        
    } catch (error) {
      console.error('Sign up error:', error);
    }
  };

  const createHederaAccount = async () => {
    try {
      // Simulate account creation on Hedera (replace with actual Hedera SDK logic)
      const accountId = '0.0.' + Math.floor(Math.random() * 1000000);
      console.log('Account created on Hedera:', accountId);
      return accountId;
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

  const fetchProducts = async () => {
    try {
      const productsRef = await db.collection('products').get();
      const productsData = productsRef.docs.map((doc) => doc.data());
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const signIn = async (email, password) => {
    try {
      await Auth.signInWithEmailAndPassword(email, password);
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
  
      if (tokenBalance < product.cost) {
        alert('Insufficient funds.');
        return;
      }
  
      const userId = user.uid;
      const userRef = db.collection('utilisateurs').doc(userId);
      await db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        const newBalance = userDoc.data().balance - product.cost;
        transaction.update(userRef, { balance: newBalance });
  
        // transaction 

        const transferTransaction = new TransferTransaction()
        .addHbarTransfer('0.0.4474666', new Hbar(-1))
        .addHbarTransfer(userDoc.data().hederaAccountId, new Hbar(1))
        
       const txResponse  =  await transferTransaction.execute(client);

        const receipt = await txResponse.getReceipt(client);

        console.log(receipt.status.toString());

  
       
  
     
  
      });
  
      await fetchTokenBalance(userId); // Updated to await
      fetchProducts();
    } catch (error) {
      console.error('Purchase error:', error);
    }
  };

  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.email}!</p>
          <p>Your Token Balance: {tokenBalance} tokens</p>
          <button onClick={signOut}>Sign Out</button>
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
