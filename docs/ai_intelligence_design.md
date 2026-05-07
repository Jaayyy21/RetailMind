# AI Intelligence Architecture: Grounded Retail Insights

## 1. The "Data-to-Insight" Pipeline
To ensure factual accuracy and avoid LLM hallucinations, we follow a strict **Structured Grounding** approach:

1.  **Natural Language Query:** User asks "Which zone was busiest in the last hour?"
2.  **Schema Mapping:** The AI Service identifies the intent and relevant tables (Zones, Events).
3.  **Data Extraction:** Instead of passing raw events to the LLM (context bloat), the AI Service executes a specific SQL/ORM aggregation on the Backend.
4.  **Context Construction:** The **aggregated data** (e.g., {"Entrance": 50, "Aisle": 12}) is passed to Gemini as a system prompt.
5.  **Reasoning & Synthesis:** Gemini generates a professional summary based *only* on the provided JSON context.

## 2. Hallucination Prevention Strategy
- **Restricted System Prompt:** Gemini is instructed to respond with "Insufficient data" if the requested insight isn't present in the context.
- **Structured Context:** We pass JSON-formatted metrics to the LLM, not raw text, ensuring the model's attention is focused on the quantitative data.
- **No Direct DB Access:** The AI service communicates via a dedicated internal "Analytics Summary API" in the backend, preventing the LLM from executing arbitrary or destructive queries.

## 3. Microservice Scalability
- **Isolation:** The `ai_service` is CPU/GPU independent. It can be scaled separately from the CV service.
- **Statelessness:** The service doesn't store query history (in Phase 3.0), making it easy to replicate.
- **Latency Management:** Long-running report generation is handled as an async task, returning a "Processing" status to the frontend.

## 4. Future RAG & Vector DB Integration
While we currently use structured SQL grounding, the architecture is ready for **Unstructured RAG**:
- **Embeddings:** Store retail employee handbooks or store layout descriptions in **ChromaDB**.
- **Hybrid Querying:** Combine real-time metrics (SQL) with static knowledge (Vector DB) to answer complex questions like: *"Why is the checkout congested based on our standard operating procedures?"*
