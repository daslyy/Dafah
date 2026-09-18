from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

# ─────────────────────────────────────
# GET TIME-BASED GREETING
# ─────────────────────────────────────
def get_greeting():
    hour = datetime.now().hour
    if hour < 12:
        return "Good Morning"
    elif hour < 18:
        return "Good Afternoon"
    else:
        return "Good Evening"


# ─────────────────────────────────────
# CHAT ROUTE
# ─────────────────────────────────────
@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}
    message = data.get("message", "").lower()
    print("MESSAGE RECEIVED:", message)

    user = data.get("user", {})
    print("USER DATA:", user)
    name = user.get("name", "Customer")
    account_number = user.get("accountNumber", "0000000000")
    balance = user.get("balance", 0)

    # ── GREETING ──
    if any(word in message for word in ["hello", "hi", "hey"]):
       reply = f"""
       {get_greeting()}, Customer!<br><br>
       Welcome to <strong>Dafah Bank 24/7 Customer Service</strong>.<br>
       How may I assist you today?
       """

    # ── NAME ──
    elif "my name" in message:
        reply = f"Your registered name is <strong>{name}</strong>."

    # ── WHO AM I ──
    elif "who am i" in message:
      reply = f"You are <strong>{name}</strong>, a valued Dafah Bank customer. 🌟"

    # ── ACCOUNT NUMBER ──
    elif "account number" in message:
        reply = f"""
        Your Dafah Bank account number is:<br><br>
        <strong style="font-size:18px;">{account_number}</strong>
        """

    # ── BALANCE ──
    elif "balance" in message:
        reply = f"""
        Your available balance is:<br><br>
        <strong style="color:#16a34a; font-size:20px;">
          ₦{balance:,.2f}
        </strong>
        """
     # ── TRANSACTION (REDIRECT) ──
    elif "transaction" in message or "history" in message:
        print("MESSAGE RECEIVED:", message)
        reply = "REDIRECT_TRANSACTIONS"

     
     # ── STATEMENT (REDIRECT) ──
    elif "statement" in message:
        reply = "REDIRECT_STATEMENT"

         # ── LOAN ──
    elif "loan" in message:
        reply = """
        <strong>Dafah Loan Services 💰</strong><br><br>
        Dafah Loan is designed to help eligible customers access financial support when needed.<br><br>

        <strong>Benefits include:</strong><br>
        • Fast and easy application process<br>
        • Flexible repayment options<br>
        • Competitive interest rates<br>
        • Secure and transparent loan management<br>
        • Quick approval for eligible customers<br><br>

        Customers can visit the Loan section in the dashboard for more details.
        """

    # ── ABOUT DAFAH ──
    elif "about" in message or "dafah" in message:
        reply = """
        <strong>About Dafah Bank 🏦</strong><br><br>
        Dafah Bank is a modern digital banking platform designed to provide secure, fast, and convenient financial services to customers.<br><br>

        <strong>Our services include:</strong><br>
        • Free Dafah-to-Dafah transfers<br>
        • Local bank transfers<br>
        • Global money transfers to supported countries<br>
        • Secure account management<br>
        • Real-time balance monitoring<br>
        • Transaction history tracking<br>
        • Account statement generation<br>
        • Loan services<br>
        • 24/7 AI Customer Support<br>
        • Fast and secure digital banking experience<br><br>

        Global transfers typically arrive within <strong>1–3 business days</strong>.<br><br>

        Dafah Bank is committed to making banking <strong>simple, secure, and reliable</strong>. 🌍
        """

    # ── FALLBACK ──
    else:
        reply = """
        I'm sorry, I didn't understand that 🤔<br><br>
        Try asking about:<br>
        • Balance<br>
        • Account Number<br>
        • About Dafah<br>
        • Loan<br>
        • Transactions<br>
        • Statement
        """

    return jsonify({"reply": reply})


# For Vercel
# This makes the app importable as WSGI
