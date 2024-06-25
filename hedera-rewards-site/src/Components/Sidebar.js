import React from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../firebase';

function Sidebar() {

  const user = auth.currentUser;


  return (
    <div className="sidebar">
      <h2>Menu</h2>
      <ul>
        <li><Link to="/products">Products</Link></li>
        <li><Link to="/dashboard">Dashboard</Link></li>

       {!user && (<>
           <li><Link to="/Signin">Sign In</Link></li>
           <li><Link to="/Signup">Sign Up</Link></li>
           </>
        )}

        {user && (<>
                  <li><Link to="/balance">Balance</Link></li>
                  <li><Link to="/transactions">Transactions</Link></li>

                 <li><Link to="/signout">Sign Out</Link></li></>
        )}
       
       
        
      </ul>
    </div>
  );
}

export default Sidebar;
