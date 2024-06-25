import React, { useState } from 'react';
import { Auth, db } from './firebase'; // Assuming firebase is correctly imported and initialized
import Shopping from './Shopping'; // Import your shopping component
import { GeoPoint } from "firebase/firestore";


const App = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [redirectToShopping, setRedirectToShopping] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null); // State to store the current user

  const toggleForm = () => {
    setIsSignIn(!isSignIn);
    setError(''); // Clear any previous errors
  };

  const handleSignIn = async () => {
    try {
      await Auth.signInWithEmailAndPassword(email, password);
      const user = Auth.currentUser;
      setCurrentUser(user); // Set the current user after successful sign-in
      setRedirectToShopping(true);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSignUp = async () => {
    try {
      await Auth.createUserWithEmailAndPassword(email, password);

      // Generate a Hedera account ID
      const hederaAccountId = '0.0.' + Math.floor(Math.random() * 1000000);

      // Create a user object and add it to the User collection
      const userId = Auth.currentUser.uid;
      const userData = {
        email: email,
        displayName: '', // Add other fields as needed
        phoneNumber: '',
        position: new GeoPoint(50, 50),
        photoUrl: '',
        createdTime: new Date(),
        fill: '',
        invitation: '',
        mission: '',
        password: password,
        score: 0,
        uid: userId,
        balance: 0,
        hederaAccountId: hederaAccountId // Store the generated Hedera account ID
      };

      // Add user data to Firestore
      await db.collection('HederaUsers').doc(userId).set(userData);

      // Create a Hedera account

      
     

      // Now, you can associate the Hedera account ID with the user in Firestore or any other relevant database

      setCurrentUser(Auth.currentUser); // Set the current user after successful sign-up
      setRedirectToShopping(true);
    } catch (error) {
      setError(error.message);
    }
  };
  const handleSignOut = async () => {
    try {
      await Auth.signOut();
      setCurrentUser(null); // Clear the current user
      setRedirectToShopping(false); // Redirect back to the sign-in/sign-up form
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };
  return (
    <div>
      <h1>Hedera Rewards Site</h1>
      {redirectToShopping ? (
        <Shopping currentUser={currentUser} handleSignOut={handleSignOut} /> 
      ) : (
        <div>
          {isSignIn ? (
            <SignInForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              handleSignIn={handleSignIn}
              toggleForm={toggleForm}
              error={error}
            />
          ) : (
            <SignUpForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              handleSignUp={handleSignUp}
              toggleForm={toggleForm}
              error={error}
            />
          )}
        </div>
      )}
    </div>
  );
};

const SignInForm = ({ email, setEmail, password, setPassword, handleSignIn, toggleForm, error }) => {
  return (
    <div>
      <h2>Sign In</h2>
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
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={handleSignIn}>Sign In</button>
      <p>
        Don't have an account? <span onClick={toggleForm}>Sign Up</span>
      </p>
    </div>
  );
};

const SignUpForm = ({ email, setEmail, password, setPassword, handleSignUp, toggleForm, error }) => {
  return (
    <div>
      <h2>Sign Up</h2>
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
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={handleSignUp}>Sign Up</button>
      <p>
        Already have an account? <span onClick={toggleForm}>Sign In</span>
      </p>
    </div>
  );
};

export default App;
