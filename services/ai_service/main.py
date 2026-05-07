import os
import logging
import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import requests
from dotenv import load_dotenv

load_dotenv()

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(title="RetailMind AI Intelligence Service")

# Add CORS Middleware
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    logger.warning("GEMINI_API_KEY not found in environment.")
else:
    genai.configure(api_key=GEMINI_API_KEY)

BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://backend:8000/api/v1/")

class QueryRequest(BaseModel):
    prompt: str
    store_id: int = 1

class InsightResponse(BaseModel):
    answer: str
    data_context: Optional[Dict[str, Any]] = None

@app.post("/api/v1/ai/query", response_model=InsightResponse)
async def query_retail_data(request: QueryRequest):
    """
    Endpoint to process natural language queries about retail data.
    """
    # 1. Fetch data from Backend
    try:
        # For now, we fetch store stats as our context
        stats_url = f"{BACKEND_API_URL}analytics/stores/{request.store_id}/stats/"
        response = requests.get(stats_url, timeout=5)
        response.raise_for_status()
        retail_data = response.json()
    except Exception as e:
        logger.error(f"Error fetching retail data: {e}")
        raise HTTPException(status_code=500, detail="Could not retrieve retail analytics for grounding.")

    # 2. Construct Grounded Prompt for Gemini
    context_str = str(retail_data)
    full_prompt = f"""
    You are the RetailMind AI Intelligence Assistant. 
    You provide factual, concise business insights based on the provided retail analytics data.
    
    Current Store Data Context (JSON):
    {context_str}
    
    User Question: {request.prompt}
    
    Instructions:
    - Use the data context to answer the question accurately.
    - If the data is not sufficient to answer, say so. Do not hallucinate.
    - Focus on KPIs like dwell time, zone occupancy, and visit counts.
    - Maintain a professional, executive tone.
    """

    # 3. Call Gemini
    try:
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(full_prompt)
        return InsightResponse(
            answer=response.text,
            data_context=retail_data
        )
    except Exception as e:
        logger.error(f"Gemini API Error: {e}")
        # Fallback for demo if API key is missing
        if not GEMINI_API_KEY:
             return InsightResponse(
                answer="[DEMO MODE] I see the following data: " + context_str + ". (Add GEMINI_API_KEY for full AI insights)",
                data_context=retail_data
            )
        raise HTTPException(status_code=500, detail="AI Service Error")

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "ai_service"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
