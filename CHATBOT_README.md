# BKL Association AI Chatbot - Setup Guide

## 🎯 Overview

Professional AI-powered chatbot for BKL Association's home loan website. Features real-time responses, EMI calculations, lead generation, and seamless integration with OpenAI GPT-3.5.

## 🚀 Quick Start

### 1. Install Python Dependencies

```powershell
# Navigate to project folder
cd "c:\Users\SANJEEV PRAKASH\OneDrive\Documents\BKL"

# Install required packages
pip install -r requirements.txt
```

### 2. Configure API Key

```powershell
# Copy the example environment file
Copy-Item .env.example .env

# Edit .env file and add your OpenAI API key
notepad .env
```

**Get your OpenAI API key:**
1. Go to https://platform.openai.com/api-keys
2. Create an account or log in
3. Click "Create new secret key"
4. Copy the key and paste it in `.env` file:
   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

### 3. Start the Chatbot Backend

```powershell
# Run the Flask server
python chatbot.py
```

The API will start on http://localhost:5000

### 4. Open Your Website

Open `index.html` in your browser. The chatbot widget will appear in the bottom-right corner.

**Note:** For the chatbot to work, both the Flask backend and the website must be running.

---

## 📁 Files Added

```
BKL/
├── chatbot.py              # Flask backend with OpenAI integration
├── chatbot.js              # Frontend chatbot widget
├── chatbot.css             # Chatbot styling
├── requirements.txt        # Python dependencies
├── .env.example           # Environment variables template
├── .env                   # Your actual API keys (create this)
└── CHATBOT_README.md      # This file
```

---

## 🎨 Features Implemented

### ✅ Chat Widget Design
- ✓ Floating button at bottom-right
- ✓ Professional financial theme matching website colors
- ✓ Smooth animations and transitions
- ✓ Welcome message on open
- ✓ Minimize/close buttons
- ✓ Chat history during session
- ✓ Typing indicator
- ✓ Message timestamps
- ✓ Fully responsive (desktop, tablet, mobile)

### ✅ Intelligent Responses
The chatbot understands and responds to:
- ✓ Home loan eligibility questions
- ✓ Loan Against Property (LAP) inquiries
- ✓ Document requirements
- ✓ Salaried vs self-employed applicants
- ✓ Interest rates and EMI calculations
- ✓ Loan amounts and repayment tenure
- ✓ Frequently asked questions
- ✓ Contact requests for human representatives

### ✅ Real AI Integration
- ✓ Connected to OpenAI GPT-3.5 API
- ✓ Secure backend with Flask
- ✓ API keys protected in environment variables
- ✓ Context-aware conversations
- ✓ Graceful error handling
- ✓ Loading states and retry logic

### ✅ Financial Accuracy
- ✓ Real EMI calculations using reducing-balance formula
- ✓ Accurate loan information based on BKL's offerings
- ✓ Clear disclaimers about lender-dependent terms
- ✓ No sensitive information requests (passwords, OTPs)
- ✓ Professional financial guidance

### ✅ Quick Reply Buttons
- Home Loan
- Loan Against Property
- Check Eligibility
- Calculate EMI
- Required Documents
- Talk to an Expert

### ✅ Lead Generation
- ✓ Contact form when user requests expert
- ✓ Field validation (name, phone, loan type)
- ✓ Privacy consent notice
- ✓ Secure backend submission
- ✓ Success confirmation

### ✅ Technical Requirements
- ✓ Integrated without rebuilding website
- ✓ Reuses existing styles and variables
- ✓ Works across all pages
- ✓ Responsive layouts
- ✓ Keyboard accessible
- ✓ Proper contrast and focus handling
- ✓ Rate limiting and input validation
- ✓ Safe error handling
- ✓ Environment-based configuration

---

## 🧪 Testing Checklist

Test the following scenarios:

### Basic Functionality
- [ ] Chatbot button appears on all pages
- [ ] Click button to open chat window
- [ ] Welcome message displays
- [ ] Type and send a message
- [ ] Bot responds within 2-3 seconds
- [ ] Minimize and maximize chat
- [ ] Chat history persists during session

### Intelligent Responses
- [ ] Ask: "I want to buy a house" → Bot asks if salaried/self-employed
- [ ] Ask: "What documents are required?" → Bot lists documents
- [ ] Ask: "Calculate EMI for 30 lakhs at 8.5% for 20 years" → Bot shows calculation
- [ ] Ask: "What is your interest rate?" → Bot explains it varies by lender
- [ ] Ask: "I want to talk to someone" → Bot shows contact form

### Quick Replies
- [ ] Click "Home Loan" button → Bot explains home loans
- [ ] Click "Calculate EMI" button → Bot asks for details
- [ ] Click "Talk to Expert" → Contact form appears

### EMI Calculations
- [ ] Test with valid inputs → Shows correct EMI
- [ ] EMI formula matches standard calculation
- [ ] Shows principal, interest, total payment

### Lead Submission
- [ ] Fill contact form with valid data → Success message
- [ ] Submit with invalid phone → Shows error
- [ ] Leave fields empty → Shows validation error

### Responsive Design
- [ ] Test on desktop (>1024px width)
- [ ] Test on tablet (768px - 1024px)
- [ ] Test on mobile (<768px)
- [ ] Chat doesn't cover important content

### Error Handling
- [ ] Stop Flask server → Shows connection error
- [ ] Send empty message → Doesn't send
- [ ] Click send rapidly → No duplicate messages
- [ ] Invalid API key → Shows friendly error

### Security
- [ ] Check .env file is NOT in git
- [ ] API key not visible in browser code
- [ ] No passwords or sensitive data requested

---

## 🔧 Configuration

### Change Chatbot Personality

Edit `chatbot.py` and modify the `SYSTEM_PROMPT` variable (line 24):

```python
SYSTEM_PROMPT = """Your custom instructions here..."""
```

### Change API Endpoint

Edit `chatbot.js` and update the `CONFIG` object (line 8):

```javascript
const CONFIG = {
  API_URL: 'http://your-server:5000/api/chat',
  // ... other settings
};
```

### Customize Colors

The chatbot uses CSS variables from your existing theme. To customize:

Edit `chatbot.css` and change colors:
```css
.chat-toggle-btn {
  background: linear-gradient(135deg, var(--primary-navy), var(--navy-soft));
}
```

---

## 🚀 Production Deployment

### Option 1: Deploy Backend to Heroku

```powershell
# Install Heroku CLI
# Create Procfile
echo "web: python chatbot.py" > Procfile

# Deploy
heroku create bkl-chatbot
heroku config:set OPENAI_API_KEY=your_key_here
git push heroku main
```

Update `chatbot.js` with your Heroku URL:
```javascript
API_URL: 'https://bkl-chatbot.herokuapp.com/api/chat'
```

### Option 2: Deploy Backend to Render

1. Go to https://render.com
2. Connect your GitHub repository
3. Create a new Web Service
4. Add environment variable `OPENAI_API_KEY`
5. Deploy
6. Update `chatbot.js` with your Render URL

### Option 3: Deploy to Your Own Server

```bash
# SSH to your server
ssh user@yourserver.com

# Install dependencies
pip install -r requirements.txt

# Run with gunicorn (production server)
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 chatbot:app
```

---

## 📊 Adding to Other Pages

To add chatbot to other HTML pages:

1. Add CSS link in `<head>`:
```html
<link rel="stylesheet" href="chatbot.css">
```

2. Add JavaScript before closing `</body>`:
```html
<script src="chatbot.js"></script>
```

Already added to:
- ✅ index.html (main page)
- ⚠️ home-loan.html (needs adding)
- ⚠️ lap.html (needs adding)
- ⚠️ apply.html (needs adding)
- ⚠️ about.html (needs adding)

---

## 🐛 Troubleshooting

### Chatbot doesn't appear
- Check browser console for errors (F12)
- Verify `chatbot.css` and `chatbot.js` files exist
- Clear browser cache and refresh

### "Could not connect" error
- Make sure Flask backend is running (`python chatbot.py`)
- Check if port 5000 is available
- Verify `OPENAI_API_KEY` is set in `.env`

### Bot gives generic responses
- Check your OpenAI API key is valid
- Verify you have API credits remaining
- Check Flask terminal for error messages

### EMI calculations wrong
- Verify inputs are in correct format
- Check if formula implementation matches requirements
- Test with known EMI calculation

### Lead form doesn't work
- Check browser console for errors
- Verify Flask backend is receiving requests
- Check if database/CRM integration is configured

---

## 💰 OpenAI API Costs

Estimated costs:
- GPT-3.5-turbo: ~$0.002 per conversation
- 1,000 conversations ≈ $2
- Very cost-effective for small to medium traffic

Set usage limits in OpenAI dashboard:
https://platform.openai.com/account/billing/limits

---

## 📞 Support

For issues or questions:
- Email: teambklassociation0003@gmail.com
- Phone: 8072294235

---

## 📝 License

Proprietary - BKL Association
All rights reserved.
