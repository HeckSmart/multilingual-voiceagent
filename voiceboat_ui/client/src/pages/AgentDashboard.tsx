import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EscalationCard from "@/components/EscalationCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { AlertCircle, CheckCircle2, Clock, TrendingUp } from "lucide-react";

interface Escalation {
  conversationId: string;
  driverId: string;
  reason: string;
  status: string;
  summary: {
    intent: string;
    sentiment: string;
    messages: any[];
  };
  createdAt: number;
}

export default function AgentDashboard() {
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    assigned: 0,
    resolved: 0,
    avgResolutionTime: 0,
  });

  useEffect(() => {
    fetchEscalations();
    const interval = setInterval(fetchEscalations, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchEscalations = async () => {
    try {
      const response = await fetch("/api/escalations");
      const data = await response.json();
      setEscalations(data);

      // Calculate stats
      const pending = data.filter((e: Escalation) => e.status === "pending").length;
      const assigned = data.filter((e: Escalation) => e.status === "assigned").length;
      const resolved = data.filter((e: Escalation) => e.status === "resolved").length;

      setStats({
        pending,
        assigned,
        resolved,
        avgResolutionTime: 4.5,
      });
    } catch (error) {
      console.error("Error fetching escalations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (escalationId: string) => {
    try {
      await fetch(`/api/escalations/${escalationId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: "agent-current" }),
      });
      fetchEscalations();
    } catch (error) {
      console.error("Error assigning escalation:", error);
    }
  };

  const handleResolve = async (escalationId: string) => {
    try {
      await fetch(`/api/escalations/${escalationId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolution: "Resolved by agent" }),
      });
      fetchEscalations();
    } catch (error) {
      console.error("Error resolving escalation:", error);
    }
  };

  const chartData = [
    { name: "Mon", escalations: 12, resolved: 10 },
    { name: "Tue", escalations: 19, resolved: 15 },
    { name: "Wed", escalations: 15, resolved: 14 },
    { name: "Thu", escalations: 22, resolved: 18 },
    { name: "Fri", escalations: 18, resolved: 16 },
    { name: "Sat", escalations: 8, resolved: 8 },
    { name: "Sun", escalations: 5, resolved: 5 },
  ];

  const sentimentData = [
    { name: "Positive", value: 35, fill: "#10b981" },
    { name: "Neutral", value: 45, fill: "#6b7280" },
    { name: "Negative", value: 15, fill: "#ef4444" },
    { name: "Angry", value: 5, fill: "#dc2626" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Agent Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage escalated support tickets</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 border-0 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pending}</p>
              </div>
              <AlertCircle className="w-12 h-12 text-red-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Assigned</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.assigned}</p>
              </div>
              <Clock className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Resolved</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.resolved}</p>
              </div>
              <CheckCircle2 className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Avg Resolution</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.avgResolutionTime}m</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 p-6 border-0 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Escalations</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="escalations" fill="#3b82f6" name="Total Escalations" />
                <Bar dataKey="resolved" fill="#10b981" name="Resolved" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 border-0 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Escalations List */}
        <Card className="border-0 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Active Escalations</h2>
          </div>

          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="w-full justify-start border-b border-gray-200 rounded-none bg-transparent px-6 py-0">
              <TabsTrigger value="pending" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600">
                Pending ({stats.pending})
              </TabsTrigger>
              <TabsTrigger value="assigned" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600">
                Assigned ({stats.assigned})
              </TabsTrigger>
              <TabsTrigger value="resolved" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600">
                Resolved ({stats.resolved})
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="pending" className="space-y-4 mt-0">
                {loading ? (
                  <p className="text-gray-600">Loading...</p>
                ) : escalations.filter((e) => e.status === "pending").length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No pending escalations</p>
                ) : (
                  escalations
                    .filter((e) => e.status === "pending")
                    .map((escalation) => (
                      <EscalationCard
                        key={escalation.conversationId}
                        id={escalation.conversationId}
                        driverId={escalation.driverId}
                        reason={escalation.reason}
                        sentiment={escalation.summary.sentiment}
                        intent={escalation.summary.intent}
                        messageCount={escalation.summary.messages.length}
                        createdAt={escalation.createdAt}
                        onAssign={() => handleAssign(escalation.conversationId)}
                        onResolve={() => handleResolve(escalation.conversationId)}
                      />
                    ))
                )}
              </TabsContent>

              <TabsContent value="assigned" className="space-y-4 mt-0">
                {escalations.filter((e) => e.status === "assigned").length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No assigned escalations</p>
                ) : (
                  escalations
                    .filter((e) => e.status === "assigned")
                    .map((escalation) => (
                      <EscalationCard
                        key={escalation.conversationId}
                        id={escalation.conversationId}
                        driverId={escalation.driverId}
                        reason={escalation.reason}
                        sentiment={escalation.summary.sentiment}
                        intent={escalation.summary.intent}
                        messageCount={escalation.summary.messages.length}
                        createdAt={escalation.createdAt}
                      />
                    ))
                )}
              </TabsContent>

              <TabsContent value="resolved" className="space-y-4 mt-0">
                {escalations.filter((e) => e.status === "resolved").length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No resolved escalations</p>
                ) : (
                  escalations
                    .filter((e) => e.status === "resolved")
                    .map((escalation) => (
                      <EscalationCard
                        key={escalation.conversationId}
                        id={escalation.conversationId}
                        driverId={escalation.driverId}
                        reason={escalation.reason}
                        sentiment={escalation.summary.sentiment}
                        intent={escalation.summary.intent}
                        messageCount={escalation.summary.messages.length}
                        createdAt={escalation.createdAt}
                      />
                    ))
                )}
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
