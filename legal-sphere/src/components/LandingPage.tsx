"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  FileText,
  Search,
  Globe,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import lawAnimation from "@/assets/lottie/law-animation.json";
import { LandingNavbar } from "./LandingNavbar";

// Dynamically import Lottie (disables SSR)
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <LandingNavbar/>
      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 px-4 flex w-full">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                AI-Powered
                <span className="text-indigo-700">Legal Knowledge</span> Engine
              </h1>
              <p className="text-lg text-slate-700 md:pr-12">
                Instant, reliable, and well-structured legal insights powered by
                advanced AI. Simplifying complex legal information for lawyers,
                students, and everyone seeking legal clarity.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href={"/home"}>
                <Button
                  size="lg"
                  className="bg-indigo-700 hover:bg-indigo-800 text-white transition-all cursor-pointer"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                </Link>
                <Link href={"#features"}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-indigo-700 text-indigo-700 hover:bg-indigo-50 transition-all cursor-pointer"
                  >
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>

            <div className="w-full max-w-md mx-auto md:max-w-none">
              <Lottie animationData={lawAnimation} loop={true} />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Key Features
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              LegalSphere bridges the gap between legal complexity and
              accessibility, empowering users with clear, data-driven legal
              insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <BookOpen className="h-6 w-6 text-indigo-700" />,
                title: "AI-Powered Legal Q&A",
                description:
                  "Get instant, AI-generated answers to your complex legal queries with accurate citations and references.",
              },
              {
                icon: <FileText className="h-6 w-6 text-indigo-700" />,
                title: "Legal Document Analysis",
                description:
                  "Upload and analyze legal documents for insights, summaries, and actionable recommendations.",
              },
              {
                icon: <Search className="h-6 w-6 text-indigo-700" />,
                title: "Case Law & Statute Search",
                description:
                  "Quickly retrieve relevant laws, precedents, and case summaries from comprehensive legal databases.",
              },
              {
                icon: <Globe className="h-6 w-6 text-indigo-700" />,
                title: "Multi-Language Support",
                description:
                  "Understand legal concepts in your preferred language with accurate translations of legal terminology.",
              },
              {
                icon: <MessageSquare className="h-6 w-6 text-indigo-700" />,
                title: "Conversational Assistance",
                description:
                  "Engage with an intelligent chatbot for guided legal inquiries and step-by-step assistance.",
              },
              {
                icon: <CheckCircle2 className="h-6 w-6 text-indigo-700" />,
                title: "Reliable & Up-to-date",
                description:
                  "Access the most current legal information with regular updates to our comprehensive knowledge base.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-slate-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-slate-100"
              >
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="working" className="py-16 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              How LegalSphere Works
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Our advanced AI technology processes and analyzes legal
              information to provide you with accurate insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Ask Your Question",
                description:
                  "Input your legal query in natural language, just as you would ask a legal expert.",
              },
              {
                step: "2",
                title: "AI Analysis",
                description:
                  "Our AI engine processes your query against vast legal databases and precedents.",
              },
              {
                step: "3",
                title: "Get Clear Insights",
                description:
                  "Receive structured, easy-to-understand legal insights with relevant citations.",
              },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-indigo-700 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-indigo-700">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Legal Research?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
            Join thousands of legal professionals who are saving time and
            gaining deeper insights with LegalSphere.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={"/home"}>
            <Button
              size="lg"
              className="bg-white text-indigo-700 hover:bg-indigo-50 transition-all cursor-pointer"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">
                LegalSphere
              </h3>
              <p className="text-slate-400">
                AI-powered legal knowledge engine providing instant, reliable
                legal insights.
              </p>
            </div>
            <div>
              <h4 className="text-white text-base font-semibold mb-4">
                Product
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Case Studies
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Documentation
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-base font-semibold mb-4">
                Company
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-base font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400">
            <p>© {new Date().getFullYear()} LegalSphere. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
