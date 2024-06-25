// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../firebase';

function Dashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalTransactions: 0, totalTokens: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersCollection = collection(firestore, 'User');
        const transactionsCollection = collection(firestore, 'transactions');
        const tokensCollection = collection(firestore, 'tokens');

        const usersSnapshot = await getDocs(usersCollection);
        const transactionsSnapshot = await getDocs(transactionsCollection);
        const tokensSnapshot = await getDocs(tokensCollection);

        const totalUsers = usersSnapshot.size;
        const totalTransactions = transactionsSnapshot.size;
        const totalTokens = tokensSnapshot.size;

        setStats({ totalUsers, totalTransactions, totalTokens });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Total Users: {stats.totalUsers}</p>
      <p>Total Transactions: {stats.totalTransactions}</p>
      <p>Total Tokens: {stats.totalTokens}</p>
    </div>
  );
}

export default Dashboard;
