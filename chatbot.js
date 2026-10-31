/**
 * BKL Association AI Chatbot Widget
 * Professional, fully functional chatbot with real AI integration & offline intelligence
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    API_URL: 'http://localhost:5000/api/chat',
    LEAD_API_URL: 'http://localhost:5000/api/save-lead',
    SESSION_KEY: 'bkl_chat_session',
    LEADS_KEY: 'bkl_leads',
    MAX_RETRIES: 2,
    REQUEST_TIMEOUT: 2500,
    TYPING_DELAY: 500
  };

  // Helper to detect current language
  function getCurrentLang() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        var saved = localStorage.getItem('bkl_lang');
        if (saved === 'ta') return 'ta';
      }
    } catch (e) {}
    return document.documentElement.lang === 'ta' ? 'ta' : 'en';
  }

  // Generate or retrieve session ID
  function getSessionId() {
    let sessionId = null;
    try {
      sessionId = sessionStorage.getItem(CONFIG.SESSION_KEY);
      if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem(CONFIG.SESSION_KEY, sessionId);
      }
    } catch (e) {
      sessionId = 'session_' + Date.now();
    }
    return sessionId;
  }

  // EMI Math Helper
  function calculateEMI(principal, annualRate, tenureYears) {
    var P = Math.max(0, Number(principal) || 0);
    var rate = Math.max(0, Number(annualRate) || 0);
    var years = Math.max(1, Number(tenureYears) || 1);
    var n = years * 12;

    if (P <= 0) return { emi: 0, totalPayment: 0, totalInterest: 0 };
    if (rate <= 0) {
      var zeroEmi = Math.round(P / n);
      return { emi: zeroEmi, totalPayment: P, totalInterest: 0 };
    }

    var r = rate / 12 / 100;
    var factor = Math.pow(1 + r, n);
    var emi = Math.round((P * r * factor) / (factor - 1));
    var totalPayment = emi * n;
    var totalInterest = Math.max(0, totalPayment - P);

    return { emi: emi, totalPayment: totalPayment, totalInterest: totalInterest };
  }

  function formatINR(number) {
    var val = Math.round(Number(number) || 0);
    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(val);
    } catch (e) {
      return '₹ ' + val.toLocaleString('en-IN');
    }
  }

  // Offline Financial Knowledge Base
  function generateOfflineResponse(rawMessage) {
    var msg = (rawMessage || '').toLowerCase();
    var isTa = getCurrentLang() === 'ta' || /[\u0B80-\u0BFF]/.test(rawMessage);

    // 1. EMI Calculation Request
    var isEmi = msg.includes('emi') || msg.includes('calculate') || msg.includes('மாத தவணை') || msg.includes('கணக்கிடு');
    if (isEmi) {
      var amountMatch = msg.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|l|லட்சம்)/i);
      var rateMatch = msg.match(/(\d+(?:\.\d+)?)\s*%/);
      var tenureMatch = msg.match(/(\d+)\s*(?:year|yr|ஆண்டு|வருடம்)/i);

      var amount = amountMatch ? parseFloat(amountMatch[1]) * 100000 : 3000000;
      var rate = rateMatch ? parseFloat(rateMatch[1]) : 8.5;
      var tenure = tenureMatch ? parseInt(tenureMatch[1], 10) : 20;

      var res = calculateEMI(amount, rate, tenure);

      if (isTa) {
        return `📊 **EMI கணக்கீடு விவரம்:**\n` +
          `• **கடன் தொகை:** ${formatINR(amount)}\n` +
          `• **வட்டி விகிதம்:** ${rate}% p.a.\n` +
          `• **தவணைக்காலம்:** ${tenure} ஆண்டுகள் (${tenure * 12} மாதங்கள்)\n\n` +
          `💰 **மாதாந்திர EMI: ${formatINR(res.emi)}**\n` +
          `• மொத்த வட்டி: ${formatINR(res.totalInterest)}\n` +
          `• மொத்த திருப்பிச் செலுத்தும் தொகை: ${formatINR(res.totalPayment)}\n\n` +
          `*குறிப்பு: இது மாதிரி மதிப்பீடு. இறுதி ஒப்புதல் மற்றும் வட்டி வங்கிகளின் விதிமுறைகளுக்கு உட்பட்டது.*\n` +
          `நேரடியாக பேச அழைக்கவும்: **8072294235** அல்லது கீழே உள்ள படிவத்தில் தொடர்பு கொள்ளவும்.`;
      }

      return `📊 **Hypothetical EMI Calculation:**\n` +
        `• **Loan Amount:** ${formatINR(amount)}\n` +
        `• **Interest Rate:** ${rate}% p.a.\n` +
        `• **Tenure:** ${tenure} Years (${tenure * 12} months)\n\n` +
        `💰 **Monthly EMI: ${formatINR(res.emi)}**\n` +
        `• Total Interest: ${formatINR(res.totalInterest)}\n` +
        `• Total Repayment: ${formatINR(res.totalPayment)}\n\n` +
        `*Note: Indicative estimate. Exact interest rates and sanctions are determined by the participating lending institution.*\n` +
        `Need custom eligibility evaluation? Call our advisory helpline directly at **8072294235**.`;
    }

    // 2. Home Loan queries
    if (msg.includes('home loan') || msg.includes('house loan') || msg.includes('housing') || msg.includes('வீட்டு') || msg.includes('கடன்')) {
      if (isTa) {
        return `🏡 **பிகேஎல் அசோசியேஷன் வீட்டுக் கடன் (Home Loan):**\n\n` +
          `• **கடன் வரம்பு:** ₹5 லட்சம் முதல் ₹5 கோடி வரை\n` +
          `• **சிறப்பு சலுகை:** ITR & GST இன்றி கடன் பெறும் வசதி (தகுதிக்குட்பட்டோருக்கு)*\n` +
          `• **முக்கிய நன்மை:** வீட்டுக் கடனுக்கு அப்ரூவ்டு பிளான் (Building Plan) தேவையில்லை!*\n` +
          `• **வட்டி விகிதம்:** ஆண்டுக்கு சுமார் 8.5% முதல் துவங்குகிறது\n` +
          `• **தவணைக்காலம்:** 20 முதல் 30 ஆண்டுகள் வரை\n` +
          `• **பயன்பாடு:** புதிய வீடு வாங்குதல், சுய கட்டுமானம், பிளாட் & வீட்டு மனை மேம்பாடு\n\n` +
          `உங்கள் தகுதியை அறிய **8072294235** என்ற எண்ணை அழைக்கவும் அல்லது [தகுதி சரிபார்க்கவும்](apply.html).`;
      }
      return `🏡 **BKL Association Home Loan Solutions:**\n\n` +
        `• **Financing Range:** ₹5 Lakhs to ₹5 Crores\n` +
        `• **Advertised Feature:** Loans available without ITR & GST* (based on bank cashflow & property)\n` +
        `• **Key Advantage:** Approved Building Plan NOT required for eligible properties & self-construction!*\n` +
        `• **Competitive Rates:** Starting around 8.5% p.a. based on credit score & income\n` +
        `• **Flexible Tenures:** Up to 20 to 30 years\n` +
        `• **Purpose:** Ready purchase, under-construction apartments, self-construction, and plots\n\n` +
        `Ready to start? Call our specialists at **8072294235** or explore our [Online Eligibility Wizard](apply.html).`;
    }

    // 3. LAP (Loan Against Property)
    if (msg.includes('lap') || msg.includes('against property') || msg.includes('mortgage') || msg.includes('சொத்து')) {
      if (isTa) {
        return `🏢 **சொத்து மீதான கடன் (Loan Against Property - LAP):**\n\n` +
          `• **கடன் வரம்பு:** ₹5 லட்சம் முதல் ₹1.25 கோடி வரை\n` +
          `• **சிறப்பு சலுகை:** ITR & GST இன்றியும் கடன் பெறலாம்*\n` +
          `• **சொத்து வகைகள்:** சொந்த குடியிருப்பு, வணிக வளாகம், பட்டா நிலம்\n` +
          `• **தவணைக்காலம்:** 15 ஆண்டுகள் வரை\n` +
          `• **முக்கிய நன்மை:** சொத்தின் உரிமையை நீங்களே வைத்துக்கொண்டு வணிக வளர்ச்சி, மருத்துவம் அல்லது கல்வித் தேவைகளுக்கு நிதி பெறலாம்.\n\n` +
          `ஆலோசனைக்கு அழைக்கவும்: **8072294235**.`;
      }
      return `🏢 **Loan Against Property (LAP) Guidance:**\n\n` +
        `• **Borrowing Range:** ₹5 Lakhs to ₹1.25 Crores\n` +
        `• **Special Option:** Available without ITR & GST* based on turnover & banking surrogates\n` +
        `• **Collateral:** Titled residential, commercial, or mixed-use properties\n` +
        `• **Tenure:** Up to 15 years for comfortable monthly repayments\n` +
        `• **Key Advantage:** Unlock high liquidity for business expansion or major personal goals while retaining 100% property ownership.\n\n` +
        `Speak directly with our mortgage team at **8072294235**.`;
    }

    // 4. Document requirements
    if (msg.includes('document') || msg.includes('proof') || msg.includes('paper') || msg.includes('ஆவணம்') || msg.includes('தேவை') || msg.includes('plan')) {
      if (isTa) {
        return `📋 **தேவையான முக்கிய ஆவணங்கள்:**\n\n` +
          `**மாத சம்பளம் பெறுவோர்:**\n` +
          `• பான் கார்டு & ஆதார் கார்டு (KYC)\n` +
          `• கடந்த 3-6 மாத சம்பள சீட்டுகள் (Salary Slips)\n` +
          `• கடந்த 6 மாத வங்கி கணக்கு அறிக்கை (Bank Statement)\n\n` +
          `**தொழில் செய்வோர் / சுயதொழில்:**\n` +
          `• பான் & ஆதார்\n` +
          `• வணிக சான்று & வங்கி கணக்கு அறிக்கை (6-12 மாதங்கள்)\n` +
          `• ITR / GST ஆவணங்கள் (ITR இல்லாதவர்களுக்கும் கடன் பெரும் வாய்ப்பு உண்டு*)\n\n` +
          `**சொத்து ஆவணங்கள்:**\n` +
          `• சொத்து மூலப்பத்திரம் & பட்டா நகல் (வீட்டுக் கடனுக்கு அப்ரூவ்டு பிளான் தேவையில்லை*).\n\n` +
          `மேலும் விவரங்களுக்கு அழைக்கவும்: **8072294235**.`;
      }
      return `📋 **Standard Documentation Checklist:**\n\n` +
        `**For Salaried Applicants:**\n` +
        `• KYC: PAN Card & Aadhaar Card\n` +
        `• Income: Last 3–6 months payslips & Form 16\n` +
        `• Banking: Last 6 months salary account bank statements\n\n` +
        `**For Self-Employed / Business:**\n` +
        `• KYC & Business Registration proof\n` +
        `• Last 12 months primary banking statements\n` +
        `• Options available without mandatory ITR & GST*\n\n` +
        `**Property Documents:**\n` +
        `• Property title deed, parent documents, and Patta (Approved building plan NOT required for eligible home loans*).\n\n` +
        `Call **8072294235** for guidance on your specific profile.`;
    }

    // Terms & Conditions queries
    if (msg.includes('term') || msg.includes('condition') || msg.includes('policy') || msg.includes('legal') || msg.includes('விதிமுறை')) {
      if (isTa) {
        return `📜 **விதிமுறைகள் மற்றும் நிபந்தனைகள் (Terms & Conditions):**\n\n` +
          `• பிகேஎல் அசோசியேஷன் ஒரு கடன் ஆலோசனை மற்றும் வழிகாட்டுதல் நிறுவனம். நாங்கள் வங்கிகள் மற்றும் நிதி நிறுவனங்களுடன் உங்களை இணைக்கிறோம்.\n` +
          `• கடன் ஒப்புதல், வட்டி விகிதம் மற்றும் தவணைகள் வங்கியின் தணிக்கைக்கு உட்பட்டது.\n` +
          `• வீட்டுக் கடன்: ₹5 லட்சம் முதல் ₹5 கோடி வரை (அப்ரூவ்டு பிளான் தேவையில்லை*).\n` +
          `• சொத்துக் கடன்: ₹5 லட்சம் முதல் ₹1.25 கோடி வரை (ITR/GST இன்றியும் பெறலாம்*).\n\n` +
          `முழுமையான விவரங்களுக்கு எங்கள் [விதிமுறைகள் பக்கத்தை (Terms)](terms.html) பார்க்கவும் அல்லது அழைக்கவும்: **8072294235**.`;
      }
      return `📜 **BKL Association Terms & Conditions Summary:**\n\n` +
        `• BKL Association functions as an independent loan facilitator and advisory service connecting borrowers to banks/HFCs across Tamil Nadu.\n` +
        `• All credit decisions, sanction terms, interest rates, and disbursements are decided exclusively by the participating lending institutions.\n` +
        `• Home Loans (₹5L to ₹5Cr) with Building Plan Not Required* for eligible properties.\n` +
        `• Loan Against Property (₹5L to ₹1.25Cr) with options without ITR & GST*.\n\n` +
        `Read our full [Terms and Conditions](terms.html) or speak with our team directly at **8072294235**.`;
    }

    // 5. Eligibility conditions
    if (msg.includes('eligib') || msg.includes('cibil') || msg.includes('criteria') || msg.includes('salary') || msg.includes('தகுதி')) {
      if (isTa) {
        return `✅ **கடன் தகுதி அளவுகோல்கள்:**\n\n` +
          `• **வயது வரம்பு:** 21 முதல் 65 வயது வரை\n` +
          `• **சிபில் ஸ்கோர் (CIBIL):** 650+ பரிந்துரைக்கப்படுகிறது\n` +
          `• **வருமான வரம்பு:** மாதாந்திர திருப்பி செலுத்தும் திறன் 40%-50% FOIR வரம்பிற்குள் இருக்க வேண்டும்\n` +
          `• **இடம்:** தமிழ்நாடு முழுவதும் உள்ள சொத்துக்கள்\n` +
          `• **சிறப்பம்சம்:** முறையான ITR இல்லாத சுயதொழில் செய்வோருக்கும் வழிகாட்டுகிறோம்.\n\n` +
          `உங்கள் தகுதியை உடனடியாக மதிப்பிட அழைக்கவும்: **8072294235**.`;
      }
      return `✅ **Key Borrowing Eligibility Factors:**\n\n` +
        `• **Age Criteria:** 21 to 65 years (at loan maturity)\n` +
        `• **Credit Rating:** CIBIL score of 650+ preferred for fast sanction\n` +
        `• **Repayment Capacity:** Total EMI obligations within 40%–50% of monthly net income\n` +
        `• **Geography:** Properties located across Tamil Nadu\n` +
        `• **Flexibility:** Alternative verification options for applicants without formal ITR up to ₹50L*.\n\n` +
        `Test your parameters with our [Online Eligibility Wizard](apply.html) or call **8072294235**.`;
    }

    // 6. Contact / Helpline / Location
    if (msg.includes('contact') || msg.includes('phone') || msg.includes('call') || msg.includes('number') || msg.includes('address') || msg.includes('location') || msg.includes('office') || msg.includes('email') || msg.includes('mail') || msg.includes('தொடர்பு')) {
      if (isTa) {
        return `📞 **பிகேஎல் அசோசியேஷன் நேரடி தொடர்பு:**\n\n` +
          `• **தொலைபேசி எண்:** [8072294235](tel:8072294235)\n` +
          `• **மின்னஞ்சல்:** [teambklassociation0003@gmail.com](mailto:teambklassociation0003@gmail.com)\n` +
          `• **சேவை நேரம்:** திங்கள் முதல் சனி வரை | காலை 9:30 முதல் மாலை 6:30 வரை\n` +
          `• **சேவை பகுதி:** தமிழ்நாடு முழுவதும்\n\n` +
          `கீழே உள்ள 'Talk to Expert' பொத்தானை கிளிக் செய்து உங்கள் விவரங்களை அனுப்பினால் எங்கள் ஆலோசகர் உங்களை அழைப்பார்.`;
      }
      return `📞 **BKL Association Direct Advisory Helpline:**\n\n` +
        `• **Direct Phone:** [8072294235](tel:8072294235)\n` +
        `• **Email:** [teambklassociation0003@gmail.com](mailto:teambklassociation0003@gmail.com)\n` +
        `• **Business Hours:** Monday to Saturday | 9:30 AM to 6:30 PM (IST)\n` +
        `• **Coverage Area:** Serving clients across Tamil Nadu\n\n` +
        `Click the **Talk to Expert** button below or call us directly right now!`;
    }

    // 7. General Greetings
    if (isTa) {
      return `வணக்கம்! 🙏 பிகேஎல் அசோசியேஷன் கடன் ஆலோசனைக்கு வரவேற்கிறோம்.\n\n` +
        `நாங்கள் உங்களுக்கு எவ்வாறு உதவ முடியும்?\n` +
        `• **வீட்டுக் கடன்** (₹5L முதல் ₹5 கோடி வரை - பிளான் தேவையில்லை)\n` +
        `• **சொத்து மீதான கடன்** (₹5L முதல் ₹1.25 கோடி வரை)\n` +
        `• **ITR & GST இன்றி கடன் வாய்ப்புகள்**\n` +
        `• **EMI கணக்கீடு**\n` +
        `• **தேவையான ஆவணங்கள்**\n\n` +
        `கீழே உள்ள தலைப்பை தேர்ந்தெடுக்கவும் அல்லது உங்கள் கேள்வியை டைப் செய்யவும். நேரடி ஆலோசனைக்கு: **8072294235**.`;
    }

    return `Hello! 👋 Welcome to BKL Association Loan Advisory.\n\n` +
      `How can we assist your financing journey today?\n` +
      `• **Home Loan** assistance (₹5 Lakhs to ₹5 Crores - Plan Not Required*)\n` +
      `• **Loan Against Property (LAP)** (₹5 Lakhs to ₹1.25 Crores)\n` +
      `• **Loans Available Without ITR & GST***\n` +
      `• **EMI & Affordability Calculation**\n` +
      `• **Documentation & Eligibility Guidance**\n\n` +
      `Select a quick question below or ask me directly. For immediate assistance, call **8072294235**.`;
  }

  // Initialize chatbot
  function initChatbot() {
    if (document.getElementById('chatWidget')) return;

    var isTa = getCurrentLang() === 'ta';

    var chatHTML = `
      <div class="chat-widget" id="chatWidget">
        <!-- Chat Toggle Button -->
        <button class="chat-toggle-btn" id="chatToggleBtn" aria-label="Open chat" type="button">
          <svg class="chat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <svg class="close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <!-- Chat Window -->
        <div class="chat-window" id="chatWindow" role="dialog" aria-modal="true" aria-label="BKL Loan Advisor Chat">
          <!-- Header -->
          <div class="chat-header">
            <div class="chat-header-info">
              <div class="chat-avatar">BKL</div>
              <div>
                <h3 class="chat-title">BKL Loan Advisor</h3>
                <div class="chat-status">
                  <span class="status-dot"></span>
                  <span>Active &bull; Advisory Support</span>
                </div>
              </div>
            </div>
            <div class="chat-actions">
              <button class="chat-action-btn" id="minimizeBtn" aria-label="Close chat" type="button">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Messages Area -->
          <div class="chat-messages" id="chatMessages" tabindex="0">
            <div class="welcome-message">
              <div class="welcome-message-icon">👋</div>
              <h3>${isTa ? 'பிகேஎல் அசோசியேஷன்' : 'Welcome to BKL Association!'}</h3>
              <p>${isTa ? 'உங்கள் வீட்டுக் கடன் அல்லது சொத்துக் கடன் பற்றி என்ன அறிய விரும்புகிறீர்கள்?' : 'How can we assist with your Home Loan or Property Loan today?'}</p>
            </div>
          </div>

          <!-- Quick Replies -->
          <div class="quick-replies" id="quickReplies">
            <button class="quick-reply-btn" type="button" data-message="I want to apply for a Home Loan">Home Loan</button>
            <button class="quick-reply-btn" type="button" data-message="Tell me about Loan Against Property">Loan Against Property</button>
            <button class="quick-reply-btn" type="button" data-message="What documents are required?">Required Documents</button>
            <button class="quick-reply-btn" type="button" data-message="Calculate my EMI for 30 lakhs at 8.5% for 20 years">Calculate EMI</button>
            <button class="quick-reply-btn" type="button" data-message="I want to talk to an expert">Talk to Expert</button>
          </div>

          <!-- Error Message Bar -->
          <div class="error-message" id="errorMessage"></div>

          <!-- Input Area -->
          <div class="chat-input-area">
            <textarea 
              class="chat-input" 
              id="chatInput" 
              placeholder="${isTa ? 'உங்கள் கேள்வியை தட்டச்சு செய்யவும்...' : 'Type your loan query here...'}"
              rows="1"
              maxlength="500"
              aria-label="Chat message"
            ></textarea>
            <button class="chat-send-btn" id="sendBtn" aria-label="Send message" type="button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', chatHTML);

    var toggleBtn = document.getElementById('chatToggleBtn');
    var chatWindow = document.getElementById('chatWindow');
    var minimizeBtn = document.getElementById('minimizeBtn');
    var chatMessages = document.getElementById('chatMessages');
    var chatInput = document.getElementById('chatInput');
    var sendBtn = document.getElementById('sendBtn');
    var quickReplies = document.getElementById('quickReplies');
    var errorMessage = document.getElementById('errorMessage');

    var isSending = false;

    // Event Listeners
    if (toggleBtn) toggleBtn.addEventListener('click', toggleChat);
    if (minimizeBtn) minimizeBtn.addEventListener('click', toggleChat);
    if (sendBtn) sendBtn.addEventListener('click', sendMessage);
    if (chatInput) {
      chatInput.addEventListener('keydown', handleKeyPress);
      chatInput.addEventListener('input', autoResize);
    }

    if (quickReplies) {
      quickReplies.addEventListener('click', function(e) {
        var btn = e.target.closest('.quick-reply-btn');
        if (btn && btn.dataset.message) {
          chatInput.value = btn.dataset.message;
          sendMessage();
        }
      });
    }

    // Initial greeting
    setTimeout(function() {
      var greeting = getCurrentLang() === 'ta' ?
        'வணக்கம்! 🙏 பிகேஎல் அசோசியேஷன் கடன் ஆலோசனைக்கு வரவேற்கிறோம். உடனடி உதவிக்கு அழைக்கவும்: **8072294235**' :
        'Hi there! Welcome to BKL Association. 👋 How can we help you explore your loan options today? Call us directly at **8072294235**.';
      addBotMessage(greeting);
    }, 400);

    function toggleChat() {
      var isActive = chatWindow.classList.toggle('active');
      toggleBtn.classList.toggle('active');
      toggleBtn.setAttribute('aria-expanded', isActive ? 'true' : 'false');

      if (isActive) {
        setTimeout(function() {
          chatInput.focus();
        }, 150);
        scrollToBottom();
      }
    }

    function handleKeyPress(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    }

    function autoResize() {
      chatInput.style.height = 'auto';
      chatInput.style.height = Math.min(100, chatInput.scrollHeight) + 'px';
    }

    async function sendMessage() {
      if (isSending) return;
      var message = (chatInput.value || '').trim();
      if (!message) return;

      isSending = true;
      chatInput.value = '';
      chatInput.style.height = 'auto';
      sendBtn.disabled = true;
      hideError();

      addUserMessage(message);
      showTyping();

      if (isContactRequest(message)) {
        hideTyping();
        showContactForm();
        isSending = false;
        sendBtn.disabled = false;
        return;
      }

      var botResponse = null;

      // Try Backend API with timeout
      try {
        var controller = new AbortController();
        var timeoutId = setTimeout(function() { controller.abort(); }, CONFIG.REQUEST_TIMEOUT);

        var response = await fetch(CONFIG.API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: message,
            session_id: getSessionId()
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response && response.ok) {
          var data = await response.json();
          if (data && data.response) {
            botResponse = data.response;
          }
        }
      } catch (e) {
        // Fallback to offline knowledge base seamlessly
      }

      // If backend didn't respond, use intelligent offline knowledge base
      if (!botResponse) {
        await new Promise(function(resolve) { setTimeout(resolve, CONFIG.TYPING_DELAY); });
        botResponse = generateOfflineResponse(message);
      }

      hideTyping();
      addBotMessage(botResponse);

      isSending = false;
      sendBtn.disabled = false;
      chatInput.focus();
    }

    function addUserMessage(text) {
      var time = formatTime(new Date());
      var messageHTML = `
        <div class="message user">
          <div class="message-avatar">You</div>
          <div class="message-content">
            <div class="message-bubble">${escapeHtml(text)}</div>
            <div class="message-time">${time}</div>
          </div>
        </div>
      `;
      chatMessages.insertAdjacentHTML('beforeend', messageHTML);
      scrollToBottom();
    }

    function addBotMessage(text) {
      var time = formatTime(new Date());
      var formattedText = formatBotMessage(text);
      var messageHTML = `
        <div class="message bot">
          <div class="message-avatar">BKL</div>
          <div class="message-content">
            <div class="message-bubble">${formattedText}</div>
            <div class="message-time">${time}</div>
          </div>
        </div>
      `;
      chatMessages.insertAdjacentHTML('beforeend', messageHTML);
      scrollToBottom();
    }

    function showTyping() {
      hideTyping();
      var typingHTML = `
        <div class="message bot" data-typing-msg="true">
          <div class="message-avatar">BKL</div>
          <div class="typing-indicator active">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
          </div>
        </div>
      `;
      chatMessages.insertAdjacentHTML('beforeend', typingHTML);
      scrollToBottom();
    }

    function hideTyping() {
      document.querySelectorAll('[data-typing-msg="true"]').forEach(function(el) {
        el.remove();
      });
    }

    function showContactForm() {
      var isTa = getCurrentLang() === 'ta';
      var formHTML = `
        <div class="message bot">
          <div class="message-avatar">BKL</div>
          <div class="message-content">
            <div class="message-bubble">
              <p style="margin: 0 0 10px;"><strong>${isTa ? 'எங்கள் கடன் ஆலோசனை நிபுணருடன் பேச:' : "I'd be glad to connect you with our loan advisory specialist!"}</strong></p>
              <p style="margin: 0 0 10px; font-size: 13px;">${isTa ? 'உங்கள் தொடர்பு விவரங்களை உள்ளிடவும்:' : 'Please share your details and we will call you back shortly:'}</p>
              <form id="contactForm" style="display: flex; flex-direction: column; gap: 8px;">
                <input type="text" id="leadName" placeholder="${isTa ? 'உங்கள் பெயர் (Full Name)' : 'Your Full Name'}" required 
                  style="padding: 8px 12px; border: 1px solid #CBD5E1; border-radius: 6px; font-size: 13px;">
                <input type="tel" id="leadPhone" placeholder="${isTa ? '10-இலக்க மொபைல் எண்' : '10-Digit Mobile Number'}" required pattern="[6-9][0-9]{9}" inputmode="numeric" maxlength="10"
                  style="padding: 8px 12px; border: 1px solid #CBD5E1; border-radius: 6px; font-size: 13px;">
                <select id="leadLoanType" required
                  style="padding: 8px 12px; border: 1px solid #CBD5E1; border-radius: 6px; font-size: 13px; background: white;">
                  <option value="">${isTa ? 'கடன் வகையை தேர்ந்தெடுக்கவும்' : 'Select Loan Type'}</option>
                  <option value="Home Loan">${isTa ? 'வீட்டுக் கடன் (Home Loan)' : 'Home Loan (₹5L - ₹1Cr)'}</option>
                  <option value="Loan Against Property">${isTa ? 'சொத்து கடன் (LAP)' : 'Loan Against Property (₹5L - ₹75L)'}</option>
                </select>
                <button type="submit" class="quick-reply-btn" 
                  style="background: var(--primary-navy); color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer; font-weight: 700;">
                  ${isTa ? 'விவரங்களை அனுப்பவும்' : 'Request Advisory Callback'}
                </button>
              </form>
              <p style="margin: 8px 0 0; font-size: 11px; color: #64748B;">
                🔒 Confidential inquiry. You can also call us directly at <a href="tel:8072294235" style="color: inherit; font-weight: 700;">8072294235</a>.
              </p>
            </div>
          </div>
        </div>
      `;
      chatMessages.insertAdjacentHTML('beforeend', formHTML);
      scrollToBottom();

      var cForm = document.getElementById('contactForm');
      if (cForm) {
        cForm.addEventListener('submit', async function(e) {
          e.preventDefault();
          var nameInput = document.getElementById('leadName');
          var phoneInput = document.getElementById('leadPhone');
          var loanTypeInput = document.getElementById('leadLoanType');

          var name = nameInput ? nameInput.value.trim() : '';
          var phone = phoneInput ? phoneInput.value.trim() : '';
          var loanType = loanTypeInput ? loanTypeInput.value : '';

          if (!name || !phone || !loanType) {
            showError('Please fill all required fields');
            return;
          }

          if (!/^[6-9]\d{9}$/.test(phone)) {
            showError('Please enter a valid 10-digit Indian mobile number');
            return;
          }

          var leadRecord = {
            name: name,
            phone: phone,
            loan_type: loanType,
            timestamp: new Date().toISOString()
          };

          // Save locally
          try {
            var existingLeads = JSON.parse(localStorage.getItem(CONFIG.LEADS_KEY) || '[]');
            existingLeads.push(leadRecord);
            localStorage.setItem(CONFIG.LEADS_KEY, JSON.stringify(existingLeads));
          } catch (err) {}

          // Attempt backend sync
          try {
            fetch(CONFIG.LEAD_API_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(leadRecord)
            }).catch(function() {});
          } catch (err) {}

          var successMsg = getCurrentLang() === 'ta' ?
            `✅ நன்றி ${escapeHtml(name)}! உங்கள் விவரங்கள் பெறப்பட்டது. எங்கள் ஆலோசகர் உங்களை 24 மணி நேரத்திற்குள் (${phone}) தொடர்புகொள்வார். அவசர ஆலோசனைக்கு அழைக்க: **8072294235**.` :
            `✅ Thank you ${escapeHtml(name)}! Your inquiry is noted. Our loan specialist will call you at **${phone}** shortly. You can also reach us directly at **8072294235**.`;

          addBotMessage(successMsg);
          cForm.remove();
        });
      }
    }

    function isContactRequest(message) {
      var keywords = ['talk', 'speak', 'expert', 'agent', 'representative', 'human', 'call me', 'contact', 'callback', 'பேச', 'அழைக்க'];
      var lower = (message || '').toLowerCase();
      return keywords.some(function(k) { return lower.includes(k); });
    }

    function showError(message) {
      if (!errorMessage) return;
      errorMessage.textContent = message;
      errorMessage.classList.add('active');
      setTimeout(function() { hideError(); }, 4000);
    }

    function hideError() {
      if (errorMessage) errorMessage.classList.remove('active');
    }

    function scrollToBottom() {
      setTimeout(function() {
        if (chatMessages) {
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }
      }, 50);
    }

    function formatTime(date) {
      try {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } catch (e) {
        return '';
      }
    }

    function escapeHtml(text) {
      var div = document.createElement('div');
      div.textContent = text || '';
      return div.innerHTML;
    }

    function formatBotMessage(text) {
      if (!text) return '';
      var s = String(text);
      s = s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      s = s.replace(/\*(.*?)\*/g, '<em>$1</em>');
      s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: var(--primary-navy); font-weight: 700; text-decoration: underline;">$1</a>');
      s = s.replace(/\n/g, '<br>');
      return s;
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbot);
  } else {
    initChatbot();
  }

})();
