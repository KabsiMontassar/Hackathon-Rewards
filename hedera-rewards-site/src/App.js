import React, { useState, useEffect } from 'react';
import { Client, PrivateKey, AccountBalanceQuery } from '@hashgraph/sdk';
import { Auth, db } from './firebase';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useFirestore } from './hooks/useFirestore';
import SignInForm from './components/Auth/SignInForm';
import SignUpForm from './components/Auth/SignUpForm';
import ProductList from './components/Products/ProductList';
import TransactionHistory from './components/Transactions/TransactionHistory';
import { transferHbars } from './services/hederaService';
import * as hederaService from './services/hederaService'; // Import all functions from hederaService

const client = Client.forTestnet();

const operatorPrivateKey = PrivateKey.fromStringECDSA(process.env.REACT_APP_HEDERA_OPERATOR_PRIVATE_KEY);
const operatorAccountId = process.env.REACT_APP_HEDERA_OPERATOR_ID;

client.setOperator(operatorAccountId, operatorPrivateKey);

const App = () => {
  const [tokenBalance, setTokenBalance] = useState(0);
  const [products, setProducts] = useState([]);
  const { user } = useAuth();
  const { fetchProducts, fetchUserBalance, storeTransactionHistory } = useFirestore();

  const fetchOperatorBalance = async () => {
    try {
      const balance = await new AccountBalanceQuery()
        .setAccountId(operatorAccountId)
        .execute(client);
      // setOperatorBalance(balance.hbars.toTinybars().toString());
    } catch (error) {
      console.error('Error fetching operator balance:', error);
    }
  };



  useEffect(() => {
    const fetchTokenBalance = async (userId) => {
      try {
        const balance = await fetchUserBalance(userId);
        setTokenBalance(balance);
      } catch (error) {
        console.error('Error fetching token balance:', error);
      }
    };

    if (user) {
      fetchTokenBalance(user.uid);
      fetchOperatorBalance();
      fetchProducts();
    }
  }, [user, fetchProducts, fetchUserBalance]);

  const signUp = async (email, password) => {
    try {
      await Auth.createUserWithEmailAndPassword(email, password);
      const userId = Auth.currentUser.uid;
      const hederaAccount = await createHederaAccount();
      const userData = {
        email: Auth.currentUser.email,
        balance: 0,
        hederaAccountId: hederaAccount.newAccountId,
      };
      await db.collection('User').doc(userId).set(userData);
    } catch (error) {
      console.error('Sign up error:', error);
    }
  };

  const createHederaAccount = async () => {
    try {
      const { newAccountId } = await hederaService.createHederaAccount();
      return newAccountId;
    } catch (error) {
      console.error('Hedera account creation error:', error);
      throw error;
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
      await db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(db.collection('User').doc(userId));
        const newBalance = userDoc.data().balance - product.cost;
        transaction.update(db.collection('User').doc(userId), { balance: newBalance });
        setTokenBalance(newBalance);

        await transferHbars(operatorAccountId, userDoc.data().hederaAccountId, product.cost / 100);

        const transactionDetails = {
          productId: product.id,
          productName: product.name,
          cost: product.cost,
          date: new Date(),
          hbarsSpent: product.cost / 100,
        };
        await storeTransactionHistory(userId, transactionDetails);
      });
    } catch (error) {
      console.error('Purchase error:', error);
    }
  };

  return (
    <AuthProvider>
      <div>
        <h1>E-commerce App</h1>
        {user ? (
          <div>
            <h2>Welcome, {user.email}</h2>
            <p>Your balance: {tokenBalance} HBAR</p>
         
            <ProductList products={products} purchaseProduct={purchaseProduct} />
            <TransactionHistory />
            <button onClick={signOut}>Sign Out</button>
          </div>
        ) : (
          <div>
            <SignUpForm signUp={signUp} />
            <SignInForm signIn={signIn} />
          </div>
        )}
      </div>
    </AuthProvider>
  );
};

export default App;
