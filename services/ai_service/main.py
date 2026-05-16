import os
import logging
import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Union
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
    data_context: Optional[Union[Dict[str, Any], List[Any]]] = None

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
        logger.error(f"Error fetching retail data from {stats_url}: {e}")
        raise HTTPException(status_code=500, detail="Could not retrieve retail analytics for grounding.")

    # 2. Construct Grounded Prompt for Gemini
    context_str = str(retail_data)
    full_prompt = f"""
    You are the RetailMind AI Intelligence Assistant. 
    You provide factual, concise business insights based on the provided retail analytics data.
    
    Current Store Data Context:
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
        if not GEMINI_API_KEY:
             logger.info("Running in DEMO MODE (no API key)")
             return InsightResponse(
                answer="[DEMO MODE] I see the following data: " + context_str + ". (Add GEMINI_API_KEY for full AI insights)",
                data_context=retail_data
            )
        
        # Resilient Model Selection Logic
        preferred_model = 'gemini-1.5-flash'
        try:
            logger.info(f"Attempting primary model: {preferred_model}")
            model = genai.GenerativeModel(preferred_model)
            response = model.generate_content(full_prompt)
        except Exception as primary_error:
            error_str = str(primary_error)
            logger.warning(f"Primary model {preferred_model} failed: {error_str}")
            
            # If 404 or Quota error, try to find an alternative
            if "404" in error_str or "429" in error_str:
                logger.info("Searching for available fallback 'flash' models...")
                try:
                    available_models = [m.name for m in genai.list_models() if 'flash' in m.name.lower() and 'generateContent' in m.supported_generation_methods]
                    if available_models:
                        fallback_model = available_models[0].replace('models/', '')
                        logger.info(f"Switching to fallback model: {fallback_model}")
                        model = genai.GenerativeModel(fallback_model)
                        response = model.generate_content(full_prompt)
                    else:
                        raise primary_error
                except Exception as fallback_error:
                    logger.error(f"Fallback selection failed: {fallback_error}")
                    raise primary_error
            else:
                raise primary_error
        
        logger.info("Gemini response received successfully")
        
        answer = response.text if response.text else "Gemini was unable to generate an insight based on the current data."
        
        return InsightResponse(
            answer=answer,
            data_context=retail_data
        )
    except Exception as e:
        logger.error(f"Gemini API Error: {str(e)}")
        
        # Diagnostic: If it's a 404, list all available models for debugging
        if "404" in str(e):
            try:
                all_models = [m.name for m in genai.list_models()]
                logger.info(f"All available models: {all_models}")
            except:
                pass
                
        if hasattr(e, 'message'):
            logger.error(f"Error Message: {e.message}")
        raise HTTPException(status_code=500, detail=f"AI Service Error: {str(e)}")

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "ai_service"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
