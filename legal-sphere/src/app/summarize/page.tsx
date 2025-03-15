"use client";

import type React from "react";

import { useState } from "react";
import axios from "axios";
import {
  FileText,
  AlignLeft,
  FileUp,
  X,
  Check,
  AlertCircle,
  Copy,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function SummarizePage() {
  const [text, setText] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState<boolean>(false);
  const [loadingDoc, setLoadingDoc] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"text" | "document">("text");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
  };

  const handleTextSummarize = async () => {
    if (!text.trim()) {
      setError("Please enter text to summarize.");
      return;
    }

    setLoadingText(true);
    setSummary(null);
    setError(null);

    try {
      const response = await axios.post<{ summary: string }>(
        "http://127.0.0.1:5000/summarize-text",
        { text },
        { headers: { "Content-Type": "application/json" } }
      );

      setSummary(response.data.summary);
    } catch (err) {
      setError("Failed to summarize text.");
      console.error(err);
    } finally {
      setLoadingText(false);
    }
  };

  const handleDocumentSummarize = async () => {
    if (!file) {
      setError("Please select a file to summarize.");
      return;
    }

    setLoadingDoc(true);
    setSummary(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post<{ summary: string }>(
        "http://127.0.0.1:5000/summarize-doc",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setSummary(response.data.summary);
    } catch (err) {
      setError("Failed to summarize document.");
      console.error(err);
    } finally {
      setLoadingDoc(false);
    }
  };

  const clearAll = () => {
    setText("");
    setFile(null);
    setSummary(null);
    setError(null);
  };

  const copyToClipboard = () => {
    if (summary) {
      navigator.clipboard.writeText(summary);
      // You could add a toast notification here
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-indigo-600 text-white p-6">
          <h1 className="text-2xl font-semibold">Document Summarization</h1>
          <p className="text-indigo-100 text-sm mt-1">
            Get concise summaries of your text or documents
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`flex items-center px-6 py-3 text-sm font-medium ${
              activeTab === "text"
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("text")}
          >
            <AlignLeft className="h-4 w-4 mr-2" />
            Text Summarization
          </button>
          <button
            className={`flex items-center px-6 py-3 text-sm font-medium ${
              activeTab === "document"
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("document")}
          >
            <FileText className="h-4 w-4 mr-2" />
            Document Summarization
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {/* Text Input Tab */}
            {activeTab === "text" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="text-input"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Enter Text
                  </label>
                  <textarea
                    id="text-input"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[200px] text-gray-800"
                    rows={6}
                    placeholder="Paste or type text to summarize..."
                    value={text}
                    onChange={handleTextChange}
                    disabled={loadingText}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleTextSummarize}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors duration-200 flex items-center justify-center font-medium"
                  disabled={loadingText || !text.trim()}
                >
                  {loadingText ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Summarizing...
                    </>
                  ) : (
                    <>Summarize Text</>
                  )}
                </button>
              </div>
            )}

            {/* Document Input Tab */}
            {activeTab === "document" && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                    id="file-upload"
                    onChange={handleFileChange}
                    disabled={loadingDoc}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <FileUp className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-700">
                      Drag and drop or click to upload
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Supports PDF, DOCX, DOC, TXT (Max 10MB)
                    </p>
                  </label>
                </div>

                {file && (
                  <div className="flex items-center justify-between bg-indigo-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-indigo-600 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-800 truncate max-w-[200px]">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setFile(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleDocumentSummarize}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors duration-200 flex items-center justify-center font-medium"
                  disabled={loadingDoc || !file}
                >
                  {loadingDoc ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Summarizing...
                    </>
                  ) : (
                    <>Summarize Document</>
                  )}
                </button>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Results Section */}
            {summary && (
              <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-800 flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    Summary
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={copyToClipboard}
                      className="text-gray-500 hover:text-gray-700 p-1"
                      title="Copy to clipboard"
                    >
                      <Copy className="h-5 w-5" />
                    </button>
                    <button
                      onClick={clearAll}
                      className="text-gray-500 hover:text-gray-700 p-1"
                      title="Clear"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="p-4 bg-white">
                  <p className="text-gray-800 whitespace-pre-line">
                    <ReactMarkdown>{summary}</ReactMarkdown>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
