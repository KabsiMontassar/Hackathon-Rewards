import { db } from '../firebase';

export const useFirestore = () => {
  const fetchProducts = async () => {
    const productsRef = await db.collection('Products').get();
    return productsRef.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  };

  const fetchUserBalance = async (userId) => {
    const userRef = await db.collection('User').doc(userId).get();
    return userRef.data().balance;
  };

  const updateUserBalance = async (userId, balance) => {
    await db.collection('User').doc(userId).update({ balance });
  };

  const storeTransactionHistory = async (userId, transaction) => {
    await db.collection('User').doc(userId).collection('transactions').add(transaction);
  };

  return { fetchProducts, fetchUserBalance, updateUserBalance, storeTransactionHistory };
};
