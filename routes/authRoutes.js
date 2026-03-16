import express from 'express';
import { Router } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import crypto from 'crypto';
import sendEmail from '../utils/emailService.js'
import rateLimit from 'express-rate-limit'; 

const router = Router();

// Rate limiting for forgot password attempts
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 requests per windowMs
  message: 'Too many password reset attempts. Please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Forgot Password - Request reset link
router.post('/forgot-password', forgotPasswordLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    // Don't reveal if user exists or not for security
    if (!user) {
      return res.status(200).json({ 
        success: true, 
        message: 'If an account exists with this email, you will receive a password reset link.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token and save to database
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Token expires in 1 hour
    user.resetPasswordExpire = Date.now() + 3600000; 

    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Email content
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You requested a password reset for your admin account.</p>
        <p>Click the button below to reset your password. This link is valid for 1 hour.</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Or copy and paste this link: ${resetUrl}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request - Admin Dashboard',
        html: message
      });

      res.status(200).json({ 
        success: true, 
        message: 'If an account exists with this email, you will receive a password reset link.' 
      });
    } catch (emailError) {
      // If email fails, clear the reset token
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      console.error('Email sending error:', emailError);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send reset email. Please try again later.' 
      });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred. Please try again later.' 
    });
  }
});

// Serve forgot password form (GET request)
router.get('/forgot-password-form', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Forgot Password</title>
            <style>
                body { font-family: Arial; padding: 20px; }
                input { padding: 8px; margin: 5px; width: 250px; }
                button { padding: 8px 15px; background: #4CAF50; color: white; border: none; cursor: pointer; }
                #message { margin-top: 10px; padding: 10px; }
            </style>
        </head>
        <body>
            <h2>Forgot Password</h2>
            <form id="forgotForm">
                <input type="email" id="email" placeholder="Enter your email" required>
                <button type="submit">Send Reset Link</button>
            </form>
            <div id="message"></div>

            <script>
                document.getElementById('forgotForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    
                    const email = document.getElementById('email').value;
                    const messageDiv = document.getElementById('message');
                    
                    try {
                        const response = await fetch('/api/auth/forgot-password', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ email })
                        });
                        
                        const data = await response.json();
                        messageDiv.style.color = data.success ? 'green' : 'red';
                        messageDiv.textContent = data.message;
                    } catch (error) {
                        messageDiv.style.color = 'red';
                        messageDiv.textContent = 'Error: ' + error.message;
                    }
                });
            </script>
        </body>
        </html>
    `);
});

// Reset Password
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    // Validation
    if (!password || !confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password and confirm password are required' 
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Passwords do not match' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters' 
      });
    }

    // Hash the token from params to compare with stored hash
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired reset token' 
      });
    }

    // Update password (make sure to hash it - implement your hashing logic)
    // If you're using bcrypt:
    // const salt = await bcrypt.genSalt(10);
    // user.password = await bcrypt.hash(password, salt);
    // IMPORTANT: Hash the password here directly

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Or if using plain text (not recommended):
    user.password = hashedPassword; // Implement your password hashing here

    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ 
      success: true, 
      message: 'Password reset successful. You can now login with your new password.',
      redirectTo: '/admin/login' // Optional: frontend can use this to redirect
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred. Please try again later.' 
    });
  }
});

export default router;