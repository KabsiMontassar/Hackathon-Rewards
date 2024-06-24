// src/components/Home.js
import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <h2>Welcome to the Hedera Rewards System</h2>
      <p>
        <Link to="/signin">Sign In</Link> or <Link to="/signup">Sign Up</Link>
      </p>
    </div>
  );
}

export default Home;
