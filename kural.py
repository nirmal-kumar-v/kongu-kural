"""Kongu Kural — SMS Campus Assistant for Kongu Engineering College (KEC).

Runs alongside the Kongu Kural chatbot website.
Listens for incoming SMS via the Android SMS Gateway at http://100.75.195.58:8080,
generates accurate answers using the existing AI pipeline & college-info.txt,
and replies via SMS in the student's language (Tamil, Tanglish, English, Hindi).

Usage:
    python kural.py           # Interactive menu (SMS Mode or Test Mode)
    python kural.py --test    # Direct Test Mode (Terminal simulation, no real SMS)
    python kural.py --sms     # Direct SMS Mode (Listens on SMS Gateway)
"""

import base64
import hashlib
import json
import os
import re
import socket
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

# Enable UTF-8 console output on Windows for Tamil, Hindi & Unicode support
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
if hasattr(sys.stderr, "reconfigure"):
    try:
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# ============================== CONFIGURATION ==============================

BASE_DIR = Path(__file__).resolve().parent
ENV_FILE = BASE_DIR / ".env"
COLLEGE_INFO_FILE = BASE_DIR / "college-info.txt"
STATE_FILE = BASE_DIR / "kural_sms_state.json"

def load_env():
    env_vars = {}
    if ENV_FILE.exists():
        try:
            with open(ENV_FILE, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#") or "=" not in line:
                        continue
                    key, val = line.split("=", 1)
                    key = key.strip()
                    val = val.strip().strip('"').strip("'")
                    env_vars[key] = val
                    if key not in os.environ:
                        os.environ[key] = val
        except Exception as e:
            pass
    return env_vars

ENV = load_env()

# Website Backend URL (Reuses the existing website's full AI & knowledge pipeline)
WEBSITE_PORT = ENV.get("PORT", "5000")
WEBSITE_API_URL = f"http://localhost:{WEBSITE_PORT}/api/chat"
WEBSITE_STATUS_URL = f"http://localhost:{WEBSITE_PORT}/api/status"

# SMS Gateway Configuration
GATEWAY_URL = ENV.get("SMS_GATEWAY_URL", "http://192.168.3.57:8080")
GATEWAY_USERNAME = ENV.get("SMS_GATEWAY_USERNAME", "SETU")
GATEWAY_PASSWORD = ENV.get("SMS_GATEWAY_PASSWORD", "setu1234")
SIM_NUMBER = int(ENV.get("SMS_SIM_NUMBER", "1"))

POLL_INTERVAL_SECONDS = 3
INBOX_LIMIT = 50
MAX_SMS_TEXT_LENGTH = 1400

# Direct API Keys Fallback (In case website server is not running)
GEMINI_KEYS = [
    k for k in [
        ENV.get("GEMINI_API_KEY_1"),
        ENV.get("GEMINI_API_KEY_2"),
        ENV.get("GEMINI_API_KEY_3"),
        ENV.get("GEMINI_API_KEY"),
    ] if k and not k.startswith("your_") and not k.startswith("PASTE_")
]
GEMINI_MODEL = ENV.get("GEMINI_MODEL", "gemini-2.5-flash")

GROQ_KEYS = [
    k for k in [
        ENV.get("GROQ_API_KEY_1"),
        ENV.get("GROQ_API_KEY_2"),
        ENV.get("GROQ_API_KEY_3"),
        ENV.get("GROQ_API_KEY"),
    ] if k and not k.startswith("your_") and not k.startswith("PASTE_")
]
GROQ_MODEL = ENV.get("GROQ_MODEL", "llama-3.3-70b-versatile")

_state_lock = threading.RLock()
recent_sent_texts = set()

# ============================== LOGGING & UTILS ==============================

def log(msg):
    t = time.strftime("[%H:%M:%S]")
    print(f"{t} {msg}", flush=True)


def normalized_phone(value):
    digits = re.sub(r"\D", "", str(value or ""))
    return digits[-10:] if len(digits) >= 10 else digits


def is_valid_student_phone(sender: str) -> bool:
    """Filter out alphanumeric bank SMS, OTP headers, and service sender IDs (e.g. AX-AIRBNK-S)."""
    s = str(sender or "").strip()
    if not s:
        return False
    # If it contains alphabetical characters (e.g. AX-AIRBNK-S, VM-HAIERe), it's automated
    if re.search(r"[a-zA-Z]", s):
        return False
    # Must have at least 8 digits (valid phone number)
    digits = re.sub(r"\D", "", s)
    return len(digits) >= 8


def clean_markdown_for_sms(text: str) -> str:
    """Format markdown into clean, readable plain-text suitable for mobile SMS."""
    if not text:
        return ""

    lines = text.split("\n")
    cleaned_lines = []

    for line in lines:
        stripped = line.strip()
        if stripped.startswith("|") and stripped.endswith("|"):
            if re.match(r"^\|[-:\s|]+\|$", stripped):
                continue
            cells = [c.strip() for c in stripped.split("|")[1:-1]]
            if cells:
                cleaned_lines.append("• " + " | ".join(cells))
            continue

        # Clean markdown links: [Title](url) -> Title
        line = re.sub(r"\[([^\]]+)\]\([^\)]+\)", r"\1", line)

        # Clean headers
        line = re.sub(r"^#{1,6}\s+", "", line)
        # Clean bold / italics / code blocks
        line = re.sub(r"\*\*([^*]+)\*\*", r"\1", line)
        line = re.sub(r"\*([^*]+)\*", r"\1", line)
        line = re.sub(r"`([^`]+)`", r"\1", line)

        # Omit lines that just instruct the user to visit websites
        if re.search(r"^(please\s+)?(visit|refer to|check)\s+(the\s+)?(official\s+)?(website|link|portal)", line.strip(), re.IGNORECASE):
            continue

        cleaned_lines.append(line)

    result = "\n".join(cleaned_lines)
    result = re.sub(r"\n{3,}", "\n\n", result).strip()
    return result


# ============================== STATE MANAGEMENT ==============================

def message_key(sms):
    raw = "|".join([
        str(sms.get("id", "")),
        str(sms.get("sender", "")),
        str(sms.get("from", "")),
        str(sms.get("createdAt", "")),
        str(sms.get("timestamp", "")),
        str(sms.get("date", "")),
        message_sender(sms),
        message_text(sms),
    ])
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def message_text(sms):
    for field in ("contentPreview", "text", "message", "body", "content"):
        val = sms.get(field)
        if isinstance(val, str) and val.strip():
            return val.strip()
    return ""


def message_sender(sms):
    for field in ("sender", "from", "phoneNumber", "address"):
        val = sms.get(field)
        if isinstance(val, str) and val.strip():
            return val.strip()
    return ""


def is_outgoing(sms):
    """Detect if an SMS in the inbox is an outgoing sent message from this phone."""
    t = str(sms.get("type", "")).lower()
    if t in ("sent", "outgoing", "out"):
        return True
    if sms.get("isOutgoing") is True or sms.get("outgoing") is True:
        return True
    folder = str(sms.get("folder", "")).lower()
    if folder in ("sent", "outbox"):
        return True
    direction = str(sms.get("direction", "")).lower()
    if direction in ("out", "outgoing"):
        return True
    return False


def load_state():
    if not STATE_FILE.exists():
        return set(), set()
    try:
        with open(STATE_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return set(data.get("seen_keys", [])), set(data.get("paused_senders", []))
    except Exception:
        return set(), set()


def save_state(seen_keys, paused_senders):
    temp = STATE_FILE.with_suffix(".tmp")
    data = {
        "seen_keys": sorted(list(seen_keys))[-1500:],  # Retain last 1500 keys
        "paused_senders": sorted(list(paused_senders)),
    }
    with open(temp, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    temp.replace(STATE_FILE)


# ============================== SMS GATEWAY API ==============================

def auth_headers():
    credentials = f"{GATEWAY_USERNAME}:{GATEWAY_PASSWORD}".encode("utf-8")
    auth = base64.b64encode(credentials).decode("ascii")
    return {
        "Authorization": f"Basic {auth}",
        "Accept": "application/json",
        "User-Agent": "KonguKural-SMS/1.0",
    }


def gateway_request(method, path, payload=None, timeout=4, base_url=None):
    target_base = (base_url or GATEWAY_URL).rstrip("/")
    url = target_base + path
    headers = auth_headers()
    data = None

    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"

    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            raw = response.read().decode("utf-8", errors="replace")
            if not raw.strip():
                return None
            try:
                return json.loads(raw)
            except json.JSONDecodeError:
                return raw
    except Exception:
        return None


def fetch_inbox():
    global GATEWAY_URL
    query = urllib.parse.urlencode({"type": "SMS", "limit": INBOX_LIMIT, "offset": 0})
    result = gateway_request("GET", f"/inbox?{query}", base_url=GATEWAY_URL)

    # Silent fallback between 192.168.3.57 and 100.75.195.58
    if result is None:
        candidates = ["http://192.168.3.57:8080", "http://100.75.195.58:8080"]
        for c in candidates:
            if c != GATEWAY_URL:
                test_res = gateway_request("GET", f"/inbox?{query}", base_url=c)
                if test_res is not None:
                    GATEWAY_URL = c
                    result = test_res
                    break

    if isinstance(result, list):
        return result
    if isinstance(result, dict):
        for name in ("messages", "items", "inbox", "data"):
            if isinstance(result.get(name), list):
                return result[name]
    return []


def send_sms_reply(phone_number, text, app_mode):
    """Send SMS reply to the user or show in terminal if in test mode."""
    formatted_reply = clean_markdown_for_sms(text)
    if len(formatted_reply) > MAX_SMS_TEXT_LENGTH:
        formatted_reply = formatted_reply[:MAX_SMS_TEXT_LENGTH - 10] + "..."

    recent_sent_texts.add(formatted_reply[:100].strip().lower())

    if app_mode == "TEST":
        print("\n" + "=" * 60)
        print(f"KONGU KURAL SMS REPLY (Simulated -> {phone_number})")
        print("=" * 60)
        print(formatted_reply)
        print("=" * 60 + "\n")
        return

    payload = {
        "textMessage": {"text": formatted_reply},
        "phoneNumbers": [phone_number],
    }
    if SIM_NUMBER and SIM_NUMBER in (1, 2):
        payload["simNumber"] = SIM_NUMBER

    res = gateway_request("POST", "/message", payload)
    log(f"SMS reply sent to {phone_number}. Gateway status: {res}")


# ============================== AI PIPELINE ==============================

def get_answer_from_website_api(question: str) -> dict:
    """Query the active Kongu Kural website Express backend (zero duplication)."""
    payload = json.dumps({"message": question, "history": []}).encode("utf-8")
    req = urllib.request.Request(
        WEBSITE_API_URL,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=25) as res:
        return json.loads(res.read().decode("utf-8"))


def standalone_answer_fallback(question: str) -> str:
    """Fallback if website server is not running: reads college-info.txt and uses Groq/Gemini."""
    info_text = ""
    if COLLEGE_INFO_FILE.exists():
        try:
            info_text = COLLEGE_INFO_FILE.read_text(encoding="utf-8")
        except Exception:
            pass

    # Extract most relevant sections across the whole 140KB file rather than just the top
    selected_context = ""
    if info_text:
        tokens = [t.lower() for t in re.findall(r"\w+", question) if len(t) > 2]
        sections = re.split(r"\n(?=[#A-Z0-9\s]{2,60}:?\n)", info_text)
        scored_sections = []
        for sec in sections:
            sec_lower = sec.lower()
            score = sum(3 for t in tokens if t in sec_lower)
            if any(dept in question.lower() for dept in ["mech", "auto", "mechatronics", "civil", "eee", "ece", "cse", "it", "chemical", "food", "mba", "mca", "aiml", "aids"]):
                if any(dept in sec_lower for dept in ["mech", "auto", "mechatronics", "civil", "eee", "ece", "cse", "it", "chemical", "food", "mba", "mca", "aiml", "aids"]) and ("placed" in sec_lower or "salary" in sec_lower or "lpa" in sec_lower):
                    score += 50
            if score > 0:
                scored_sections.append((score, sec))
        scored_sections.sort(key=lambda x: x[0], reverse=True)
        top_chunks = [s[1] for s in scored_sections[:6]]
        selected_context = "\n\n---\n\n".join(top_chunks) if top_chunks else info_text[:14000]

    common_rules = (
        "RULES:\n"
        "1. If the user question is CLEARLY UNRELATED to KEC or college life (e.g. general trivia, politics, recipes, entertainment, personal tasks), reply with EXACTLY: 'Ask anything related to KEC.' (Do NOT add apologies, explanations, or extra sentences).\n"
        "2. For KEC-related questions (including indirect questions about hostels, fees, admissions, placements, departments, wardens, bus, sports): Answer directly in the EXACT SAME LANGUAGE they used (Tamil, English, Tanglish, Hindi).\n"
        "3. EXACT RELEVANCE: If asked for CUTOFF / cut-off marks, provide the CUTOFF MARKS out of 200 (e.g. CSE: 185–193+ out of 200, ECE/EEE: 175–184). NEVER substitute rank when cutoff is asked! If asked for rank, give rank.\n"
        "4. DEPARTMENT-SPECIFIC PLACEMENT ACCURACY: When asked about placement, salary package, or placement statistics for a specific department (e.g. Mechanical, Mechatronics, Automobile, Civil, EEE, EIE, ECE, CSE, IT, Chemical, Food Tech, MBA, MCA, AI&DS, AI&ML, CSD), give that department's exact figures from the records (students placed, minimum, maximum, average salary). NEVER use the general college-wide ₹5.6 LPA default for specific departments.\n"
        "5. STRICT DEPARTMENT FACULTY MATCHING: When asked about staff or faculty members in a specific department (e.g. Information Technology / IT), return ONLY verified faculty members of THAT department. NEVER return or mix staff members from other departments (such as EIE, EEE, ECE, CSE, Mech).\n"
        "6. If a KEC detail is absent from the file, state that the information could not be verified in official college records. Do NOT invent facts or apologize.\n"
        "7. Provide just the right amount of information (concrete facts, names, contacts, fees). Do NOT dump huge irrelevant rosters or walls of text, and do NOT give lazy one-word replies.\n"
        "8. NEVER tell the user to visit the website, check links, or find information themselves. Give the actual data directly.\n\n"
    )

    # Try Groq with failover
    for key in GROQ_KEYS:
        try:
            prompt = (
                "You are Kongu Kural, the direct campus assistant for Kongu Engineering College (KEC).\n"
                + common_rules
                + "Source of truth from college-info.txt:\n"
                + selected_context[:16000]
                + "\n\n"
                + f"Question: {question}"
            )
            body = {
                "model": GROQ_MODEL,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.2,
            }
            req = urllib.request.Request(
                "https://api.groq.com/openai/v1/chat/completions",
                data=json.dumps(body).encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {key}",
                },
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=20) as r:
                res = json.loads(r.read().decode("utf-8"))
                return res["choices"][0]["message"]["content"]
        except Exception:
            pass

    # Try Gemini with failover
    for key in GEMINI_KEYS:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={key}"
            prompt = (
                "You are Kongu Kural, the direct campus assistant for Kongu Engineering College (KEC).\n"
                + common_rules
                + f"Context from college-info.txt:\n{selected_context[:16000]}\n\n"
                + f"Question: {question}"
            )
            body = {"contents": [{"parts": [{"text": prompt}]}]}
            req = urllib.request.Request(
                url,
                data=json.dumps(body).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=20) as r:
                res = json.loads(r.read().decode("utf-8"))
                return res["candidates"][0]["content"]["parts"][0]["text"]
        except Exception:
            pass

    return "Kongu Kural: We are currently unable to generate an answer. Please try again shortly or contact KEC office."


def generate_kural_answer(question: str) -> str:
    """Unified answer generator: uses website API first, falls back to standalone."""
    try:
        data = get_answer_from_website_api(question)
        answer = data.get("answer", "")
        # Return only the direct answer text without injecting website links or source tags into the SMS
        return answer.strip()
    except Exception:
        return standalone_answer_fallback(question)


# ============================== INCOMING MESSAGE HANDLER ==============================

def handle_incoming_sms(sender, text, paused_senders, app_mode):
    sender = str(sender or "").strip()
    text = str(text or "").strip()

    if not sender or not text:
        return

    # Ignore automated bank alerts, OTPs, promotional headers (e.g. AX-AIRBNK-S)
    if not is_valid_student_phone(sender):
        return

    # Prevent loop if message text is identical to our own recent replies
    if text[:100].strip().lower() in recent_sent_texts:
        return

    norm_sender = normalized_phone(sender)
    command = text.casefold().strip()

    if command == "stop":
        with _state_lock:
            paused_senders.add(norm_sender)
        send_sms_reply(
            sender,
            "Kongu Kural SMS updates are paused. Text START anytime to ask questions again.",
            app_mode
        )
        log(f"Paused replies for sender: {sender}")
        return

    if command in ("start", "help", "vanakkam", "hi", "hello"):
        with _state_lock:
            paused_senders.discard(norm_sender)
        send_sms_reply(
            sender,
            "வணக்கம்! Welcome to Kongu Kural (KEC Campus Assistant).\n"
            "Ask any question about hostels, admissions, wardens, sports, or departments in Tamil, Tanglish, or English!\n"
            "(Reply STOP to pause)",
            app_mode
        )
        log(f"Sent welcome to sender: {sender}")
        return

    with _state_lock:
        if norm_sender in paused_senders:
            return

    log(f"[Processing Question] From: {sender} | Content: \"{text}\"")
    try:
        answer = generate_kural_answer(text)
    except Exception as e:
        answer = "Sorry, an issue occurred while processing your request. Please try again in a few moments."

    send_sms_reply(sender, answer, app_mode)


# ============================== MODES ==============================

def choose_mode():
    if "--test" in sys.argv:
        return "TEST"
    if "--sms" in sys.argv:
        return "SMS"

    print("\n" + "=" * 60)
    print("       KONGU KURAL — CAMPUS SMS ASSISTANT")
    print("=" * 60)
    print("1. SMS MODE  - Listen for real SMS & reply via Mobile Gateway")
    print("2. TEST MODE - Test questions directly in Terminal (No real SMS)")
    print("=" * 60)

    while True:
        try:
            choice = input("Choose mode (1 or 2): ").strip().lower()
        except (KeyboardInterrupt, EOFError):
            sys.exit(0)
        if choice in ("1", "sms", "s"):
            return "SMS"
        if choice in ("2", "test", "t"):
            return "TEST"
        print("Please enter 1 for SMS mode or 2 for Test mode.")


def run_test_mode():
    test_sender = "+919842820583"
    paused_senders = set()

    print("\n" + "=" * 60)
    print("TEST MODE STARTED (Terminal Simulation)")
    print("=" * 60)
    print("No real SMS messages will be sent.")
    print("Questions will be answered using the live Kongu Kural knowledge & AI system.")
    print()
    print("Commands:")
    print("  <any question> - Ask in English, Tamil, or Tanglish")
    print("  STATUS         - Check website server & knowledge file status")
    print("  STOP           - Test STOP command")
    print("  START          - Test START command")
    print("  EXIT           - Quit test mode")
    print("=" * 60)

    while True:
        try:
            incoming = input("\nIncoming SMS > ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\nExiting test mode.")
            break

        if not incoming:
            continue

        if incoming.casefold() in ("exit", "quit"):
            print("Test mode ended.")
            break

        if incoming.casefold() == "status":
            try:
                with urllib.request.urlopen(WEBSITE_STATUS_URL, timeout=3) as r:
                    st = json.loads(r.read())
                    print(f"Website Server: {st.get('status', 'online')}")
                    print(f"Knowledge File Chunks: {st.get('knowledgeFile', {}).get('totalChunks')}")
                    print(f"Detected Sections: {len(st.get('knowledgeFile', {}).get('sections', []))}")
            except Exception as e:
                print(f"Website Server: Offline ({e}) - Standalone fallback active.")
            continue

        handle_incoming_sms(
            sender=test_sender,
            text=incoming,
            paused_senders=paused_senders,
            app_mode="TEST"
        )


def run_sms_mode():
    log("Kongu Kural SMS Assistant started.")
    log(f"Target Gateway: {GATEWAY_URL}")
    log(f"SIM Slot: {SIM_NUMBER}")
    log(f"Website API: {WEBSITE_API_URL}")
    log("Listening for incoming student questions in real-time...\n")

    seen_keys, paused_senders = load_state()

    # Pre-populate seen_keys on first startup if empty
    initial_inbox = fetch_inbox()
    now_ms = time.time() * 1000
    fifteen_mins_ago = now_ms - (15 * 60 * 1000)

    pending_to_process = []
    for item in initial_inbox:
        key = message_key(item)
        if key in seen_keys:
            continue
        if is_outgoing(item):
            seen_keys.add(key)
            continue

        msg_time = item.get("date") or item.get("timestamp") or item.get("createdAt")
        is_recent = True
        if msg_time:
            try:
                t_val = float(msg_time)
                if t_val < 10000000000:
                    t_val *= 1000
                if t_val < fifteen_mins_ago:
                    is_recent = False
            except Exception:
                pass

        if is_recent and message_text(item) and is_valid_student_phone(message_sender(item)):
            pending_to_process.append(item)
        else:
            seen_keys.add(key)

    save_state(seen_keys, paused_senders)

    # Process any recent unhandled messages
    if pending_to_process:
        log(f"Found {len(pending_to_process)} recent student message(s) in inbox. Replying now:")
        for sms in pending_to_process:
            key = message_key(sms)
            text = message_text(sms)
            sender = message_sender(sms)
            handle_incoming_sms(sender, text, paused_senders, app_mode="SMS")
            seen_keys.add(key)
            save_state(seen_keys, paused_senders)

    while True:
        try:
            inbox = fetch_inbox()
            inbox = list(reversed(inbox))  # Process oldest first

            for sms in inbox:
                key = message_key(sms)
                if key in seen_keys:
                    continue

                if is_outgoing(sms):
                    seen_keys.add(key)
                    save_state(seen_keys, paused_senders)
                    continue

                text = message_text(sms)
                sender = message_sender(sms)

                if not text or not sender or not is_valid_student_phone(sender):
                    seen_keys.add(key)
                    save_state(seen_keys, paused_senders)
                    continue

                log(f"[INCOMING SMS] From: {sender} | Content: \"{text}\"")

                handle_incoming_sms(sender, text, paused_senders, app_mode="SMS")

                seen_keys.add(key)
                save_state(seen_keys, paused_senders)

        except KeyboardInterrupt:
            log("Stopping SMS service...")
            break
        except Exception:
            # Silently pass without flooding cmd with timeouts
            pass

        time.sleep(POLL_INTERVAL_SECONDS)


def main():
    mode = choose_mode()
    if mode == "TEST":
        run_test_mode()
    else:
        run_sms_mode()


if __name__ == "__main__":
    main()
