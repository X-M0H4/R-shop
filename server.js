import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Créer une instance d'Express
const app = express();

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Configuration de la connexion MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Utilisation de l'instance app pour définir des routes
app.get('/products', (req, res) => {
  connection.query('SELECT * FROM produits', (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error retrieving products', error: err });
    }
    res.json(results);
  });
});
app.post('/products', upload.single('productImage'), (req, res) => {
  const { productName, productPrice, productSizes } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  const name = productName;
  const price = parseFloat(productPrice);
  const sizes = productSizes;

  if (isNaN(price)) {
    return res.status(400).json({ message: 'Invalid price value' });
  }

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

app.put('/products/:id', (req, res) => {
  const { id } = req.params;
  const { nom, prix, tailles } = req.body;

  const price = parseFloat(prix);
  if (isNaN(price)) {
    return res.status(400).json({ message: 'Invalid price value' });
  }

  const query = 'UPDATE produits SET nom = ?, prix = ?, tailles = ? WHERE id = ?';
  const values = [nom, price, tailles, id];

  connection.query(query, values, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error updating product', error: err });
    }
    res.json({ message: 'Product updated successfully', nom, prix: price, tailles });
  });
});

app.delete('/products/:id', (req, res) => {
  const { id } = req.params;

  connection.query('DELETE FROM produits WHERE id = ?', [id], (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error deleting product', error: err });
    }
    res.json({ message: 'Product deleted' });
  });
});

const port = 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
