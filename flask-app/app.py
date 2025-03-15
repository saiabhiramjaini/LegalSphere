from flask import Flask, request, jsonify
import os
from langchain.text_splitter import CharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.prompts import PromptTemplate
from pypdf import PdfReader
from docx import Document
from dotenv import load_dotenv
import google.generativeai as genai
from together import Together
from flask_cors import CORS
from langdetect import detect

# Load environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
TOGETHER_AI_API = os.getenv("TOGETHER_AI_API_KEY")

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Initialize Together AI client
client = Together(api_key=TOGETHER_AI_API)

# Configure Gemini API
genai.configure(api_key=GEMINI_API_KEY)

# Load FAISS database with embeddings
embeddings = HuggingFaceEmbeddings(
    model_name="nomic-ai/nomic-embed-text-v1",
    model_kwargs={"trust_remote_code": True, "revision": "289f532e14dbbbd5a04753fa58739e9ba766f3c7"}
)
db = FAISS.load_local("ipc_vector_db", embeddings, allow_dangerous_deserialization=True)
db_retriever = db.as_retriever(search_type="similarity", search_kwargs={"k": 4})

# Utility Function: Call Gemini API for Summarization
def call_gemini_summarize(context=""):
    try:
        # Configure the generative model
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        # Create the prompt
        prompt = f"""You are an AI assistant skilled in document summarization. Provide a concise summary:
        - Highlight key points.
        - Avoid unnecessary repetition.
        - Make it easy to understand.
        
        Context: {context}"""
        
        # Generate the response
        response = model.generate_content(prompt)
        
        # Extract the text from the response
        return response.text
    except Exception as e:
        return f"Error calling Gemini API: {str(e)}"

# Utility Function: Extract Text from Uploaded File
def extract_text_from_file(file):
    try:
        file_extension = file.filename.split('.')[-1].lower()
        if file_extension == "pdf":
            return "".join(page.extract_text() or '' for page in PdfReader(file).pages)
        elif file_extension == "docx":
            return "\n".join(paragraph.text for paragraph in Document(file).paragraphs)
        elif file_extension == "txt":
            return file.read().decode('utf-8')
        else:
            return "Unsupported file type."
    except Exception as e:
        return f"Error reading file: {str(e)}"

# Utility Function: Process and Embed Text
def process_text(text):
    text_splitter = CharacterTextSplitter(separator="\n", chunk_size=1000, chunk_overlap=200, length_function=len)
    chunks = text_splitter.split_text(text)
    embeddings = HuggingFaceEmbeddings(model_name='sentence-transformers/all-MiniLM-L6-v2')
    return FAISS.from_texts(chunks, embeddings)

# API Route: Text Summarization Endpoint
@app.route('/summarize-text', methods=['POST'])
def summarize_text():
    # Check if the request has JSON data
    if request.is_json:
        text_input = request.json.get("text", "")
    else:
        text_input = request.form.get("text", "")
    

    if not text_input:
        return jsonify({"error": "Text input cannot be empty."}), 400
    
    knowledgebase = process_text(text_input)
    query = "What are the primary topics, arguments, and conclusions in this document?"
    docs = knowledgebase.similarity_search(query)
    context = docs[0].page_content if docs else text_input[:1000]
    summary = call_gemini_summarize(context)
    

    return jsonify({"summary": summary})

# API Route: Document Summarization Endpoint
@app.route('/summarize-doc', methods=['POST'])
def summarize_doc():
    uploaded_file = request.files.get("file")
    
    if not uploaded_file:
        return jsonify({"error": "Please provide a document file."}), 400
    
    text = extract_text_from_file(uploaded_file)
    if "Unsupported file type." in text or "Error reading file:" in text:
        return jsonify({"error": text}), 400
    
    knowledgebase = process_text(text)
    query = "What are the primary topics, arguments, and conclusions in this document?"
    docs = knowledgebase.similarity_search(query)
    context = docs[0].page_content if docs else text[:1000]
    summary = call_gemini_summarize(context)
    
    return jsonify({"summary": summary})

# Define Prompt Template for Legal Query Processing
prompt_template = """<s>[INST] You are an expert in the Indian Penal Code (IPC).
Your job is to classify the offense, identify relevant sections, and explain the punishment based on the provided query.

QUERY: {query}

Relevant Context:
{context}

Provide the output in the following format:
- Predicted Offense: [Classified offense]
- Relevant Legal Section: [Section details]
- Punishment: [Punishment description]
- Explanation: [Legal section explanation]
</s>[INST]"""

prompt = PromptTemplate(template=prompt_template, input_variables=["query", "context"])



LANGUAGE_PROMPTS = {
    "en": """<s>[INST] You are an expert in the Indian Penal Code (IPC).
Your job is to classify the offense, identify relevant sections, and explain the punishment based on the provided query.

QUERY: {query}

Relevant Context:
{context}

Provide the output in the following format:
- Predicted Offense: [Classified offense]
- Relevant Legal Section: [Section details]
- Punishment: [Punishment description]
- Explanation: [Legal section explanation]
</s>[INST]""",
    "hi": """<s>[INST] आप भारतीय दंड संहिता (IPC) के विशेषज्ञ हैं।
आपका काम प्रदान किए गए प्रश्न के आधार पर अपराध को वर्गीकृत करना, प्रासंगिक धाराओं की पहचान करना और सजा की व्याख्या करना है।

प्रश्न: {query}

प्रासंगिक संदर्भ:
{context}

निम्नलिखित प्रारूप में आउटपुट प्रदान करें:
- पूर्वानुमानित अपराध: [वर्गीकृत अपराध]
- प्रासंगिक कानूनी धारा: [धारा विवरण]
- सजा: [सजा विवरण]
- व्याख्या: [कानूनी धारा व्याख्या]
</s>[INST]""",
    "ta": """<s>[INST] நீங்கள் இந்திய தண்டனைச் சட்டம் (IPC) நிபுணர்.
உங்கள் பணி, வழங்கப்பட்ட கேள்வியின் அடிப்படையில் குற்றத்தை வகைப்படுத்துதல், தொடர்புடைய பிரிவுகளை அடையாளம் காணுதல் மற்றும் தண்டனையை விளக்குதல்.

கேள்வி: {query}

தொடர்புடைய சூழல்:
{context}

பின்வரும் வடிவத்தில் வெளியீட்டை வழங்கவும்:
- முன்னறிவிக்கப்பட்ட குற்றம்: [வகைப்படுத்தப்பட்ட குற்றம்]
- தொடர்புடைய சட்டப் பிரிவு: [பிரிவு விவரங்கள்]
- தண்டனை: [தண்டனை விளக்கம்]
- விளக்கம்: [சட்டப் பிரிவு விளக்கம்]
</s>[INST]""",
    "te": """<s>[INST] మీరు భారతీయ దండ స్మృతి (IPC) నిపుణుడు.
మీ పని, అందించిన ప్రశ్న ఆధారంగా నేరాన్ని వర్గీకరించడం, సంబంధిత సెక్షన్లను గుర్తించడం మరియు శిక్షను వివరించడం.

ప్రశ్న: {query}

సంబంధిత సందర్భం:
{context}

కింది ఫార్మాట్లో అవుట్పుట్ అందించండి:
- అంచనా వేసిన నేరం: [వర్గీకరించిన నేరం]
- సంబంధిత చట్టపరమైన సెక్షన్: [సెక్షన్ వివరాలు]
- శిక్ష: [శిక్ష వివరణ]
- వివరణ: [చట్టపరమైన సెక్షన్ వివరణ]
</s>[INST]""",
    "kn": """<s>[INST] ನೀವು ಭಾರತೀಯ ದಂಡ ಸಂಹಿತೆ (IPC) ನಲ್ಲಿ ಪರಿಣಿತರು.
ನಿಮ್ಮ ಕೆಲಸವೆಂದರೆ, ಒದಗಿಸಿದ ಪ್ರಶ್ನೆಯ ಆಧಾರದ ಮೇಲೆ ಅಪರಾಧವನ್ನು ವರ್ಗೀಕರಿಸುವುದು, ಸಂಬಂಧಿತ ವಿಭಾಗಗಳನ್ನು ಗುರುತಿಸುವುದು ಮತ್ತು ಶಿಕ್ಷೆಯನ್ನು ವಿವರಿಸುವುದು.

ಪ್ರಶ್ನೆ: {query}

ಸಂಬಂಧಿತ ಸಂದರ್ಭ:
{context}

ಕೆಳಗಿನ ಫಾರ್ಮ್ಯಾಟ್ನಲ್ಲಿ ಔಟ್ಪುಟ್ ನೀಡಿ:
- ಊಹಿಸಲಾದ ಅಪರಾಧ: [ವರ್ಗೀಕರಿಸಿದ ಅಪರಾಧ]
- ಸಂಬಂಧಿತ ಕಾನೂನು ವಿಭಾಗ: [ವಿಭಾಗ ವಿವರಗಳು]
- ಶಿಕ್ಷೆ: [ಶಿಕ್ಷೆಯ ವಿವರಣೆ]
- ವಿವರಣೆ: [ಕಾನೂನು ವಿಭಾಗದ ವಿವರಣೆ]
</s>[INST]""",
    "ml": """<s>[INST] നിങ്ങൾ ഇന്ത്യൻ ശിക്ഷാ സംഹിത (IPC) വിദഗ്ദ്ധനാണ്.
നൽകിയ ചോദ്യത്തിന്റെ അടിസ്ഥാനത്തിൽ കുറ്റകൃത്യം വർഗീകരിക്കുക, ബന്ധപ്പെട്ട വകുപ്പുകൾ തിരിച്ചറിയുക, ശിക്ഷ വിശദീകരിക്കുക എന്നതാണ് നിങ്ങളുടെ ജോലി.

ചോദ്യം: {query}

ബന്ധപ്പെട്ട സന്ദർഭം:
{context}

ഇനിപ്പറയുന്ന ഫോർമാറ്റിൽ ഔട്ട്പുട്ട് നൽകുക:
- പ്രവചിച്ച കുറ്റകൃത്യം: [വർഗീകരിച്ച കുറ്റകൃത്യം]
- ബന്ധപ്പെട്ട നിയമ വകുപ്പ്: [വകുപ്പ് വിവരങ്ങൾ]
- ശിക്ഷ: [ശിക്ഷ വിവരണം]
- വിശദീകരണം: [നിയമ വകുപ്പ് വിശദീകരണം]
</s>[INST]""",
    "bn": """<s>[INST] আপনি ভারতীয় দণ্ডবিধি (IPC) এর বিশেষজ্ঞ।
আপনার কাজ হল প্রদত্ত প্রশ্নের ভিত্তিতে অপরাধ শ্রেণীবদ্ধ করা, প্রাসঙ্গিক ধারা চিহ্নিত করা এবং শাস্তি ব্যাখ্যা করা।

প্রশ্ন: {query}

প্রাসঙ্গিক প্রসঙ্গ:
{context}

নিম্নলিখিত ফরম্যাটে আউটপুট প্রদান করুন:
- পূর্বাভাসিত অপরাধ: [শ্রেণীবদ্ধ অপরাধ]
- প্রাসঙ্গিক আইনী ধারা: [ধারা বিবরণ]
- শাস্তি: [শাস্তি বিবরণ]
- ব্যাখ্যা: [আইনী ধারা ব্যাখ্যা]
</s>[INST]""",
    "mr": """<s>[INST] तुम्ही भारतीय दंड संहिता (IPC) तज्ञ आहात.
तुमचे कार्य, प्रदान केलेल्या प्रश्नाच्या आधारे गुन्हा वर्गीकृत करणे, संबंधित कलमे ओळखणे आणि शिक्षेचे स्पष्टीकरण देणे.

प्रश्न: {query}

संबंधित संदर्भ:
{context}

खालील स्वरूपात आउटपुट द्या:
- अंदाजित गुन्हा: [वर्गीकृत गुन्हा]
- संबंधित कायदेशीर कलम: [कलम तपशील]
- शिक्षा: [शिक्षा वर्णन]
- स्पष्टीकरण: [कायदेशीर कलम स्पष्टीकरण]
</s>[INST]""",
    "gu": """<s>[INST] તમે ભારતીય દંડ સંહિતા (IPC) ના નિષ્ણાત છો.
તમારું કાર્ય, પૂરા પાડેલા પ્રશ્નના આધારે ગુનાને વર્ગીકૃત કરવો, સંબંધિત વિભાગોને ઓળખવા અને સજાને સમજાવવી.

પ્રશ્ન: {query}

સંબંધિત સંદર્ભ:
{context}

નીચેના ફોર્મેટમાં આઉટપુટ આપો:
- અનુમાનિત ગુનો: [વર્ગીકૃત ગુનો]
- સંબંધિત કાનૂની વિભાગ: [વિભાગ વિગતો]
- સજા: [સજા વર્ણન]
- સમજૂતી: [કાનૂની વિભાગ સમજૂતી]
</s>[INST]""",
    "pa": """<s>[INST] ਤੁਸੀਂ ਭਾਰਤੀ ਦੰਡ ਸੰਘਿਆ (IPC) ਦੇ ਮਾਹਿਰ ਹੋ.
ਤੁਹਾਡਾ ਕੰਮ, ਦਿੱਤੇ ਗਏ ਸਵਾਲ ਦੇ ਆਧਾਰ 'ਤੇ ਅਪਰਾਧ ਨੂੰ ਵਰਗੀਕ੍ਰਿਤ ਕਰਨਾ, ਸੰਬੰਧਿਤ ਧਾਰਾਵਾਂ ਦੀ ਪਛਾਣ ਕਰਨਾ ਅਤੇ ਸਜ਼ਾ ਦੀ ਵਿਆਖਿਆ ਕਰਨਾ ਹੈ.

ਸਵਾਲ: {query}

ਸੰਬੰਧਿਤ ਸੰਦਰਭ:
{context}

ਹੇਠ ਲਿਖੇ ਫਾਰਮੈਟ ਵਿੱਚ ਆਉਟਪੁੱਟ ਦਿਓ:
- ਅਨੁਮਾਨਿਤ ਅਪਰਾਧ: [ਵਰਗੀਕ੍ਰਿਤ ਅਪਰਾਧ]
- ਸੰਬੰਧਿਤ ਕਾਨੂੰਨੀ ਧਾਰਾ: [ਧਾਰਾ ਵੇਰਵੇ]
- ਸਜ਼ਾ: [ਸਜ਼ਾ ਵੇਰਵਾ]
- ਵਿਆਖਿਆ: [ਕਾਨੂੰਨੀ ਧਾਰਾ ਵਿਆਖਿਆ]
</s>[INST]""",
}


# Function to check if the response is in the expected language
def is_language_supported(text, expected_language):
    try:
        detected_language = detect(text)
        return detected_language == expected_language
    except:
        return False

# API Route: Legal Query Endpoint (RAG)
@app.route('/RAG', methods=['POST'])
def legal_query():
    data = request.get_json()
    query = data.get("query", "").strip()
    language = data.get("language", "en")  # Default to English if not provided

    if not query:
        return jsonify({"error": "Query cannot be empty."}), 400

    try:
        # Retrieve relevant documents
        context_docs = db_retriever.invoke(query)
        context = " ".join([doc.page_content for doc in context_docs])

        # Get the language-specific prompt
        prompt_template = LANGUAGE_PROMPTS.get(language, LANGUAGE_PROMPTS["en"])
        prompt = PromptTemplate(template=prompt_template, input_variables=["query", "context"])

        # Format the prompt
        formatted_prompt = prompt.format(query=query, context=context)

        # Generate response using Google Gemini
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        response = model.generate_content(formatted_prompt)

        final_response = response.text if response else "No response generated."

        # Check if the response is in the expected language
        if language != "en" and not is_language_supported(final_response, language):
            final_response = "Sorry, the response could not be generated in the selected language. Here is the response in English:\n\n" + final_response

        return jsonify({"query": query, "response": final_response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run Flask App
if __name__ == '__main__':
    app.run(debug=True)
