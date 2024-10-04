const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const session = require('express-session');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure Cloudinary
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dqdusz5ci', 
  api_key: process.env.CLOUDINARY_API_KEY || '668465652653965', 
  api_secret: process.env.CLOUDINARY_API_SECRET || '<LpF7D-Ct88blCFd6cctH5P2m-sY>' // Replace with your Cloudinary API secret
});

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

const upload = multer({ storage: storage });

// Create a MySQL connection using JawsDB URL
const connection = mysql.createConnection(process.env.JAWSDB_URL || {
  host: 'localhost',
  user: 'root',
  password: 'Moon$$o001',
  database: 'rshop',
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Fetch all products
app.get('/products', (req, res) => {
  connection.query('SELECT * FROM produits', (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error retrieving products', error: err });
    }
    res.json(results);
  });
});

// Add a new product
app.post('/products', upload.single('productImage'), (req, res) => {
  const { productName, productPrice, productSizes } = req.body;
  const image = req.file ? req.file.path : null;

  const name = productName;
  const price = parseFloat(productPrice);
  const sizes = productSizes;

  connection.query(
    'INSERT INTO produits (nom, prix, image, tailles) VALUES (?, ?, ?, ?)',
    [name, price, image, sizes],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error adding product', error: err });
      }
      res.json({ message: 'Product added successfully', productId: result.insertId });
    }
  );
});

// Update a product
app.put('/products/:id', upload.single('productImage'), (req, res) => {
  const id = req.params.id;
  const { productName, productPrice, productSizes } = req.body;
  const image = req.file ? req.file.path : null;

  const name = productName;
  const price = parseFloat(productPrice);
  const sizes = productSizes;

  const imageQuery = image ? `, image = ?` : '';
  const queryParams = image ? [name, price, image, sizes, id] : [name, price, sizes, id];

  connection.query(
    `UPDATE produits SET nom = ?, prix = ?${imageQuery}, tailles = ? WHERE id = ?`,
    queryParams,
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error updating product');
      }
      res.send('Product updated successfully');
    }
  );
});

// Delete a product
app.delete('/products/:id', (req, res) => {
  const { id } = req.params;

  connection.query('DELETE FROM produits WHERE id = ?', [id], (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error deleting product', error: err });
    }
    res.json({ message: 'Product deleted' });
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));

