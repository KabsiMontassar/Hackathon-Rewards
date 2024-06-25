import React, { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { auth } from '../firebase';

function Balance() {
  const [balance, setBalance] = useState(null);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchBalance = async () => {
      if (user) {
        const db = getFirestore();
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        const userData = userDocSnap.data();
        if (userData) {
          setBalance(userData.balance);
        }
      }
    };

    fetchBalance();
  }, [user]);

  return (
    <div>
      <h2>Your Balance</h2>
      <p>{balance !== null ? `${balance} tokens` : 'Loading...'}</p>
    </div>
  );
}

export default Balance;
