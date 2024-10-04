const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const session = require('express-session');

const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create a MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Moon$$o001',
  database: 'rshop'
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
  secret: 'your_secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

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
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  const name = productName; // Ensure these match your database column names
  const price = parseFloat(productPrice);
  const sizes = productSizes; // This should be a string of comma-separated values

  console.log('Adding product:', { name, price, image, sizes });

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
  const image = req.file ? `/uploads/${req.file.filename}` : null;

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

// Start the server
const port = 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
