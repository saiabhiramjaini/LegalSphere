import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Scale, MessageSquare, FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";

const prisma = new PrismaClient();

export default async function HomePage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user?.email! },
  });

  if (!user) {
    throw new Error("User not found");
  }
  
  const services = [
    {
      icon: <Scale className="h-12 w-12 text-indigo-700" />,
      title: "Legal Advice",
      description: "Get personalized recommendations for experienced lawyers based on your legal needs",
      link: "/legal-advice",
      features: ["Expert lawyer matching", "Specialized practice areas", "Verified professionals"]
    },
    {
      icon: <MessageSquare className="h-12 w-12 text-indigo-700" />,
      title: "Legal Chatbot",
      description: "Query any legal matter with our AI-powered chatbot with multi-language support",
      link: "/chatbot",
      features: ["Multi-language support", "24/7 availability", "Real-time responses"]
    },
    {
      icon: <FileText className="h-12 w-12 text-indigo-700" />,
      title: "Document Summarization",
      description: "Get concise summaries of complex legal documents instantly",
      link: "/summarize",
      features: ["Quick analysis", "Key points extraction", "Simple language"]
    }
  ];

  return (
    <>
      <Navbar/>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4 flex justify-center items-center">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Our Legal Services
            </h1>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Access comprehensive legal assistance through our AI-powered platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Link href={service.link} key={index} className="transform transition-all hover:scale-105">
                <Card className="h-full bg-white border-2 border-slate-100 hover:border-indigo-100 hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="w-16 h-16 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
                      {service.icon}
                    </div>
                    <CardTitle className="text-2xl text-slate-900">{service.title}</CardTitle>
                    <CardDescription className="text-slate-600">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {service.features.map((feature, i) => (
                        <li key={i} className="flex items-center text-slate-700">
                          <div className="w-2 h-2 bg-indigo-700 rounded-full mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-indigo-700 hover:bg-indigo-800 text-white">
                      Get Started
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}