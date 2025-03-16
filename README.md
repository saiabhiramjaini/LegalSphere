# LegalSphere

Legal Space is an AI-powered system designed to assist users with legal queries and document summarization. The application provides three main features:

1. **Lawyer Advice** - Users can see the advocates, lawyers and contact them for any legal related queries.
2. **Legal Queries** - A Retrieval-Augmented Generation (RAG) based system that retrieves relevant legal sections and generates responses using LLaMA via Together AI.
3. **Document Summarization** - Upload legal documents or input text to get concise summaries powered by Gemini AI.



### Tech Stack

- **Frontend:** NextJS, TailwindCSS, ShadCN UI
- **Backend:** Flask, FAISS, LangChain, Hugging Face, Gemini API, Together AI API

- **Authentication:** NextAuth
- **Database:** FAISS for vector-based retrieval


## Installation & Setup

### Prerequisites

- Python 3.11+

- NodeJS

- Clone the repo:

```
git clone https://github.com/saiabhiramjaini/LegalSphere .
```

#### Frontend:

- Go to legal-sphere directory:

   ```
   cd legal-sphere
   ```

- Install dependencies:
  ```bash
  npm i
  ```
- Set up environment variables:
  ```bash
   DATABASE_URL=

   GOOGLE_CLIENT_ID = 
   GOOGLE_CLIENT_SECRET = 
   NEXTAUTH_URL=
   NEXTAUTH_SECRET=
  ```

- Run the app:
  ```
  npm run dev
  ```

#### Backend:

- Go to flask-app directoty:

   ```
   cd flask-app
   ```

- Setup a virtual environment:
   ```
   python -m venv .venv
   ```
   For macOS:
   ```
   source .venv/bin/activate

   ```
   For Windows:
   ```
   .venv\Scripts\Activate

   ```

- Install dependencies:
  ```bash
  pip install -r requirements.txt
  ```
- Set up environment variables:
  ```bash
   TOGETHER_AI_API_KEY = 
   GEMINI_API_KEY = 
  ```

- Run the server:
  ```
  python app.py
  ```


## Features

### 1. Legal Queries (RAG-Based System)

- The user inputs a legal query.
- FAISS retrieves the most relevant legal documents based on similarity search.
- The query and retrieved context are formatted into a structured prompt.
- The formatted prompt is passed to Together AI's LLaMA model for response generation.
- The generated legal response is returned to the user.

### 2. Document Summarization

- The user uploads a legal document (PDF, DOCX, TXT) or inputs text manually.
- Text is extracted and split into smaller chunks.
- FAISS is used to store and retrieve relevant document segments.
- A predefined query extracts the core information from the document.
- The retrieved context is passed to Gemini AI for summarization.
- A structured summary is generated and displayed.

### 3. Lawyer Advice

- Users can search for lawyers by name, city, or practice area.

- Filters are available to narrow down results by state and practice area.

- The list of lawyers updates in real-time based on the search query and selected filters.


- Displays active filters (e.g., search term, selected state, or practice area) with options to remove individual filters or clear all.


## Architecture & Workflow

![Image](https://github.com/user-attachments/assets/af9cf8cd-99e2-4c1f-8732-9e952522a0af)


1. **Frontend Interface**: 
   - The system starts with a React-based frontend that offers four main pages: Home, Legal Advice, Chatbot, and Summarization
   - The frontend uses Google Auth for authentication and is hosted on Vercel

2. **Data Ingestion**:
   - A separate data ingestion module handles PDF and CSV files
   - These documents are processed and sent to the backend

3. **API Communication**:
   - The frontend makes API calls to the backend services
   - These calls transmit user requests and receive responses

4. **Backend Processing**:
   - The backend contains the LegalSphere API with three main components:
     - Legal Query: Processes legal questions and requests
     - Text Summarization: Condenses legal text
     - Doc Summarization: Creates summaries of legal documents

5. **Vector Database**:
   - The system uses a vector database (labeled "jpc_vector_db")
   - Legal documents are retrieved from this database
   - The database is populated with vectors from the data ingestion process

6. **External Services Integration**:
   - The system connects to external AI services:
     - Gemini API: Used to generate summaries and legal responses
     - Together AI: Provides additional AI capabilities

7. **Data Flow**:
   - Legal documents are ingested → converted to vectors → stored in database
   - User queries trigger retrieval from the database
   - Retrieved information is processed with AI services
   - Results are returned to the frontend for display






## API Documentation

#### Base URL
`http://<your-server-address>:<port>`


### Endpoints

#### 1. **Summarize Text or Document**
#### **Endpoint**: `/summarize-text` (POST)  
**Description**: Summarizes the provided text or document.  
**Body**:
- **JSON Input** (for text summarization):
  ```json
  {
    "text": "<Your text content here>"
  }
  ```
- **Form Data** (for file upload):
  - `file`: `<Upload a PDF, DOCX, or TXT file>`

**Response**:
```json
{
  "summary": "<Generated summary>"
}
```

**Example Request**:
```bash
curl -X POST http://localhost:5000/summarize-text -H "Content-Type: application/json" -d '{"text": "Your long legal document text here..."}'
```

**Example Response**:
```json
{
  "summary": "The document discusses key legal principles related to..."
}
```

---

#### 2. **Summarize Uploaded Document**
#### **Endpoint**: `/summarize-doc` (POST)  
**Description**: Summarizes the content of an uploaded document (PDF, DOCX, or TXT).  
**Body**:
- **Form Data**:
  - `file`: `<Upload a PDF, DOCX, or TXT file>`

**Response**:
```json
{
  "summary": "<Generated summary>"
}
```

**Example Request**:
```bash
curl -X POST http://localhost:5000/summarize-doc -F "file=@/path/to/your/document.pdf"
```

**Example Response**:
```json
{
  "summary": "The uploaded document outlines the legal framework for..."
}
```

---

#### 3. **Retrieve Legal Context and Answer Queries (RAG)**
#### **Endpoint**: `/RAG` (POST)  
**Description**: Retrieves relevant legal context and answers queries based on the Indian Penal Code (IPC).  
**Body**:
```json
{
  "query": "<Your legal query here>",
  "language": "<Optional: Language code (e.g., 'en', 'hi', 'ta', etc.)>"
}
```

**Response**:
```json
{
  "query": "<Your legal query>",
  "response": "<Generated legal response>"
}
```

**Example Request**:
```bash
curl -X POST http://localhost:5000/RAG -H "Content-Type: application/json" -d '{"query": "What is the punishment for theft under IPC?", "language": "hi"}'
```

**Example Response**:
```json
{
  "query": "What is the punishment for theft under IPC?",
  "response": "चोरी के लिए IPC धारा 378 के तहत सजा..."
}
```



### Supported Languages for `/RAG` Endpoint
The `/RAG` endpoint supports multiple languages for query responses. The default language is English (`en`). Supported language codes include:
- English (`en`)
- Hindi (`hi`)
- Tamil (`ta`)
- Telugu (`te`)
- Kannada (`kn`)
- Malayalam (`ml`)
- Bengali (`bn`)
- Marathi (`mr`)
- Gujarati (`gu`)
- Punjabi (`pa`)

---

