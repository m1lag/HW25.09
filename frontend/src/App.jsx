import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "_name", "type": "string" },
      { "internalType": "string", "name": "_description", "type": "string" },
      { "internalType": "uint256", "name": "_price", "type": "uint256" },
      { "internalType": "string", "name": "_imageUrl", "type": "string" }
    ],
    "name": "createProduct",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getProducts",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "name", "type": "string" },
          { "internalType": "string", "name": "description", "type": "string" },
          { "internalType": "uint256", "name": "price", "type": "uint2256" },
          { "internalType": "address", "name": "creator", "type": "address" },
          { "internalType": "uint256", "name": "createdAt", "type": "uint256" },
          { "internalType": "string", "name": "imageUrl", "type": "string" }
        ],
        "internalType": "struct ProductStore.Product[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

function App() {
  const [account, setAccount] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        fetchProducts();
      } catch (error) {
        console.error(error);
      }
    } else {
      alert("Встанови MetaMask!");
    }
  };

  const fetchProducts = async () => {
    if (!window.ethereum) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const data = await contract.getProducts();
      setProducts(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!window.ethereum || !account) {
      alert("Спочатку підключи гаманець!");
      return;
    }

    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const parsedPrice = ethers.parseEther(price);

      const tx = await contract.createProduct(name, description, parsedPrice, imageUrl);
      await tx.wait();
      
      setName("");
      setDescription("");
      setPrice("");
      setImageUrl("");
      fetchProducts();
      alert("Продукт успішно додано в блокчейн!");
    } catch (error) {
      console.error(error);
      alert("Сталася помилка при створенні продукту.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            fetchProducts();
          }
        });
    }
  }, []);

  return (
    <div style={{ padding: '30px', fontFamily: 'Segoe UI, Roboto, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#333' }}>Фінансовий DApp: Магазин Продуктів</h1>
      
      <div style={{ marginBottom: '30px' }}>
        {account ? (
          <div style={{ background: '#e2f0d9', padding: '10px 15px', borderRadius: '5px', display: 'inline-block', color: '#000' }}>
            <strong>Активний акаунт:</strong> <span style={{ fontFamily: 'monospace' }}>{account}</span>
          </div>
        ) : (
          <button onClick={connectWallet} style={{ padding: '12px 24px', fontSize: '16px', background: '#f58220', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            Підключити MetaMask
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '320px', background: '#f9f9f9', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', color: '#000' }}>
          <h3 style={{ marginTop: 0 }}>Додати новий продукт</h3>
          <form onSubmit={handleCreateProduct}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontWeight: '600' }}>Назва продукту:</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontWeight: '600' }}>Опис:</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box', height: '80px' }} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontWeight: '600' }}>Ціна (в ETH):</label>
              <input type="number" step="0.0001" value={price} onChange={(e) => setPrice(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: '600' }}>URL-картинка:</label>
              <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }} />
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#0056b3', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}>
              {loading ? "Надсилання у блокчейн..." : "Створити продукт"}
            </button>
          </form>
        </div>

        <div style={{ flex: '2', minWidth: '600px', color: '#000' }}>
          <h3>Збережені продукти у смарт-контракті</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <thead>
              <tr style={{ background: '#0056b3', color: '#fff', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>Назва</th>
                <th style={{ padding: '12px' }}>Опис</th>
                <th style={{ padding: '12px' }}>Ціна</th>
                <th style={{ padding: '12px' }}>Адреса Акаунта</th>
                <th style={{ padding: '12px' }}>Дата Створення</th>
                <th style={{ padding: '12px' }}>Картинка</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                    Продуктів не виявлено. Підключіть гаманець або додайте перший продукт.
                  </td>
                </tr>
              ) : (
                products.map((product, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '12px', fontWeight: '600' }}>{product.name}</td>
                    <td style={{ padding: '12px', color: '#555' }}>{product.description}</td>
                    <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>{ethers.formatEther(product.price)} ETH</td>
                    <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '11px', color: '#666' }}>{product.creator}</td>
                    <td style={{ padding: '12px', fontSize: '13px' }}>{new Date(Number(product.createdAt) * 1000).toLocaleString()}</td>
                    <td style={{ padding: '12px' }}>
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '4px' }} 
                        onError={(e) => { e.target.src = 'https://placeholder.com'; }}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;