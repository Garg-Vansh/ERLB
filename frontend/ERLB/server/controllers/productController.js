import asyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';
import { writeAuditLog } from '../middleware/auditMiddleware.js';

const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 12;
  const page = Number(req.query.pageNumber) || 1;

  const keyword = req.query.keyword
    ? { name: { $regex: req.query.keyword, $options: 'i' } }
    : {};

  const category = req.query.category ? { category: req.query.category } : {};

  const filter = { ...keyword, ...category };

  let sort = '-createdAt';
  if (req.query.sort === 'priceAsc') sort = 'price';
  if (req.query.sort === 'priceDesc') sort = '-price';
  if (req.query.sort === 'rating') sort = '-rating';

  const count = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .sort(sort)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ products, page, pages: Math.ceil(count / pageSize), total: count });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json(product);
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create({
    name: req.body.name || 'Sample Product',
    slug: (req.body.name || `sample-product-${Date.now()}`).toLowerCase().replace(/\s+/g, '-'),
    price: req.body.price ?? 199,
    user: req.user._id,
    image:
      req.body.image ||
      'https://images.unsplash.com/photo-1579722821273-0f6c4f95fbc2?auto=format&fit=crop&w=800&q=80',
    brand: req.body.brand || 'ERLB',
    category: req.body.category || 'Millet Bites',
    countInStock: req.body.countInStock ?? 20,
    numReviews: 0,
    description: req.body.description || 'Healthy clean-label snack by ERLB',
    nutritionHighlights: req.body.nutritionHighlights || ['No preservatives', 'Millet-based'],
    weight: req.body.weight || '150g'
  });

  await writeAuditLog({
    req,
    action: 'PRODUCT_CREATED',
    targetType: 'Product',
    targetId: product._id.toString(),
    details: { name: product.name }
  });

  res.status(201).json(product);
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const fields = [
    'name',
    'price',
    'description',
    'image',
    'category',
    'countInStock',
    'weight',
    'nutritionHighlights',
    'brand'
  ];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      product[field] = req.body[field];
    }
  });

  if (req.body.name) {
    product.slug = req.body.name.toLowerCase().replace(/\s+/g, '-');
  }

  const updatedProduct = await product.save();

  await writeAuditLog({
    req,
    action: 'PRODUCT_UPDATED',
    targetType: 'Product',
    targetId: product._id.toString(),
    details: { changed: Object.keys(req.body) }
  });

  res.json(updatedProduct);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  await product.deleteOne();

  await writeAuditLog({
    req,
    action: 'PRODUCT_DELETED',
    targetType: 'Product',
    targetId: product._id.toString(),
    details: { name: product.name }
  });

  res.json({ message: 'Product removed' });
});

const getProductCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category');
  res.json(categories);
});

export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductCategories
};
