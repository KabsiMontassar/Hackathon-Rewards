import React from 'react';

const ProductList = ({ products, purchaseProduct }) => {
  return (
    <div>
      <h2>Available Products</h2>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            <p>{product.name}</p>
            <p>Cost: {product.cost} tokens</p>
            <button onClick={() => purchaseProduct(product)}>Purchase</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductList;
