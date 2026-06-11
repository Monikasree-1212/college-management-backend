const mongoose = require('mongoose');
const dotenv   = require('dotenv');
dotenv.config();

const User = require('./models/User');

const ADMIN = {
  name:     'Surya Sekar',
  email:    'suryasekar626@gmail.com',
  password: 'Surya@123',
  role:     'admin',
  isActive: true,
};

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const existing = await User.findOne({ email: ADMIN.email });

  if (existing) {
    console.log(`\n⚠  Admin already exists: ${ADMIN.email}`);
    console.log('   No changes made.');
  } else {
    // Password is hashed automatically by the User model pre-save hook
    await User.create(ADMIN);
    console.log('\n✅ Admin account created successfully!');
    console.log(`   Email   : ${ADMIN.email}`);
    console.log(`   Password: ${ADMIN.password}`);
    console.log(`   Role    : ${ADMIN.role}`);
  }

  process.exit(0);
};

run().catch(err => { console.error('Error:', err.message); process.exit(1); });
