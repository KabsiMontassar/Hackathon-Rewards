// src/components/TransactionHistory.js
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../firebase';

function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const transactionsCollection = collection(firestore, 'transactions');
        const transactionsSnapshot = await getDocs(transactionsCollection);
        const transactionsData = transactionsSnapshot.docs.map(doc => doc.data());
        setTransactions(transactionsData);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <div>
      <h2>Transaction History</h2>
      <ul>
        {transactions.map((transaction, index) => (
          <li key={index}>{transaction.id} tokens</li>
        ))}
      </ul>
    </div>
  );
}

export default TransactionHistory;
