# BKL Association Chatbot Setup Script
# Run this script to set up and start the chatbot

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  BKL Association AI Chatbot Setup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
Write-Host "[1/5] Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python not found! Please install Python 3.8+ from python.org" -ForegroundColor Red
    exit 1
}

# Check if pip is installed
Write-Host "`n[2/5] Checking pip installation..." -ForegroundColor Yellow
try {
    $pipVersion = pip --version 2>&1
    Write-Host "✓ pip found: $pipVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ pip not found! Please install pip" -ForegroundColor Red
    exit 1
}

# Install Python dependencies
Write-Host "`n[3/5] Installing Python dependencies..." -ForegroundColor Yellow
Write-Host "This may take a minute..." -ForegroundColor Gray
try {
    pip install -r requirements.txt --quiet
    Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    Write-Host "Run manually: pip install -r requirements.txt" -ForegroundColor Yellow
}

# Check for .env file
Write-Host "`n[4/5] Checking configuration..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✓ .env file found" -ForegroundColor Green
    
    # Check if API key is configured
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "your_openai_api_key_here" -or $envContent -notmatch "OPENAI_API_KEY=sk-") {
        Write-Host "⚠ WARNING: OpenAI API key not configured!" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "To configure your API key:" -ForegroundColor Cyan
        Write-Host "1. Get your key from: https://platform.openai.com/api-keys" -ForegroundColor White
        Write-Host "2. Edit .env file" -ForegroundColor White
        Write-Host "3. Replace 'your_openai_api_key_here' with your actual key" -ForegroundColor White
        Write-Host ""
        $configure = Read-Host "Do you want to open .env file now? (Y/N)"
        if ($configure -eq "Y" -or $configure -eq "y") {
            notepad .env
        }
    } else {
        Write-Host "✓ API key configured" -ForegroundColor Green
    }
} else {
    Write-Host "✗ .env file not found. Creating from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ Created .env file. Please add your OpenAI API key." -ForegroundColor Green
    notepad .env
}

# Instructions
Write-Host "`n[5/5] Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Start the chatbot backend:" -ForegroundColor Yellow
Write-Host "   python chatbot.py" -ForegroundColor White
Write-Host ""
Write-Host "2. Open index.html in your browser" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Click the chat button in bottom-right corner" -ForegroundColor Yellow
Write-Host ""
Write-Host "=== Important ===" -ForegroundColor Cyan
Write-Host "• Keep the Python server running while using the chatbot" -ForegroundColor White
Write-Host "• The chatbot requires an internet connection for AI responses" -ForegroundColor White
Write-Host "• See CHATBOT_README.md for detailed documentation" -ForegroundColor White
Write-Host ""
Write-Host "Ready to start? (Y/N): " -ForegroundColor Green -NoNewline
$start = Read-Host

if ($start -eq "Y" -or $start -eq "y") {
    Write-Host "`nStarting chatbot server..." -ForegroundColor Green
    python chatbot.py
} else {
    Write-Host "`nRun 'python chatbot.py' when you're ready to start!" -ForegroundColor Cyan
}
