import crypto from 'crypto';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import nodemailer from 'nodemailer';

// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Save to database
    user.resetToken = hashedToken;
    user.resetTokenExpire = Date.now() + 3600000; // 1 hour
    await user.save();

    // Create reset link
    const resetUrl = `http://localhost:5000/reset-password/${resetToken}`;

    // Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your-email@gmail.com',
        pass: 'your-app-password' // Use App Password, not regular password
      }
    });

    const mailOptions = {
      from: 'your-email@gmail.com',
      to: user.email,
      subject: 'Password Reset',
      html: `
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>Link expires in 1 hour.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    
    res.json({ message: 'Reset link sent to email' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// RESET PASSWORD

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, "reset-secret-key");

    const hash = await bcrypt.hash(password, 10);

    await User.findByIdAndUpdate(decoded.id, {
      password: hash
    });

    res.send("Password updated successfully");
  } catch (err) {
    res.status(400).send("Invalid or expired token");
  }
};