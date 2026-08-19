const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // creates a unique index - enforced at the DB level, not just app level
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // never return password field by default on .find()/.findOne()
    },
    // Role-based access: "customer" (default) can only see their own shipments,
    // "admin" can see/update all shipments. Kept as a simple enum on User rather
    // than a separate Roles collection since we only need two fixed roles for now -
    // a full RBAC system with dynamic permissions would be over-engineering here.
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
  },
  { timestamps: true } // adds createdAt / updatedAt automatically
);

// Hash the password before saving, but ONLY if it was modified.
// Without the isModified check, updating unrelated fields (like `name`)
// would re-hash an already-hashed password and break login.
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare a plaintext login attempt against the stored hash.
// Lives on the model so controllers never touch bcrypt directly - keeps the
// hashing implementation detail encapsulated in one place.
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
