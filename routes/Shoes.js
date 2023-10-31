const express = require('express');
const { ObjectId } = require('mongodb');
const multer = require('multer');
const path = require('path');

const router = express.Router();

const storage = multer.diskStorage({
  destination: './uploads/shoes',
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed.'), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = (db) => {
  const collectionName = process.env.CL_PRODUCTS;

  router.get('/api/shoes', async (req, res) => {
    try {
      const collection = db.collection(collectionName);
      const data = await collection.find().toArray();
      res.json(data);
    } catch (error) {
      console.error('Error retrieving data from Products:', error);
      res.status(500).json({ error: 'Failed to retrieve data from Products' });
    }
  });

  router.get('/api/shoes/catogery', async (req, res) => {
    try {
      const collection = db.collection('shoes_catogery');
      const data = await collection.find().toArray();
      res.json(data);
    } catch (error) {
      console.error('Error retrieving data from Products:', error);
      res.status(500).json({ error: 'Failed to retrieve data from Products' });
    }
  });

  router.post('/api/shoes', upload.single('image'), async (req, res) => {
    try {
      const { category, gender, type, brand, title, description, price, size } =
        req.body;
      const image = req.file.path;

      const collection = db.collection('shoes');

      const product = {
        category,
        gender,
        type,
        brand,
        title,
        description,
        price,
        size,
        image,
      };
      //console.log('test');
      await collection.insertOne(product);
      res.status(201).json(product);
    } catch (error) {
      console.error('Error adding product:', error);
      res.status(500).json({ error: 'Failed to add product' });
    }
  });

  router.post('/api/shoes_category', async (req, res) => {
    try {
      const { category } = req.body;
      const collection = db.collection('shoes_category');
      const c = {
        category,
      };
      console.log(c);
      await collection.insertOne(c);
      res.status(201).json(c);
    } catch (error) {
      console.error('Error adding product:', error);
      res.status(500).json({ error: 'Failed to add product' });
    }
  });

  router.put(
    '/api/products/:productId',
    upload.single('image'),
    async (req, res) => {
      try {
        const productId = req.params.productId;
        const {
          name,
          mainproduct,
          category,
          categoryext,
          price,
          brand,
          rating,
          description,
        } = req.body;
        const image = req.file ? req.file.path : undefined;

        const collection = db.collection(collectionName);

        const product = await collection.findOne({
          _id: new ObjectId(productId),
        });
        if (!product) {
          return res.status(404).json({ error: 'Product not found' });
        }

        const updatedProduct = {
          name,
          mainproduct,
          category,
          categoryext,
          price,
          brand,
          rating,
          description,
        };

        if (image) {
          updatedProduct.image = image;
        }

        await collection.updateOne(
          { _id: new ObjectId(productId) },
          { $set: updatedProduct }
        );

        res.json(updatedProduct);
      } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
      }
    }
  );

  router.delete('/api/products/:productId', async (req, res) => {
    try {
      const productId = req.params.productId;

      const collection = db.collection(collectionName);

      const product = await collection.findOne({
        _id: new ObjectId(productId),
      });
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      await collection.deleteOne({ _id: new ObjectId(productId) });
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ error: 'Failed to delete product' });
    }
  });

  return router;
};
