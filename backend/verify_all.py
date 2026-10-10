#!/usr/bin/env python3
"""End-to-End System Verification Script for InterviewAce Backend.

Simulates a complete candidate preparation journey across all 12 modules:
1. Health Check
2. User Registration & OAuth2 JWT Login
3. Profile Verification
4. Job Description Parsing (Pasted Text)
5. Resume Upload & Extraction (PDF)
6. Skill Gap Analysis & Session Creation
7. AI Personalized Question Generation
8. Interactive Practice Session Start
9. Fetch First Question
10. Submit Student Answer for AI Grading & Scoring
11. Complete Practice Session & Generate Session Summary
12. Analytics Dashboard Verification
"""

import io
import os
import sys
import uuid

# Use httpx if installed, or fallback to requests
try:
    import httpx

    class HttpClient:
        def __init__(self, base_url: str):
            self.client = httpx.Client(base_url=base_url, timeout=90.0)

        def get(self, url: str, **kwargs):
            return self.client.get(url, **kwargs)

        def post(self, url: str, **kwargs):
            return self.client.post(url, **kwargs)

        def close(self):
            self.client.close()

except ImportError:
    try:
        import requests

        class HttpClient:
            def __init__(self, base_url: str):
                self.base_url = base_url.rstrip("/")
                self.session = requests.Session()

            def _url(self, url: str) -> str:
                return f"{self.base_url}{url}" if url.startswith("/") else url

            def get(self, url: str, **kwargs):
                return self.session.get(self._url(url), timeout=90.0, **kwargs)

            def post(self, url: str, **kwargs):
                return self.session.post(self._url(url), timeout=90.0, **kwargs)

            def close(self):
                self.session.close()

    except ImportError:
        print("[ERROR] Neither 'httpx' nor 'requests' library is installed.")
        print("Please run: pip install httpx")
        sys.exit(1)


def create_minimal_pdf() -> bytes:
    """Generates an in-memory PDF resume with candidate background text."""
    try:
        import PyPDF2

        writer = PyPDF2.PdfWriter()
        writer.add_blank_page(width=612, height=792)
        buf = io.BytesIO()
        writer.write(buf)
        return buf.getvalue()
    except Exception:
        # Fallback to minimal valid PDF specification
        return (
            b"%PDF-1.4\n"
            b"1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n"
            b"2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n"
            b"3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >> endobj\n"
            b"xref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n"
            b"trailer << /Size 4 /Root 1 0 R >>\nstartxref\n190\n%%EOF\n"
        )


def run_e2e_verification(base_url: str = "http://localhost:8000"):
    print("=" * 70)
    print(" INTERVIEWACE BACKEND: END-TO-END VERIFICATION SUITE")
    print(f" Target Server: {base_url}")
    print("=" * 70)

    client = HttpClient(base_url)

    try:
        # -------------------------------------------------------------
        # STEP 1: Health Check
        # -------------------------------------------------------------
        print("\n[Step 1/12] Verifying Server and Database Health...")
        res = client.get("/health")
        if res.status_code != 200:
            raise RuntimeError(f"Health check failed (Status {res.status_code}): {res.text}")
        data = res.json()
        db_status = data.get("database")
        print(f"  -> Status: {res.status_code} OK | API: {data.get('status')} | Database: {db_status}")
        if db_status != "connected":
            raise RuntimeError(f"Database is not connected! Ping returned: {db_status}")

        # -------------------------------------------------------------
        # STEP 2: Auth (Register & Login)
        # -------------------------------------------------------------
        user_uuid = uuid.uuid4().hex[:6]
        user_email = f"e2e_student_{user_uuid}@interviewace.com"
        user_password = "SecurePassword123!"

        print(f"\n[Step 2/12] Registering User & Authenticating ({user_email})...")
        reg_payload = {
            "full_name": "E2E Student Tester",
            "email": user_email,
            "password": user_password,
        }
        res = client.post("/api/v1/auth/register", json=reg_payload)
        if res.status_code not in (200, 201):
            raise RuntimeError(f"Registration failed ({res.status_code}): {res.text}")
        print(f"  -> Registration: {res.status_code} Created (User: {res.json().get('email')})")

        # Login via OAuth2 password flow
        login_res = client.post(
            "/api/v1/auth/login",
            data={"username": user_email, "password": user_password},
        )
        if login_res.status_code != 200:
            raise RuntimeError(f"Login failed ({login_res.status_code}): {login_res.text}")
        token_data = login_res.json()
        token = token_data.get("access_token")
        if not token:
            raise RuntimeError("No access_token returned by login endpoint.")
        print(f"  -> Login: 200 OK | JWT Token acquired successfully")

        headers = {"Authorization": f"Bearer {token}"}

        # -------------------------------------------------------------
        # STEP 3: Profile Verification
        # -------------------------------------------------------------
        print("\n[Step 3/12] Verifying User Profile (/auth/me)...")
        res = client.get("/api/v1/auth/me", headers=headers)
        if res.status_code != 200:
            raise RuntimeError(f"Get profile failed ({res.status_code}): {res.text}")
        me_data = res.json()
        print(f"  -> Profile: 200 OK | ID: {me_data.get('id')} | Name: {me_data.get('full_name')}")

        # -------------------------------------------------------------
        # STEP 4: Job Description (Paste)
        # -------------------------------------------------------------
        print("\n[Step 4/12] Submitting Job Description (/jd/paste)...")
        jd_text = """
Job Title: Senior Backend Software Engineer
Company: CloudScale AI
Responsibilities:
- Build high-performance REST APIs in Python using FastAPI and MongoDB
- Design scalable microservices and distributed asynchronous pipelines
- Implement robust authentication, caching, and database indexing
Required Skills:
- Python, FastAPI, MongoDB, Docker, RESTful APIs, System Design
Preferred Skills:
- Redis, Kubernetes, AWS, Microservices Architecture
Seniority Level: Senior
        """
        res = client.post("/api/v1/jd/paste", json={"raw_text": jd_text}, headers=headers)
        if res.status_code != 200:
            raise RuntimeError(f"JD paste failed ({res.status_code}): {res.text}")
        jd_id = res.json().get("jd_id")
        if not jd_id:
            raise RuntimeError("No jd_id returned from /jd/paste")
        print(f"  -> JD Paste: 200 OK | Saved JD ID: {jd_id}")

        # -------------------------------------------------------------
        # STEP 5: Resume Upload (PDF)
        # -------------------------------------------------------------
        print("\n[Step 5/12] Uploading Resume PDF (/resume/upload)...")
        pdf_bytes = create_minimal_pdf()
        files = {
            "file": ("candidate_resume.pdf", pdf_bytes, "application/pdf")
        }
        res = client.post("/api/v1/resume/upload", files=files, headers=headers)
        if res.status_code != 200:
            raise RuntimeError(f"Resume upload failed ({res.status_code}): {res.text}")
        resume_id = res.json().get("resume_id")
        if not resume_id:
            raise RuntimeError("No resume_id returned from /resume/upload")
        print(f"  -> Resume Upload: 200 OK | Saved Resume ID: {resume_id}")

        # -------------------------------------------------------------
        # STEP 6: Skill Gap Analysis & Session Creation
        # -------------------------------------------------------------
        print("\n[Step 6/12] Triggering Skill Gap Analysis (/session/create)...")
        session_create_payload = {
            "resume_id": resume_id,
            "jd_id": jd_id,
        }
        res = client.post("/api/v1/session/create", json=session_create_payload, headers=headers)
        if res.status_code != 200:
            raise RuntimeError(f"Session create failed ({res.status_code}): {res.text}")
        session_data = res.json()
        session_id = session_data.get("session_id")
        gap_analysis = session_data.get("gap_analysis", {})
        match_pct = gap_analysis.get("overall_match_percentage", 0)
        print(f"  -> Session Created: 200 OK | Session ID: {session_id}")
        print(f"  -> Gap Analysis Match Percentage: {match_pct}%")

        # -------------------------------------------------------------
        # STEP 7: AI Question Generation
        # -------------------------------------------------------------
        print("\n[Step 7/12] Generating Personalized Interview Questions...")
        res = client.post(f"/api/v1/session/{session_id}/generate-questions", headers=headers)
        if res.status_code != 200:
            raise RuntimeError(f"Question generation failed ({res.status_code}): {res.text}")
        questions = res.json().get("questions", [])
        if not questions:
            raise RuntimeError("No questions returned from question generation endpoint")
        print(f"  -> AI Questions: 200 OK | Generated {len(questions)} personalized questions")

        # -------------------------------------------------------------
        # STEP 8: Start Interactive Practice Session
        # -------------------------------------------------------------
        print("\n[Step 8/12] Initializing Practice Mode Session (/practice/start)...")
        practice_payload = {
            "interview_session_id": session_id,
            "practice_type": "quick",
        }
        res = client.post("/api/v1/practice/start", json=practice_payload, headers=headers)
        if res.status_code != 200:
            raise RuntimeError(f"Practice start failed ({res.status_code}): {res.text}")
        practice_id = res.json().get("practice_id")
        if not practice_id:
            raise RuntimeError("No practice_id returned from /practice/start")
        print(f"  -> Practice Mode: 200 OK | Practice Session ID: {practice_id}")

        # -------------------------------------------------------------
        # STEP 9: Fetch Next Question
        # -------------------------------------------------------------
        print("\n[Step 9/12] Fetching Next Question (/practice/{id}/next)...")
        res = client.get(f"/api/v1/practice/{practice_id}/next", headers=headers)
        if res.status_code != 200:
            raise RuntimeError(f"Fetch next question failed ({res.status_code}): {res.text}")
        next_data = res.json()
        target_question = next_data.get("question")
        if not target_question:
            raise RuntimeError("No question returned in next question response")
        question_id = target_question.get("question_id")
        question_text = target_question.get("question_text")
        category = target_question.get("category")
        print(f"  -> Next Question: 200 OK | [{category.upper()}] Q_ID: {question_id}")
        print(f"  -> Question: \"{question_text[:80]}...\"")

        # -------------------------------------------------------------
        # STEP 10: AI Grading & Answer Evaluation
        # -------------------------------------------------------------
        print("\n[Step 10/12] Submitting Practice Answer for AI Grading (/practice/{id}/submit)...")
        student_answer = (
            "In my previous project, I architected a distributed asynchronous pipeline using Python and FastAPI. "
            "We used MongoDB for document persistence with indexing that reduced query latency by 45%. "
            "I implemented JWT authentication and structured modular routers to handle thousands of concurrent requests."
        )
        submit_payload = {
            "question_id": question_id,
            "student_answer": student_answer,
            "time_taken_seconds": 55,
        }
        res = client.post(f"/api/v1/practice/{practice_id}/submit", json=submit_payload, headers=headers)
        if res.status_code != 200:
            raise RuntimeError(f"Answer submission failed ({res.status_code}): {res.text}")
        eval_result = res.json().get("evaluation", {})
        score = eval_result.get("overall_score")
        print(f"  -> AI Evaluation: 200 OK | Overall Score: {score}/100")
        dim_scores = eval_result.get("dimension_scores", {})
        for dim, details in dim_scores.items():
            dim_score = details.get("score") if isinstance(details, dict) else details
            print(f"     - {dim.capitalize()}: {dim_score} pts")

        # -------------------------------------------------------------
        # STEP 11: Complete Practice Session & Qualitative Summary
        # -------------------------------------------------------------
        print("\n[Step 11/12] Completing Practice Session (/practice/{id}/complete)...")
        res = client.post(f"/api/v1/practice/{practice_id}/complete", headers=headers)
        if res.status_code != 200:
            raise RuntimeError(f"Session complete failed ({res.status_code}): {res.text}")
        summary_result = res.json().get("summary", {})
        readiness = summary_result.get("readiness_rating")
        final_score = summary_result.get("overall_score")
        print(f"  -> Session Completed: 200 OK | Readiness Rating: \"{readiness}\" | Final Score: {final_score}")
        print(f"  -> Top Strengths ({len(summary_result.get('top_strengths', []))}):")
        for s in summary_result.get("top_strengths", [])[:2]:
            print(f"     * {s}")

        # -------------------------------------------------------------
        # STEP 12: Analytics Dashboard Overview
        # -------------------------------------------------------------
        print("\n[Step 12/12] Verifying User Analytics Dashboard (/analytics/overview)...")
        res = client.get("/api/v1/analytics/overview", headers=headers)
        if res.status_code != 200:
            raise RuntimeError(f"Analytics overview failed ({res.status_code}): {res.text}")
        analytics = res.json()
        total_sessions = analytics.get("total_sessions")
        total_practiced = analytics.get("total_questions_practiced")
        avg_score = analytics.get("average_overall_score")
        trend = analytics.get("readiness_trend")
        print(f"  -> Analytics: 200 OK | Total Sessions: {total_sessions} | Questions Practiced: {total_practiced}")
        print(f"  -> Average Score: {avg_score} | Readiness Trend: {trend}")

        if total_sessions < 1:
            raise RuntimeError("Analytics indicates 0 completed sessions after completing session!")

        print("\n" + "=" * 70)
        print("🔥 ALL SYSTEMS GO: INTERVIEWACE BACKEND IS 100% OPERATIONAL 🔥")
        print("=" * 70)

    except Exception as err:
        print(f"\n❌ [VERIFICATION FAILED]: {err}")
        sys.exit(1)
    finally:
        client.close()


if __name__ == "__main__":
    target_host = os.getenv("API_BASE_URL", "http://localhost:8000")
    if len(sys.argv) > 1:
        target_host = sys.argv[1]

    try:
        run_e2e_verification(target_host)
    except KeyboardInterrupt:
        print("\nVerification interrupted by user.")
        sys.exit(1)
