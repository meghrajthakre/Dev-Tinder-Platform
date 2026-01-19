const express = require("express");
const nodemailer = require("nodemailer");
const contactRouter = express.Router();

// Email configuration - store these in environment variables
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // your email
        pass: process.env.EMAIL_PASS  // your app password
    }
});

// Verify transporter configuration
transporter.verify((error, success) => {
    if (error) {
        console.error("Email transporter error:", error);
    } else {
        console.log( success, "Email server is ready to send messages");
    }
});

contactRouter.post("/contact", async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Validation
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "Please provide name, email, and message"
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address"
            });
        }

        // Sanitize inputs
        const sanitizedName = name.trim();
        const sanitizedEmail = email.trim().toLowerCase();
        const sanitizedMessage = message.trim();

        // Email options - email to you (admin)
        const mailOptionsToAdmin = {
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
            subject: `New Contact Form Submission from ${sanitizedName}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
                        <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
                            New Contact Form Submission
                        </h2>
                        <div style="margin: 20px 0;">
                            <p style="margin: 10px 0;">
                                <strong style="color: #555;">Name:</strong> 
                                <span style="color: #333;">${sanitizedName}</span>
                            </p>
                            <p style="margin: 10px 0;">
                                <strong style="color: #555;">Email:</strong> 
                                <a href="mailto:${sanitizedEmail}" style="color: #4CAF50;">${sanitizedEmail}</a>
                            </p>
                        </div>
                        <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0;">
                            <p style="margin: 0; color: #555;"><strong>Message:</strong></p>
                            <p style="margin: 10px 0 0 0; color: #333; line-height: 1.6;">
                                ${sanitizedMessage}
                            </p>
                        </div>
                        <p style="color: #888; font-size: 12px; margin-top: 20px;">
                            This email was sent from your DevStinder contact form.
                        </p>
                    </div>
                </div>
            `,
            text: `
                New Contact Form Submission
                
                Name: ${sanitizedName}
                Email: ${sanitizedEmail}
                
                Message:
                ${sanitizedMessage}
            `
        };

        // Auto-reply email to user
        const mailOptionsToUser = {
            from: process.env.EMAIL_USER,
            to: sanitizedEmail,
            subject: "Thank you for contacting DevsTinder",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
                        <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
                            Thank You for Reaching Out!
                        </h2>
                        <p style="color: #555; line-height: 1.6;">
                            Hi <strong>${sanitizedName}</strong>,
                        </p>
                        <p style="color: #555; line-height: 1.6;">
                            Thank you for contacting DevStinder! We've received your message and will get back to you as soon as possible.
                        </p>
                        <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0;">
                            <p style="margin: 0; color: #555;"><strong>Your message:</strong></p>
                            <p style="margin: 10px 0 0 0; color: #333; line-height: 1.6;">
                                ${sanitizedMessage}
                            </p>
                        </div>
                        <p style="color: #555; line-height: 1.6;">
                            Best regards,<br>
                            <strong>The DevStinder Team</strong>
                        </p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="color: #888; font-size: 12px;">
                            If you have any urgent questions, feel free to reply to this email.
                        </p>
                    </div>
                </div>
            `,
            text: `
                Hi ${sanitizedName},
                
                Thank you for contacting DevStinder! We've received your message and will get back to you as soon as possible.
                
                Your message:
                ${sanitizedMessage}
                
                Best regards,
                The DevStinder Team
            `
        };

        // Send both emails
        await transporter.sendMail(mailOptionsToAdmin);
        await transporter.sendMail(mailOptionsToUser);

        // Success response
        return res.status(200).json({
            success: true,
            message: "Message sent successfully! Check your email for confirmation."
        });

    } catch (error) {
        console.error("Contact form error:", error);
        
        return res.status(500).json({
            success: false,
            message: "Failed to send message. Please try again later."
        });
    }
});

module.exports = contactRouter;