import os
import re
import json
import PyPDF2
import docx2txt
import google.generativeai as genai
import environ
from dotenv import load_dotenv

load_dotenv()

# ==========================
#  Environment & Gemini API
# ==========================
env = environ.Env()
environ.Env.read_env()

MODEL_NAME = ("gemini-1.5-flash")
GOOGLE_API_KEY = "AIzaSyCp-FvHevyxPjipZg_lnV3ViDWGuWwtA54"
PROMPT_RESUME_ANALYSIS = os.getenv("PROMPT_RESUME_ANALYSIS", "").replace("\\n", "\n")

# Configure Google Generative AI
genai.configure(api_key=GOOGLE_API_KEY)
client = genai.GenerativeModel(model_name=MODEL_NAME)

# ==========================
#  Resume File Reading
# ==========================
def read_resume_from_file(file_path):
    text = ""
    if file_path.endswith(".txt"):
        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read()
    elif file_path.endswith(".pdf"):
        try:
            pdf = PyPDF2.PdfReader(file_path)
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        except Exception as e:
            raise ValueError(f"Error reading PDF: {str(e)}")
    elif file_path.endswith(".docx"):
        try:
            text = docx2txt.process(file_path)
        except Exception as e:
            raise ValueError(f"Error reading DOCX: {str(e)}")
    else:
        raise ValueError("Unsupported file type. Only TXT, PDF, DOCX allowed.")
    return text

# ==========================
#  Resume Cleaning
# ==========================
def clean_resume_text(text, max_words=2000):
    text = re.sub(r'(\r\n|\r|\n)+', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'http\S+|www\S+', '', text)
    text = re.sub(r'\S+@\S+', '', text)
    text = re.sub(r'[^\w\s\.\-]', ' ', text)
    text = text.strip()
    
    words = text.split()
    if len(words) > max_words:
        text = " ".join(words[:max_words])
    return text

# ==========================
#  Job Category Detection
# ==========================
def detect_job_category(resume_text):
    categories = {
        "Data Science": ["python", "machine learning", "pandas", "numpy", "scikit-learn", "nlp", "regression", "clustering", "tensorflow", "pytorch"],
        "Web Development": ["html", "css", "javascript", "react", "angular", "vue", "django", "flask", "node", "express"],
        "Mobile Development": ["android", "ios", "swift", "kotlin", "react native", "flutter"],
        "DevOps": ["docker", "kubernetes", "aws", "azure", "ci/cd", "jenkins", "terraform", "ansible"],
        "Backend Development": ["api", "rest", "graphql", "microservices", "database", "sql", "mongodb"],
        "Frontend Development": ["ui", "ux", "responsive", "bootstrap", "tailwind", "sass", "webpack"],
        "Finance": ["accounting", "audit", "financial", "tax", "risk", "investment"],
        "Marketing": ["seo", "social media", "campaign", "branding", "content", "digital marketing"]
    }
    
    resume_lower = resume_text.lower()
    detected = []
    
    for cat, keywords in categories.items():
        for kw in keywords:
            if kw in resume_lower:
                detected.append(cat)
                break
    
    return detected if detected else ["General"]

# ==========================
#  Structured Data Extraction
# ==========================
def extract_structured_data(ai_json):
    return {
        "contact_information": json.dumps(ai_json.get("name", "") + " | " + ai_json.get("email", "") + " | " + ai_json.get("phone_number", "")),
        "education": json.dumps(ai_json.get("education", [])),
        "experience": json.dumps(ai_json.get("work_experience", [])),
        "skills": json.dumps(ai_json.get("skills", [])),
        "projects": json.dumps(ai_json.get("projects", [])),
        "certifications": json.dumps(ai_json.get("certifications", [])),
    }

# ==========================
#  Score Calculation
# ==========================
def calculate_scores(ai_json):
    overall_score = ai_json.get("candidate_score", 0)
    grammar_score = max(0, min(100, overall_score - 10 + (len(ai_json.get("skills", [])) * 2)))
    keyword_match_score = min(100, len(ai_json.get("skills", [])) * 5)
    return {
        "overall_score": overall_score,
        "grammar_score": grammar_score,
        "keyword_match_score": keyword_match_score
    }

# ==========================
#  Basic Skill Extraction Fallback
# ==========================
def extract_basic_skills(text):
    """Basic skill extraction as fallback"""
    common_skills = {
        'python': 'Python',
        'javascript': 'JavaScript',
        'react': 'React',
        'java': 'Java',
        'sql': 'SQL',
        'html': 'HTML',
        'css': 'CSS',
        'docker': 'Docker',
        'aws': 'AWS',
        'git': 'Git',
        'linux': 'Linux'
    }

    found = []
    lower_text = text.lower()
    for kw, display in common_skills.items():
        if kw in lower_text:
            found.append(display)

    return found

# ==========================
#  Analyze Resume with Google Gemini
# ==========================
def analyze_resume_with_ai(file_path):
    resume_text = read_resume_from_file(file_path)
    clean_text = clean_resume_text(resume_text)

    job_categories = detect_job_category(clean_text)

    prompt_with_resume = PROMPT_RESUME_ANALYSIS.replace("{{RESUME_TEXT}}", clean_text)

    try:
        response = client.generate_content(prompt_with_resume)
        ai_output = response.text

        try:
            first_brace = ai_output.find("{")
            last_brace = ai_output.rfind("}")
            json_data = ai_output[first_brace:last_brace+1]
            ai_json = json.loads(json_data)
        except:
            ai_json = {
                "candidate_score": 50,
                "reasons_for_rejection": ["Failed to parse AI output"],
                "name": "",
                "email": "",
                "phone_number": "",
                "education": [],
                "work_experience": [],
                "skills": [],
                "certifications": [],
                "projects": []
            }
            ai_output = "Failed to parse AI response properly."

    except Exception as e:
        print(f"AI Error: {str(e)}")
        ai_output = f"Error during AI analysis: {str(e)}"
        # Fall back to basic analysis without AI
        ai_json = {
            "candidate_score": 45,  # Fallback score
            "reasons_for_rejection": [f"AI Analysis temporarily unavailable. Error: {str(e)}"],
            "name": "Unknown",
            "email": "",
            "phone_number": "",
            "education": [],
            "work_experience": [],
            "skills": extract_basic_skills(clean_text),
            "certifications": [],
            "projects": []
        }

    structured_data = extract_structured_data(ai_json)
    scores = calculate_scores(ai_json)

    suggestion = ai_output
    if "reasons_for_rejection" in ai_json and ai_json["reasons_for_rejection"]:
        suggestion += "\n\nAreas for Improvement:\n" + "\n".join([f"- {reason}" for reason in ai_json["reasons_for_rejection"]])

    return {
        "extracted_text": clean_text,
        "job_categories": job_categories,
        "overall_score": scores["overall_score"],
        "grammar_score": scores["grammar_score"],
        "keyword_match_score": scores["keyword_match_score"],
        "suggestion": suggestion,
        "contact_information": structured_data["contact_information"],
        "education": structured_data["education"],
        "experience": structured_data["experience"],
        "skills": structured_data["skills"],
        "projects": structured_data["projects"],
        "certifications": structured_data["certifications"],
    }
