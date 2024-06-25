import React, { useState } from 'react';
import { BrowserRouter as Router, Route  , Routes} from 'react-router-dom'; // eslint-disable-line
import { auth } from './firebase';
import Sidebar from './Components/Sidebar';
import SignIn from './Components/SignIn';
import SignUp from './Components/SignUp';
import SignOut from './Components/SignOut';
import Balance from './Components/Balance';
import ProductList from './Components/ProductList';
import TransactionHistory from './Components/TransactionHistory';
import Dashboard from './Components/Dashboard';
import './firebase'; // Make sure firebase.js is imported at the beginning of your application


function App() {
  const [user, setUser] = useState(null);

  auth.onAuthStateChanged((currentUser) => {
    setUser(currentUser);
  });

  return (
   
      <div className="App">
        {user && <h1>Welcome, {user.email}</h1>}
        <Sidebar />
        <div className="content">
       <Routes>
           
           <Route exact path="/balance" element={<Balance/>} />
           <Route exact path="/products" element={<ProductList/>} />
           <Route exact path="/transactions" element={<TransactionHistory/>} />
         <Route exact path="/dashboard" element={<Dashboard/>} />
      
         <Route exact path="/signout" element={<SignOut/>} />
     
          <Route exact path="/signin" element={<SignIn/>} />
          <Route exact path="/signup" element={<SignUp/>} />
       

</Routes>
          
           
        </div>
      </div>
  
  );
}

export default App;
