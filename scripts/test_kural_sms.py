import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import kural

def test_sms_pipeline():
    print("============================================================")
    print("KONGU KURAL SMS PIPELINE (kural.py) VERIFICATION")
    print("============================================================\n")

    test_questions = [
        "When is Enthusia in KEC?",
        "What event is conducted on 19 March 2027?",
        "What is the date of Kongu Trophy?",
        "What happens if a student writes their name in the exam answer script?",
        "How many offers were received in 2025-2026 placements?",
        "How many offers did Soliton Technologies give?",
        "என்சியூசியா எப்போது நடைபெறும்?",
        "Swaram event eppo nadakkum?"
    ]

    all_passed = True
    for q in test_questions:
        print(f"\nIncoming SMS: \"{q}\"")
        ans = kural.generate_kural_answer(q)
        formatted = kural.clean_markdown_for_sms(ans)
        print("Generated & Cleaned SMS Reply:")
        print("---")
        print(formatted)
        print("---")
        print(f"Length: {len(formatted)} chars (Limit: {kural.MAX_SMS_TEXT_LENGTH})")

        if not formatted or len(formatted) < 10:
            print("=> FAIL: Empty or too short reply")
            all_passed = False
        elif len(formatted) > kural.MAX_SMS_TEXT_LENGTH:
            print("=> FAIL: Exceeds SMS length limit")
            all_passed = False
        else:
            print("=> PASS")

    if not all_passed:
        print("\nSOME SMS TESTS FAILED!")
        sys.exit(1)
    else:
        print("\n============================================================")
        print(f"ALL {len(test_questions)} SMS PIPELINE TESTS PASSED PERFECTLY!")
        print("============================================================\n")

if __name__ == "__main__":
    test_sms_pipeline()
