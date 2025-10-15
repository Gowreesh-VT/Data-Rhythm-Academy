const {onRequest} = require("firebase-functions/v2/https");
const {logger} = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const cors = require("cors")({origin: true});

admin.initializeApp();

// Configure your email service
// For Gmail: Use App Password (not regular password)
const transporter = nodemailer.createTransporter({
  service: "gmail",
  auth: {
    user: "your-email@gmail.com", // Replace with your Gmail
    pass: "your-app-password", // Replace with Gmail App Password
  },
});

exports.sendContactEmail = onRequest({cors: true}, async (req, res) => {
  return cors(req, res, async () => {
    try {
      // Only allow POST requests
      if (req.method !== "POST") {
        return res.status(405).json({error: "Method not allowed"});
      }

      const {name, email, subject, message} = req.body;

      // Validate required fields
      if (!name || !email || !subject || !message) {
        return res.status(400).json({error: "All fields are required"});
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({error: "Invalid email format"});
      }

      // Store the message in Firestore
      await admin.firestore().collection("contact_messages").add({
        name,
        email,
        subject,
        message,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: "new",
      });

      // Send notification email to admin
      const adminMailOptions = {
        from: `"Data Rhythm Academy" <your-email@gmail.com>`,
        to: "your-email@gmail.com", // Replace with your admin email
        subject: `New Contact Form Submission: ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">New Contact Form Submission</h2>
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Subject:</strong> ${subject}</p>
            </div>
            <div style="background: #ffffff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h3 style="color: #374151; margin-top: 0;">Message:</h3>
              <p style="line-height: 1.6; color: #4b5563;">${message}</p>
            </div>
            <div style="margin-top: 20px; padding: 15px; background: #dbeafe; border-radius: 8px;">
              <p style="margin: 0; color: #1e40af;"><strong>Reply to:</strong> ${email}</p>
            </div>
          </div>
        `,
      };

      // Send auto-reply email to user
      const autoReplyMailOptions = {
        from: `"Data Rhythm Academy" <your-email@gmail.com>`,
        to: email,
        subject: "Thank you for contacting Data Rhythm Academy!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); color: white; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 28px;">Data Rhythm Academy</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Your Learning Journey Starts Here</p>
            </div>
            
            <div style="padding: 30px; background: #ffffff; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
              <h2 style="color: #1f2937; margin-top: 0;">Hi ${name}!</h2>
              
              <p style="color: #4b5563; line-height: 1.6;">
                Thank you for reaching out to us! We've received your message and our team will get back to you within <strong>24 hours</strong>.
              </p>
              
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                <h3 style="color: #374151; margin-top: 0; margin-bottom: 10px;">Your Message Summary:</h3>
                <p style="margin: 5px 0; color: #6b7280;"><strong>Subject:</strong> ${subject}</p>
                <p style="margin: 5px 0; color: #6b7280;"><strong>Message:</strong> ${message}</p>
              </div>
              
              <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1e40af; margin-top: 0;">What happens next?</h3>
                <ul style="color: #1e40af; margin: 10px 0;">
                  <li>Our team will review your inquiry</li>
                  <li>We'll respond within 24 hours</li>
                  <li>If you're interested in a course, we'll provide detailed information</li>
                  <li>We might schedule a call if needed</li>
                </ul>
              </div>
              
              <div style="margin-top: 30px; padding: 20px; background: #f3f4f6; border-radius: 8px; text-align: center;">
                <h3 style="color: #374151; margin-top: 0;">Explore Our Courses</h3>
                <p style="color: #6b7280; margin: 10px 0;">While you wait, check out our available courses:</p>
                <a href="https://the-data-rhythm-academy.web.app" 
                   style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 0;">
                  Browse Courses
                </a>
              </div>
              
              <div style="margin-top: 30px; text-align: center; color: #6b7280;">
                <p>Need immediate assistance? Email us at <a href="mailto:your-email@gmail.com" style="color: #3b82f6;">your-email@gmail.com</a></p>
                <p style="font-size: 14px;">📍 Melakottaiyur, Chennai, Tamil Nadu, India</p>
              </div>
            </div>
          </div>
        `,
      };

      // Send both emails
      await Promise.all([
        transporter.sendMail(adminMailOptions),
        transporter.sendMail(autoReplyMailOptions),
      ]);

      logger.info("Contact form emails sent successfully", {
        name,
        email,
        subject,
      });

      return res.status(200).json({
        success: true,
        message: "Message sent successfully! You should receive a confirmation email shortly.",
      });
    } catch (error) {
      logger.error("Error sending contact form emails:", error);
      return res.status(500).json({
        error: "Failed to send message. Please try again later.",
      });
    }
  });
});
