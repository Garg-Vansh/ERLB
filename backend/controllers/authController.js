const User = require("C:/Users/vansh/OneDrive/Desktop/erlb/code/website/backend/models/user.js")
const bcrypt = require("bcryptjs")

// Register user
const registerUser = async (req, res) => {
    try {

        const { name, email, password } = req.body

        // check if user already exists
        const existingUser = await User.findOne({ email })

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" })
        }

        // hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        })

        res.status(201).json({
            message: "User registered successfully",
            user
        })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}



//login user

const jwt = require("jsonwebtoken");

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Check if both fields are provided
  if (!email || !password) {
    return res.status(400).json({ message: "Please provide email and password" });
  }

  try {
    // Find user in DB
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
module.exports = { registerUser, loginUser };
