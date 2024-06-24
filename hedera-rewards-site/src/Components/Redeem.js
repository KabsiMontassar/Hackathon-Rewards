// src/components/Redeem.js
import React, { useState } from 'react';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { auth, firestore } from '../firebase';

function Redeem() {
  const [amount, setAmount] = useState('');
  const [reward, setReward] = useState('');
  const [status, setStatus] = useState('');
  const user = auth.currentUser;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user) {
      try {
        const userDoc = doc(firestore, 'users', user.uid);
        await updateDoc(userDoc, {
          balance: increment(-amount)
        });
        setStatus(`Redeemed ${amount} tokens for ${reward}`);
      } catch (error) {
        setStatus(`Error: ${error.message}`);
      }
    }
  };

  return (
    <div>
      <h2>Redeem Tokens</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Amount to Redeem:
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </label>
        </div>
        <div>
          <label>
            Reward:
            <input type="text" value={reward} onChange={(e) => setReward(e.target.value)} required />
          </label>
        </div>
        <button type="submit">Redeem</button>
      </form>
      <p>{status}</p>
    </div>
  );
}

export default Redeem;
