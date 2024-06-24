import React from 'react';
import { Route, Routes } from 'react-router-dom';
import SignUp from './Components/SignUp';
import SignIn from './Components/SignIn';
import SignOut from './Components/SignOut';
import Balance from './Components/Balance';
import Redeem from './Components/Redeem';
import PrivateRoute from './Components/PrivateRoute';
import Home from './Components/Home';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import './App.css';

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Hedera Rewards System</h1>
        {user && <SignOut />}
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/balance" element={<PrivateRoute><Balance /></PrivateRoute>} />
        <Route path="/redeem" element={<PrivateRoute><Redeem /></PrivateRoute>} />
      </Routes>
    </div>
  );
}

export default App;
