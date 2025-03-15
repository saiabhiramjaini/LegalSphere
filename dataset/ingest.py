import pandas as pd
from langchain_community.document_loaders import PyPDFLoader
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain.docstore.document import Document

# 1. Load the PDF file
pdf_path = "datasets/ipc-data.pdf"
pdf_loader = PyPDFLoader(pdf_path)
pdf_documents = pdf_loader.load()

# 2. Load the CSV file
csv_path = "datasets/final_dataset.csv"
df = pd.read_csv(csv_path)

# Combine relevant columns into text documents
# Adjust column names based on your CSV structure
csv_documents = df.apply(lambda row: " ".join(row.astype(str)), axis=1).tolist()

# Convert each CSV row into a LangChain Document format
csv_langchain_documents = [Document(page_content=text) for text in csv_documents]

# 3. Combine PDF and CSV documents
all_documents = pdf_documents + csv_langchain_documents

# 4. Split all documents into smaller chunks for better embeddings
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1024, chunk_overlap=200)
split_documents = text_splitter.split_documents(all_documents)

# 5. Generate embeddings
embeddings = HuggingFaceEmbeddings(
    model_name="nomic-ai/nomic-embed-text-v1",
    model_kwargs={"trust_remote_code": True, "revision": "289f532e14dbbbd5a04753fa58739e9ba766f3c7"}
)

# 6. Create and save vector embeddings into a single FAISS database
faiss_db = FAISS.from_documents(split_documents, embeddings)
faiss_db.save_local("ipc_vector_db")