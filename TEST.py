import os
from dotenv import load_dotenv
import ollama
import re
import PyPDF2  # For reading PDFs
import docx2txt  # For reading DOCX files
import json

# ---------------- Load .env ----------------
load_dotenv()
MODEL_NAME = os.getenv("MODEL_NAME", "qwen3:4b")
PROMPT_RESUME_ANALYSIS = os.getenv("PROMPT_RESUME_ANALYSIS").replace("\\n", "\n")

# ---------------- File reading ----------------
def read_resume(file_path):
    text = ""
    if file_path.endswith(".txt"):
        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read()
    elif file_path.endswith(".pdf"):
        pdf = PyPDF2.PdfReader(file_path)
        for page in pdf.pages:
            text += page.extract_text() + "\n"
    elif file_path.endswith(".docx"):
        text = docx2txt.process(file_path)
    else:
        raise ValueError("Unsupported file type. Only TXT, PDF, DOCX allowed.")
    return text

# ---------------- Clean Resume ----------------
def clean_resume_text(text, max_words=2000):
    # Normalize line breaks
    text = re.sub(r'(\r\n|\r|\n)+', ' ', text)
    # Remove multiple spaces
    text = re.sub(r'\s+', ' ', text)
    # Remove URLs
    text = re.sub(r'http\S+|www\S+', '', text)
    # Remove emails
    text = re.sub(r'\S+@\S+', '', text)
    # Remove special characters except basic punctuation
    text = re.sub(r'[^\w\s\.\-]', ' ', text)
    text = text.strip()
    # Truncate to max_words for faster AI inference
    words = text.split()
    if len(words) > max_words:
        text = " ".join(words[:max_words])
    return text

# ---------------- Job Category Detection ----------------
def detect_job_category(resume_text):
    categories = {
        "Data Science": ["python", "machine learning", "pandas", "numpy", "scikit-learn", "nlp", "regression", "clustering"],
        "Web Development": ["html", "css", "javascript", "react", "angular", "django", "flask"],
        "DevOps": ["docker", "kubernetes", "aws", "ci/cd", "jenkins", "terraform"],
        "Finance": ["accounting", "audit", "financial", "tax", "risk"],
        "Marketing": ["seo", "social media", "campaign", "branding"]
    }
    resume_lower = resume_text.lower()
    detected = []
    for cat, keywords in categories.items():
        for kw in keywords:
            if kw in resume_lower:
                detected.append(cat)
                break
    return detected if detected else ["Unknown"]

# ---------------- Main Resume Analysis ----------------
def analyze_resume(file_path):
    # Read and clean resume
    resume_text = read_resume(file_path)
    clean_text = clean_resume_text(resume_text)

    # Detect job categories
    job_categories = detect_job_category(clean_text)

    # Prepare prompt with truncated resume
    prompt_with_resume = PROMPT_RESUME_ANALYSIS.replace("{{RESUME_TEXT}}", clean_text)

    # Call Ollama model
    response = ollama.chat(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": prompt_with_resume},
            {"role": "user", "content": clean_text}
        ],
        # Uncomment below if you have GPU support in Ollama
        # device="cuda"
    )

    ai_output = response["message"]["content"]

    # Try to parse JSON from AI output
    try:
        first_brace = ai_output.find("{")
        last_brace = ai_output.rfind("}")
        json_data = ai_output[first_brace:last_brace+1]
        ai_json = json.loads(json_data)
    except:
        ai_json = {"error": "Failed to parse AI output as JSON", "raw_output": ai_output}

    return {
        "job_categories": job_categories,
        "ai_json": ai_json,
        "ai_raw": ai_output
    }

# ---------------- Example Usage ----------------
if __name__ == "__main__":
    file_path = input("Enter path to resume file (TXT, PDF, DOCX): ").strip()
    if not os.path.exists(file_path):
        print("File does not exist. Please check the path.")
    else:
        result = analyze_resume(file_path)
        print("\n--- Detected Job Categories ---")
        print(result["job_categories"])
        print("\n--- AI Resume Analysis (Parsed JSON) ---")
        print(json.dumps(result["ai_json"], indent=4))
        print("\n--- AI Resume Analysis (Raw Output) ---")
        print(result["ai_raw"])
