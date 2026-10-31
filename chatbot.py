"""
BKL Association AI Chatbot Backend
Flask API with OpenAI integration for intelligent home loan assistance
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os
from datetime import datetime
import re
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure OpenAI
openai.api_key = os.getenv('OPENAI_API_KEY')

# In-memory conversation storage (use database in production)
conversations = {}

# System prompt for the chatbot
SYSTEM_PROMPT = """You are a professional financial advisor assistant for BKL Association, a home loan and property loan advisory service in Tamil Nadu, India.

Your role:
- Help users understand Home Loans (₹5 Lakhs to ₹1 Crore) and Loan Against Property (₹5 Lakhs to ₹75 Lakhs)
- Explain eligibility criteria for both salaried and self-employed applicants
- Guide users through document requirements
- Calculate EMI using the standard reducing-balance formula: EMI = P × r × (1+r)^n / ((1+r)^n - 1)
- Provide information about the application process
- Be helpful, professional, and accurate

Important guidelines:
- DO NOT invent interest rates. Mention typical ranges are 8.5% to 12% p.a. but vary by lender
- DO NOT guarantee loan approval - explain it depends on credit assessment
- DO NOT request sensitive information like passwords, OTPs, or full card details
- For specific rates, eligibility, or applications, suggest contacting BKL at 8072294235
- Be concise but informative
- Use Indian Rupee (₹) format
- Ask clarifying questions when needed

BKL Association details:
- Phone: 8072294235
- Services: Home Loan advisory, Loan Against Property (LAP) coordination
- Special offer: Up to ₹50 Lakhs without ITR & GST (subject to lender criteria)
- Coverage: Tamil Nadu
"""

def calculate_emi(principal, annual_rate, tenure_years):
    """Calculate EMI using reducing balance method"""
    try:
        principal = float(principal)
        annual_rate = float(annual_rate)
        tenure_years = float(tenure_years)
        
        # Convert annual rate to monthly and tenure to months
        monthly_rate = annual_rate / (12 * 100)
        tenure_months = tenure_years * 12
        
        if monthly_rate == 0:
            emi = principal / tenure_months
        else:
            emi = principal * monthly_rate * ((1 + monthly_rate) ** tenure_months) / (((1 + monthly_rate) ** tenure_months) - 1)
        
        total_payment = emi * tenure_months
        total_interest = total_payment - principal
        
        return {
            'emi': round(emi, 2),
            'total_payment': round(total_payment, 2),
            'total_interest': round(total_interest, 2),
            'principal': round(principal, 2)
        }
    except (ValueError, ZeroDivisionError):
        return None

def extract_emi_params(message):
    """Extract loan amount, interest rate, and tenure from user message"""
    # Look for patterns like "30 lakhs", "8.5%", "20 years"
    amount_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:lakh|lac|l)', message, re.IGNORECASE)
    rate_match = re.search(r'(\d+(?:\.\d+)?)\s*%', message)
    tenure_match = re.search(r'(\d+)\s*(?:year|yr)', message, re.IGNORECASE)
    
    params = {}
    if amount_match:
        params['amount'] = float(amount_match.group(1)) * 100000
    if rate_match:
        params['rate'] = float(rate_match.group(1))
    if tenure_match:
        params['tenure'] = float(tenure_match.group(1))
    
    return params if params else None

@app.route('/api/chat', methods=['POST'])
def chat():
    """Main chat endpoint"""
    try:
        data = request.json
        user_message = data.get('message', '').strip()
        session_id = data.get('session_id', 'default')
        
        if not user_message:
            return jsonify({'error': 'Message cannot be empty'}), 400
        
        # Rate limiting (basic)
        if len(user_message) > 500:
            return jsonify({'error': 'Message too long. Please keep it under 500 characters.'}), 400
        
        # Initialize conversation history
        if session_id not in conversations:
            conversations[session_id] = [
                {"role": "system", "content": SYSTEM_PROMPT}
            ]
        
        # Add user message
        conversations[session_id].append({
            "role": "user",
            "content": user_message
        })
        
        # Check if user wants EMI calculation
        emi_params = extract_emi_params(user_message.lower())
        if any(keyword in user_message.lower() for keyword in ['emi', 'calculate', 'monthly payment']):
            if emi_params and len(emi_params) >= 2:
                # Provide default values if missing
                amount = emi_params.get('amount', 3000000)
                rate = emi_params.get('rate', 8.5)
                tenure = emi_params.get('tenure', 20)
                
                result = calculate_emi(amount, rate, tenure)
                if result:
                    response_text = f"""Based on your inputs:
• Loan Amount: ₹{result['principal']:,.0f}
• Interest Rate: {rate}% p.a.
• Tenure: {int(tenure)} years

**Monthly EMI: ₹{result['emi']:,.0f}**

Total Payment: ₹{result['total_payment']:,.0f}
Total Interest: ₹{result['total_interest']:,.0f}

*Note: This is an estimate. Actual EMI depends on the lender's terms and processing fees.*

Would you like to check your eligibility or speak with our advisor at 8072294235?"""
                    
                    conversations[session_id].append({
                        "role": "assistant",
                        "content": response_text
                    })
                    
                    return jsonify({
                        'response': response_text,
                        'timestamp': datetime.now().isoformat()
                    })
        
        # Call OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=conversations[session_id][-10:],  # Keep last 10 messages for context
            max_tokens=300,
            temperature=0.7
        )
        
        bot_message = response.choices[0].message.content
        
        # Add bot response to history
        conversations[session_id].append({
            "role": "assistant",
            "content": bot_message
        })
        
        # Keep conversation history manageable
        if len(conversations[session_id]) > 20:
            conversations[session_id] = [conversations[session_id][0]] + conversations[session_id][-19:]
        
        return jsonify({
            'response': bot_message,
            'timestamp': datetime.now().isoformat()
        })
    
    except openai.error.RateLimitError:
        return jsonify({'error': 'Service is busy. Please try again in a moment.'}), 429
    except openai.error.APIError as e:
        return jsonify({'error': 'AI service temporarily unavailable. Please try again.'}), 503
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': 'Something went wrong. Please try again or call 8072294235.'}), 500

@app.route('/api/save-lead', methods=['POST'])
def save_lead():
    """Save user contact information"""
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['name', 'phone', 'loan_type']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Validate phone number (Indian format)
        phone = data.get('phone', '')
        if not re.match(r'^[6-9]\d{9}$', phone):
            return jsonify({'error': 'Please enter a valid 10-digit Indian mobile number'}), 400
        
        # In production: Save to database
        # For now, log it (replace with actual database code)
        lead_data = {
            'name': data.get('name'),
            'phone': data.get('phone'),
            'loan_type': data.get('loan_type'),
            'contact_time': data.get('contact_time', 'Any time'),
            'timestamp': datetime.now().isoformat()
        }
        
        print(f"New Lead: {lead_data}")
        
        # TODO: Send to CRM, database, or email notification
        
        return jsonify({
            'success': True,
            'message': 'Thank you! Our team will contact you soon.'
        })
    
    except Exception as e:
        print(f"Error saving lead: {str(e)}")
        return jsonify({'error': 'Could not save your information. Please call 8072294235 directly.'}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

if __name__ == '__main__':
    if not os.getenv('OPENAI_API_KEY'):
        print("WARNING: OPENAI_API_KEY not set. Please configure .env file.")
        print("The chatbot will not work without a valid API key.")
    
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    print(f"Starting BKL Chatbot API on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=debug)
