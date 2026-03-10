import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import connectDB from './config/db.js';
import Product from './models/productModel.js';
import User from './models/userModel.js';
import Order from './models/orderModel.js';
import users from './data/users.js';
import products from './data/products.js';

dotenv.config();
connectDB();

const importData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    const secureUsers = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10)
      }))
    );

    const createdUsers = await User.insertMany(secureUsers);
    const adminUser = createdUsers[0]._id;

    const sampleProducts = products.map((product) => ({
      ...product,
      user: adminUser
    }));

    await Product.insertMany(sampleProducts);

    console.log('Data Imported');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log('Data Destroyed');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
