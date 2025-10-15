# Email Setup Guide for Data Rhythm Academy

## 🎉 **Current Status**
✅ Landing page image updated to educational theme  
✅ Contact form with validation and auto-reply ready  
✅ EmailJS integration implemented (free tier: 200 emails/month)  
✅ Professional email templates designed  

## 📧 **EmailJS Setup (FREE - Perfect for 1K emails/month)**

### Step 1: Create EmailJS Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for free account
3. **Free tier includes**: 200 emails/month (perfect for your needs)

### Step 2: Configure Email Service
1. In EmailJS dashboard, click **"Email Services"**
2. Click **"Add New Service"**
3. Choose **Gmail** (recommended)
4. Fill in your Gmail credentials:
   - **User ID**: your-email@gmail.com
   - **Access Token**: Use Gmail App Password (not regular password)

### Step 3: Create Email Template
Create a template with these variables:
```
From: {{from_name}} <{{from_email}}>
Subject: New Contact: {{subject}}

Name: {{from_name}}
Email: {{from_email}}
Subject: {{subject}}

Message:
{{message}}
```

### Step 4: Get Your Keys
1. **Service ID**: Copy from Email Services page
2. **Template ID**: Copy from Email Templates page  
3. **Public Key**: Copy from Account settings

### Step 5: Update Your Code
In `src/components/ContactPage.tsx`, replace these placeholders:
```javascript
const serviceId = 'YOUR_SERVICE_ID';        // Replace with your Service ID
const templateId = 'YOUR_TEMPLATE_ID';      // Replace with your Template ID
const publicKey = 'YOUR_PUBLIC_KEY';        // Replace with your Public Key
```

Also update:
```javascript
to_email: 'your-email@gmail.com',           // Replace with your email
```

## 📱 **Auto-Reply Setup**

### Option 1: EmailJS Auto-Reply (Recommended)
1. Create a second template for auto-reply:
```
To: {{from_email}}
Subject: Thank you for contacting Data Rhythm Academy!

Hi {{from_name}},

Thank you for reaching out! We've received your message about "{{subject}}" and will get back to you within 24 hours.

Your message summary:
{{message}}

Best regards,
Data Rhythm Academy Team
```

2. Add a second EmailJS call in your form submission:
```javascript
// Send admin notification
await emailjs.send(serviceId, adminTemplateId, formData, publicKey);

// Send auto-reply
await emailjs.send(serviceId, autoReplyTemplateId, formData, publicKey);
```

### Option 2: Gmail Auto-Reply (Alternative)
Set up Gmail filters to automatically reply to emails from your contact form.

## 💰 **Cost Analysis**

| Service | Free Tier | Your Usage (1K emails) | Cost |
|---------|-----------|------------------------|------|
| EmailJS | 200/month | Need ~84/month | $0-15/month |
| Firebase Hosting | ✅ 10GB | Current usage | $0 |
| **Total** | | | **$0-15/month** |

## 🚀 **Next Steps**

1. **Set up EmailJS account** (5 minutes)
2. **Update the 4 placeholder values** in ContactPage.tsx
3. **Test the contact form**
4. **Deploy the changes**

## 🔧 **Alternative Options**

### If you want Firebase Functions later:
1. Upgrade to Blaze plan (pay-as-you-go)
2. **Cost**: $0.40 per million invocations
3. **Your usage**: ~$0.40/month for 1K emails
4. **Benefits**: More control, database storage, auto-reply

### Other alternatives:
- **Formspree**: $0-10/month
- **Netlify Forms**: Free with Netlify hosting
- **SendGrid**: Free tier 100 emails/day

## 📋 **Implementation Checklist**

- [ ] Create EmailJS account
- [ ] Configure Gmail service
- [ ] Create email template
- [ ] Copy Service ID, Template ID, Public Key
- [ ] Update ContactPage.tsx with your keys
- [ ] Test contact form
- [ ] Deploy to production
- [ ] Set up auto-reply template (optional)

## 🎯 **Final Result**

Once configured, your contact form will:
✅ Send professional emails to your inbox  
✅ Validate all form inputs  
✅ Show success/error notifications  
✅ Store form data (if using Firebase)  
✅ Send auto-reply to users (optional)  
✅ Handle up to 200 emails/month for FREE  

**Estimated setup time**: 10-15 minutes  
**Monthly cost**: $0 (for up to 200 emails)