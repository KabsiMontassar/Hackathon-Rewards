import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';

const TransactionHistory = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      const transactionsRef = await db.collection('utilisateurs').doc(user.uid).collection('transactions').get();
      const transactionsData = transactionsRef.docs.map((doc) => doc.data());
      setTransactions(transactionsData);
    };

    if (user) {
      fetchTransactions();
    }
  }, [user]);

  return (
    <div>
      <h2>Transaction History</h2>
      <ul>
        {transactions.map((transaction, index) => (
          <li key={index}>
            <p>Product: {transaction.productName}</p>
            <p>Cost: {transaction.cost} tokens</p>
            <p>Date: {new Date(transaction.date.seconds * 1000).toLocaleDateString()}</p>
            <p>HBAR Spent: {transaction.hbarsSpent}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TransactionHistory;
