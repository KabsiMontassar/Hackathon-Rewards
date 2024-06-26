
import React, { useState, useEffect } from 'react';
import {
  Client,
  TransferTransaction,
  PrivateKey,
  Hbar,
  AccountBalanceQuery,
  AccountCreateTransaction
} from '@hashgraph/sdk';
import { Auth, db } from './firebase';
import {
  Container,
  Typography,
  Button,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Snackbar
} from '@mui/material';
import MuiAlert from '@mui/material/Alert'; // Import Alert component for Snackbar

const client = Client.forTestnet();

const pkey = "0x8da88d05b24618d4ccd8b004fdb207776261bdf6e21ec7a1dae30c78be0e2398";
const pId = '0.0.4474666';

const operatorPrivateKey = PrivateKey.fromStringECDSA(pkey);
client.setOperator(pId, operatorPrivateKey);

const App = () => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [userfromDb, setUserfromDb] = useState([]);
  const [operatorBalance, setOperatorBalance] = useState(0);
  const [UserBalance, setUserBalance] = useState(0);
  const [openPurchaseSnackbar, setOpenPurchaseSnackbar] = useState(false); // State for purchase popup
  const [openClaimSnackbar, setOpenClaimSnackbar] = useState(false); // State for claim popup

  const fetchOperatorBalance = async () => {
    try {
      if (!userfromDb || !userfromDb.hederaAccountId) {
        console.error('User data or Hedera account ID is not available.');
        return;
      }

      const operatorBalanceQuery = new AccountBalanceQuery()
        .setAccountId(pId);
      const operatorBalance = await operatorBalanceQuery.execute(client);

      const userBalanceQuery = new AccountBalanceQuery()
        .setAccountId(userfromDb.hederaAccountId);
      const userBalance = await userBalanceQuery.execute(client);

      setUserBalance(userBalance.hbars.toString());
      setOperatorBalance(operatorBalance.hbars.toString());
    } catch (error) {
      console.error('Error fetching operator balance:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const productsRef = await db.collection('Products').get();
      const productsData = productsRef.docs.map((doc) => doc.data());
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching Products:', error);
    }
  };

  useEffect(() => {
    Auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        db.collection('utilisateurs').doc(user.uid).get().then((doc) => {
          if (doc.exists) {
            setUserfromDb(doc.data());
            console.log("User data from db:", doc.data());
          } else {
            console.log('No such document!');
          }
        }).catch((error) => {
          console.log('Error getting document:', error);
        });

        fetchOperatorBalance();
        fetchProducts();
      }
    });
  }, [userfromDb.balance]);

  const signUp = async (email, password) => {
    try {
      await Auth.createUserWithEmailAndPassword(email, password);
      const userId = Auth.currentUser.uid;

      const newPrivateKey = PrivateKey.generate();
      const newAccountId = await createHederaAccount(newPrivateKey);

      const userData = {
        email: Auth.currentUser.email,
        balance: 0,
        hederaAccountId: newAccountId,
        privateKey: newPrivateKey.toString(),
      };

      await storeUserData(userId, userData);
    } catch (error) {
      console.error('Sign up error:', error);
    }
  };

  const createHederaAccount = async (privateKey) => {
    try {
      const response = await new AccountCreateTransaction()
        .setKey(privateKey.publicKey)
        .setInitialBalance(new Hbar(0))
        .execute(client);

      const receipt = await response.getReceipt(client);
      const newAccountId = receipt.accountId.toString();
      console.log('Account created on Hedera:', newAccountId);
      return newAccountId;
    } catch (error) {
      console.error('Hedera account creation error:', error);
      throw error;
    }
  };

  const storeUserData = async (userId, userData) => {
    try {
      await db.collection('utilisateurs').doc(userId).set(userData);
      console.log('User data stored in database:', userId, userData);
    } catch (error) {
      console.error('Error storing user data:', error);
      throw error;
    }
  };

  const signIn = async (email, password) => {
    try {
      await Auth.signInWithEmailAndPassword(email, password);
      setUser(Auth.currentUser);
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const signOut = async () => {
    try {
      await Auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const purchaseProduct = async (product) => {
    try {
      if (!user) {
        console.error('Please sign in to purchase products.');
        return;
      }

      const userId = user.uid;
      const userRef = db.collection('utilisateurs').doc(userId);
      await db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        const userPrivateKey = PrivateKey.fromString(userDoc.data().privateKey);

        const transferTransaction = new TransferTransaction()
          .addHbarTransfer(userDoc.data().hederaAccountId, new Hbar(-product.cost))
          .addHbarTransfer(pId, new Hbar(product.cost))
          .freezeWith(client);

        const userSignedTransaction = await transferTransaction.sign(userPrivateKey);
        const operatorSignedTransaction = await userSignedTransaction.sign(operatorPrivateKey);

        const txResponse = await operatorSignedTransaction.execute(client);
        const receipt = await txResponse.getReceipt(client);
        console.log(receipt.status.toString());

        fetchOperatorBalance();
        setOpenPurchaseSnackbar(true); // Open the purchase popup
      });
    } catch (error) {
      console.error('Purchase error:', error);
    }
  };

  const claimHbar = async () => {
    try {
      const transferTransaction = await new TransferTransaction()
        .addHbarTransfer(pId, new Hbar(-10))
        .addHbarTransfer(userfromDb.hederaAccountId, new Hbar(10))

      const txResponse = await transferTransaction.execute(client);
      const receipt = await txResponse.getReceipt(client);
      console.log('Transaction receipt status:', receipt.status.toString());

      fetchOperatorBalance();
      setOpenClaimSnackbar(true); // Open the claim popup
    } catch (error) {
      console.error('Add Hbar to operator error:', error);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenPurchaseSnackbar(false);
    setOpenClaimSnackbar(false);
  };

  return (
    <div className="App">
    <Container className='container' style={{ backgroundColor: '#F1DDDF', padding: '16px' }}>
      {user ? (
        <Paper  className='paper' elevation={3} style={{ backgroundColor: '#ffffff', padding: '16px', marginTop: '16px' }}>
          <Typography variant="h4" style={{ color: '#476930' }}>Greener Rewards Platform</Typography>
          {/* <Typography variant="body1" style={{ color: '#476930' }}>Operator Balance: {operatorBalance}</Typography> */}
          <Typography variant="body1" style={{ color: '#476930' }}>User Balance: {UserBalance}</Typography>
          <Typography variant="body1" style={{ color: '#476930' }}>Welcome, {userfromDb.email}!</Typography>
          {/* <Typography variant="body1" style={{ color: '#476930' }}>Your Hedera Account ID: {userfromDb.hederaAccountId}</Typography> */}
          <Button variant="contained" style={{ backgroundColor: '#8DAB21', color: '#FFFFFF', marginTop: '8px' }} onClick={signOut}>Sign Out</Button>
          <Button variant="contained" style={{ backgroundColor: '#476930', color: '#FFFFFF', marginLeft: '8px', marginTop: '8px' }} onClick={claimHbar}>Claim 10 hbar</Button>
          <ProductList products={products} purchaseProduct={purchaseProduct} />
          <Snackbar
            open={openPurchaseSnackbar}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
          >
            <MuiAlert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%', backgroundColor: '#8DAB21', color: '#FFFFFF' }}>
              Congratulations! Your purchase was successful.
            </MuiAlert>
          </Snackbar>
          <Snackbar
            open={openClaimSnackbar}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
          >
            <MuiAlert             onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%', backgroundColor: '#8DAB21', color: '#FFFFFF' }}>
              10 hbar claimed successfully.
            </MuiAlert>
          </Snackbar>
        </Paper>
      ) : (
        <Paper elevation={3} style={{ backgroundColor: '#ffffff', padding: '16px', marginTop: '16px' }}>
          <Typography variant="body1" style={{ color: '#476930' }}>Please sign in to access the platform.</Typography>
          <SignInForm signIn={signIn} />
          <Typography variant="body1" style={{ color: '#476930' }}>Don't have an account? Sign up below:</Typography>
          <SignUpForm signUp={signUp} />
        </Paper>
      )}
    </Container>
    </div>
  );
};

const SignInForm = ({ signIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    signIn(email, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        type="email"
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        type="password"
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Button type="submit" variant="contained" style={{ backgroundColor: '#8DAB21', color: '#FFFFFF' }} fullWidth>Sign In</Button>
    </form>
  );
};

const SignUpForm = ({ signUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    signUp(email, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        type="email"
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        type="password"
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Button type="submit" variant="contained" style={{ backgroundColor: '#8DAB21', color: '#FFFFFF' }} fullWidth>Sign Up</Button>
    </form>
  );
};

const ProductList = ({ products, purchaseProduct }) => {
  return (
    <Paper  elevation={3} style={{ backgroundColor: '#EEEDEB', padding: '16px', marginTop: '16px' }}>
      <Typography variant="h5" style={{ color: '#476930' }}>Available Products</Typography>
      <List>
        {products.map((product, index) => (
          <div key={index}>
            <ListItem>
              <ListItemText primary={product.name} secondary={`Cost: ${product.cost} tokens`} style={{ color: '#476930' }} />
              <Button variant="contained" style={{ backgroundColor: '#476930', color: '#FFFFFF' }} onClick={() => purchaseProduct(product)}>Purchase</Button>
            </ListItem>
            {index < products.length - 1 && <Divider />}
          </div>
        ))}
      </List>
    </Paper>
  );
};

export default App;
