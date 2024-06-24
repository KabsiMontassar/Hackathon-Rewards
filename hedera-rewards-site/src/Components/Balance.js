// src/components/Balance.js
import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebase';

function Balance() {
  const [balance, setBalance] = useState(null);
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      const fetchBalance = async () => {
        const userDoc = doc(firestore, 'users', user.uid);
        const docSnapshot = await getDoc(userDoc);
        if (docSnapshot.exists()) {
          setBalance(docSnapshot.data().balance);
        }
      };
      fetchBalance();
    }
  }, [user]);

  return (
    <div>
      <h2>Your Balance</h2>
      <p>{balance !== null ? `${balance} tokens` : "Loading..."}</p>
    </div>
  );
}

export default Balance;
