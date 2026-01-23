import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { MessageSquare, BarChart3, Headphones } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Headphones className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Voiceboat</h1>
            </div>
            <p className="text-gray-600 text-sm">AI-Powered Driver Support</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Voice-First Support Platform
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Intelligent conversational AI for driver support with seamless escalation to human agents
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Driver Chat Card */}
          <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-shadow bg-white">
            <div className="flex items-center justify-center w-14 h-14 bg-blue-100 rounded-lg mb-6">
              <MessageSquare className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Driver Chat</h3>
            <p className="text-gray-600 mb-6">
              Interactive chat interface for drivers to get instant support. Our AI handles common queries like swap history, station locations, and subscription checks.
            </p>
            <ul className="space-y-2 mb-8 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                Real-time conversation
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                Intelligent escalation
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                24/7 availability
              </li>
            </ul>
            <Link href="/driver">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Open Chat Interface
              </Button>
            </Link>
          </Card>

          {/* Agent Dashboard Card */}
          <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-shadow bg-white">
            <div className="flex items-center justify-center w-14 h-14 bg-green-100 rounded-lg mb-6">
              <BarChart3 className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Agent Dashboard</h3>
            <p className="text-gray-600 mb-6">
              Comprehensive dashboard for support agents to manage escalated tickets. Monitor sentiment, track metrics, and resolve issues efficiently.
            </p>
            <ul className="space-y-2 mb-8 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                Real-time escalations
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                Analytics & metrics
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                Sentiment analysis
              </li>
            </ul>
            <Link href="/agent">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                Open Agent Dashboard
              </Button>
            </Link>
          </Card>
        </div>

        {/* Architecture Overview */}
        <Card className="p-8 border-0 shadow-lg bg-white">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">System Architecture</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">ASR</div>
              <p className="text-gray-600 text-sm">Speech-to-Text</p>
              <p className="text-gray-500 text-xs mt-2">Hindi + Hinglish support</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">NLU</div>
              <p className="text-gray-600 text-sm">Intent Recognition</p>
              <p className="text-gray-500 text-xs mt-2">Slot filling & confidence logic</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">API</div>
              <p className="text-gray-600 text-sm">Backend Integration</p>
              <p className="text-gray-500 text-xs mt-2">Swap, Station, Subscription</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-white/50 backdrop-blur-sm mt-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <p className="text-center text-gray-600 text-sm">
            Voiceboat © 2026 • Production-Grade Monolithic Architecture
          </p>
        </div>
      </div>
    </div>
  );
}
