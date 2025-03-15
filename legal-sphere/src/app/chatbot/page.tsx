"use client"

import axios from "axios"
import type React from "react"
import { useState, useRef, useEffect } from "react"
import ReactMarkdown from "react-markdown"

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string; timestamp: Date }[]>([])
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<any>(null)
  const recognitionRef = useRef<any>(null)
  const [language, setLanguage] = useState("en"); 

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  
  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser does not support speech recognition. Please use Google Chrome or Microsoft Edge.");
      return;
    }
  
    // Request microphone access
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(() => {
        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.continuous = false; // Set to false to stop after one utterance
        recognition.interimResults = false;
        recognition.lang = "en-US";
  
        recognition.onstart = () => {
          setIsListening(true);
        };
  
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setQuery(transcript);
          setIsListening(false); // Stop listening after getting the result
        };
  
        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
          if (event.error === "network") {
            alert("Speech recognition requires an internet connection. Please check your network and try again.");
          } else {
            alert("An error occurred during speech recognition. Please try again.");
          }
        };
  
        recognition.onend = () => {
          setIsListening(false); // Ensure listening stops when recognition ends
        };
  
        recognitionRef.current = recognition;
        recognition.start();
      })
      .catch((err) => {
        console.error("Microphone access denied:", err);
        alert("Microphone access is required for speech recognition. Please enable it in your browser settings.");
      });
  };
  
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop(); // Stop the recognition
      setIsListening(false);
    }
  };
  
  const toggleListening = () => {
    if (isListening) {
      stopListening(); // Stop listening if already active
    } else {
      startListening(); // Start listening if not active
    }
  };


  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "en-US"
    window.speechSynthesis.speak(utterance)
  }

  const [isSpeaking, setIsSpeaking] = useState(false);

const toggleSpeak = (text: string) => {
  if (isSpeaking) {
    // Stop speaking
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  } else {
    // Start speaking
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.onend = () => {
      setIsSpeaking(false); // Reset state when speaking ends
    };
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  }
};


const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!query.trim()) return;

  const userMessage = {
    role: "user" as const,
    content: query,
    timestamp: new Date(),
  };
  setMessages((prevMessages) => [...prevMessages, userMessage]);
  setQuery("");
  setLoading(true);
  setError(null);

  try {
    const response = await axios.post("http://127.0.0.1:5000/RAG", {
      query,
      language, // Pass the selected language
    });

    if (response.data && response.data.response) {
      const assistantMessage = {
        role: "assistant" as const,
        content: response.data.response,
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    } else {
      setError("Failed to get a valid response from the server.");
    }
  } catch (err: any) {
    setError(err.message || "An unexpected error occurred.");
  } finally {
    setLoading(false);
  }
};

return (
  <div className="flex flex-col h-screen max-h-screen bg-slate-50">
    {/* Header */}
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-indigo-600 text-white p-4 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-white/20 p-2 rounded-lg mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-scale-3d"
              >
                <path d="M5 7v12h12" />
                <path d="m5 19 6-6" />
                <path d="M19 5h-7" />
                <path d="M5 5h7" />
                <path d="m5 5 6 6" />
                <path d="M19 5v7" />
                <path d="M19 12v7" />
                <path d="m19 19-6-6" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Indian Legal Assistant</h1>
              <p className="text-indigo-100 text-sm">Ask questions about offenses, sections, and punishments</p>
            </div>
          </div>
          <div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-white/20 p-2 rounded-lg text-white focus:outline-none"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="ta">Tamil</option>
              <option value="te">Telugu</option>
              <option value="kn">Kannada</option>
              <option value="ml">Malayalam</option>
              <option value="bn">Bengali</option>
              <option value="mr">Marathi</option>
              <option value="gu">Gujarati</option>
              <option value="pa">Punjabi</option>
            </select>
          </div>
        </div>
      </div>

    {/* Chat Messages */}
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} mb-4`}>
            <div
              className={`max-w-[80%] md:max-w-[70%] rounded-2xl p-4 shadow-sm ${
                message.role === "user"
                  ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white"
                  : "bg-white border border-gray-100"
              }`}
            >
              <div className={`text-sm md:text-base ${message.role === "user" ? "text-white" : "text-gray-800"}`}>
                <ReactMarkdown components={{
                  code({node, className, children, ...props}) {
                    return (
                      <code className="bg-gray-100 rounded-md px-2 py-1 font-mono text-sm" {...props}>
                        {children}
                      </code>
                    )
                  }
                }}>
                  {message.content}
                </ReactMarkdown>
              </div>
              <div
                className={`text-xs mt-2 text-right ${message.role === "user" ? "text-indigo-200" : "text-gray-400"}`}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              {message.role === "assistant" && language === "en" &&(
                <button
                  onClick={() => toggleSpeak(message.content)}
                  className="mt-2 text-indigo-600 hover:text-indigo-700"
                >
                  {isSpeaking ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-volume-x"
                    >
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <line x1="22" y1="9" x2="16" y2="15" />
                      <line x1="16" y1="9" x2="22" y2="15" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-volume-2"
                    >
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center space-x-2">
                <div
                  className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
                <div
                  className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-bounce"
                  style={{ animationDelay: "600ms" }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>

    {/* Input Area */}
    <form onSubmit={handleSubmit} className="p-4 md:p-6 border-t border-gray-200 bg-white shadow-md">
      <div className="max-w-4xl mx-auto">
        <div className="flex space-x-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about an offense or IPC section..."
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800"
            disabled={loading}
          />
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            className="bg-indigo-600 text-white px-4 py-3 rounded-xl hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow"
          >
            {isListening ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-mic-off"
              >
                <line x1="2" x2="22" y1="2" y2="22" />
                <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" />
                <path d="M5 10v2a7 7 0 0 0 12 5" />
                <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" />
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-mic"
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            )}
          </button>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow"
          >
            {loading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                Sending...
              </span>
            ) : (
              <span className="flex items-center">
                Send
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-1"
                >
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
              </span>
            )}
          </button>
        </div>
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg">
            <p className="text-red-500 text-sm flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
              {error}
            </p>
          </div>
        )}
        <p className="mt-3 text-xs text-gray-500 text-center">
          Ask specific questions about Indian Penal Code sections, offenses, or legal concepts
        </p>
      </div>
    </form>
  </div>
);
}