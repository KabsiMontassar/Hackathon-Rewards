import React, { useState, useEffect, useCallback } from 'react';
import { db } from './firebase'; // Import your Firebase instance
import { Client, PrivateKey, AccountBalanceQuery, Hbar, TransferTransaction } from "@hashgraph/sdk";

const Shopping = ({ currentUser, handleSignOut }) => {
  const operatorAccountId = '0.0.4474666';
  const operatorPrivateKey = "0x8da88d05b24618d4ccd8b004fdb207776261bdf6e21ec7a1dae30c78be0e2398";
  const client = Client.forTestnet();
  const privateKey = PrivateKey.fromStringECDSA(operatorPrivateKey);

  client.setOperator(operatorAccountId, privateKey);

  const [products, setProducts] = useState([]);
  const [balance, setBalance] = useState(0);
  const [balanceFromDb, setBalanceFromDb] = useState(0);
  const [operatorBalance, setOperatorBalance] = useState(0);
  const [loading, setLoading] = useState(false); // Loading state

  const fetchProducts = useCallback(async () => {
    try {
      const productsSnapshot = await db.collection('Products').get();
      const productsData = productsSnapshot.docs.map(doc => doc.data());
      return productsData;
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }, []);

  const fetchHederaBalance = useCallback(async () => {
    try {
      const balanceQuery = await new AccountBalanceQuery()
        .setAccountId(currentUser.hederaAccountId)
        .execute(client);

        setBalance(balanceQuery.hbars.toTinybars().toString());

      const userRef = db.collection('HederaUsers').doc(currentUser.uid);
      const userDoc = await userRef.get();
      const balanceFromDb = userDoc.data().balance; 
        setBalanceFromDb(balanceFromDb);

      const operatorBalanceQuery = await new AccountBalanceQuery()
        .setAccountId(operatorAccountId)
        .execute(client);

      const operatorBalance = operatorBalanceQuery.hbars.toTinybars().toString();
      setOperatorBalance(operatorBalance);

    } catch (error) {
      console.error('Error fetching Hedera balance:', error);
   
    }
  }, [currentUser, client, operatorAccountId]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true); // Start loading
      try {
       
          fetchHederaBalance()
       

      
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false); // Finish loading
      }
    };

    if (currentUser) {
      loadData();
    }
  }, [currentUser, fetchHederaBalance]); // Only run when currentUser, fetchProducts, or fetchHederaBalance change

  const handlePurchase = async (product) => {
    try {
      if (!currentUser) {
        console.error('Please sign in to purchase products.');
        return;
      }

      if (balance < product.cost) {
        alert('Insufficient funds.');
        return;
      }

      const userId = currentUser.uid;
      const userRef = db.collection('HederaUsers').doc(userId);
      await db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        const newBalance = balance - product.cost; // Subtract the product cost from the user's balance

        const transferTransaction = await new TransferTransaction()
          .addHbarTransfer(userDoc.data().hederaAccountId, new Hbar(-1))
          .addHbarTransfer(operatorAccountId, new Hbar(1))
          .setMaxTransactionFee(new Hbar(1))
          .execute(client);

        const receipt = await transferTransaction.getReceipt(client);
        console.log(receipt.status.toString());

        transaction.update(userRef, { balance: newBalance });
        setBalance(newBalance);

        const updatedProducts = await fetchProducts(); // Update products after purchase
        setProducts(updatedProducts);
      });
    } catch (error) {
      console.error('Purchase error:', error);
    }
  };

  const handleTransferHbar = async () => {
    try {
      const transferAmount = 1; // Transfer 1 hbar
      const userId = currentUser.uid;
      const userRef = db.collection('HederaUsers').doc(userId);

      await db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        const newBalance = userDoc.data().balance + 100; // Add 100 to the user's balance

        const transferTransaction = await new TransferTransaction()
          .addHbarTransfer(operatorAccountId, new Hbar(-transferAmount))
          .addHbarTransfer(userDoc.data().hederaAccountId, new Hbar(transferAmount))
          .setMaxTransactionFee(new Hbar(1))
          .execute(client);

        const receipt = await transferTransaction.getReceipt(client);
        console.log(receipt.status.toString());

        transaction.update(userRef, { balance: newBalance });
        setBalanceFromDb(newBalance); // Update balance from database

        const updatedProducts = await fetchProducts(); // Update products after transfer
        setProducts(updatedProducts);
      });
    } catch (error) {
      console.error('Transfer error:', error);
    }
  };

  if (loading) {
    return <p>Loading...</p>; // Render a loading indicator while data is fetched
  }

  return (
    <div>
      <h2>Shopping</h2>
      <button onClick={handleSignOut}>Sign Out</button>
      <p>Current User: {currentUser.email}</p>
      <p>Operator Balance: {operatorBalance} tinybars</p>
      <p>Current Balance: {balance} tinybars</p>
      <p>Balance from Database: {balanceFromDb}</p>
      <ul>
        {products.map((product, index) => (
          <li key={index}>
            <p>{product.name}</p>
            <p>Cost: {product.cost}</p>
            <button onClick={() => handlePurchase(product)}>Purchase</button>
          </li>
        ))}
      </ul>
      <button onClick={handleTransferHbar}>Transfer 1 Hbar and Add 100 to Balance</button>
    </div>
  );
};

export default Shopping;
