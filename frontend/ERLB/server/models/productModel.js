import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    brand: { type: String, default: 'ERLB' },
    category: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    countInStock: { type: Number, required: true, default: 0 },
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    nutritionHighlights: [{ type: String }],
    weight: { type: String, default: '150g' }
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);

export default Product;
