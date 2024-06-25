import React, { useState } from 'react';
import { Auth } from '../../firebase';
import { createHederaAccount } from '../../services/hederaService';
import { db } from '../../firebase';

const SignUpForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await Auth.createUserWithEmailAndPassword(email, password);
      const userId = Auth.currentUser.uid;
      const hederaAccount = await createHederaAccount();
      const userData = {
        email: Auth.currentUser.email,
        balance: 0,
        hederaAccountId: hederaAccount.newAccountId,
      };
      await storeUserData(userId, userData);
    } catch (error) {
      console.error('Sign up error:', error);
    }
  };

  const storeUserData = async (userId, userData) => {
    try {
      await db.collection('User').doc(userId).set(userData);
    } catch (error) {
      console.error('Error storing user data:', error);
    }
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

export default SignUpForm;
