import { useEffect, useMemo, useState } from "react";
import { Brain, Plus, Smile, Meh, Frown, BarChart3, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface MindEntry {
  id: string;
  created_at: string;
  mood: "happy" | "neutral" | "sad";
  thoughts: string;
}

const moods = [
  { value: "happy" as const, icon: Smile, label: "Happy", color: "text-green-500" },
  { value: "neutral" as const, icon: Meh, label: "Neutral", color: "text-yellow-500" },
  { value: "sad" as const, icon: Frown, label: "Sad", color: "text-blue-500" },
];

const generateMindFeedback = (mood: MindEntry["mood"], thoughts: string) => {
  const trimmedThoughts = thoughts.trim();
  const highlights = trimmedThoughts.length > 200 ? `${trimmedThoughts.slice(0, 200)}…` : trimmedThoughts;

  const prompts: Record<MindEntry["mood"], string[]> = {
    happy: [
      "Bottle the moment by writing a gratitude note to your future self.",
      "What tiny ritual helped you feel this light today?",
    ],
    neutral: [
      "What would feeling 10% better look like this afternoon?",
      "Name one small win you can create before the day ends.",
    ],
    sad: [
      "Which friend or practice could offer comfort right now?",
      "Gift yourself five minutes of deep breathing or stretching.",
    ],
  };

  const encouragement: Record<MindEntry["mood"], string> = {
    happy: "It's beautiful to witness your joy—let it ripple into the rest of the day.",
    neutral: "You're in a reflective place. This is a gentle invitation to check in with your energy.",
    sad: "Thank you for sharing honestly. Softer days deserve extra compassion and care.",
  };

  return `${encouragement[mood]}

You captured: “${highlights || "..."}”

Consider exploring:
• ${prompts[mood][0]}
• ${prompts[mood][1]}

Keep listening to yourself—awareness is healing.`;
};

const Mind = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [entries, setEntries] = useState<MindEntry[]>([]);
  const [selectedMood, setSelectedMood] = useState<"happy" | "neutral" | "sad" | null>(null);
  const [thoughts, setThoughts] = useState("");
  const [aiFeedback, setAiFeedback] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user]);

  const fetchEntries = async () => {
    const { data, error } = await supabase
      .from("entries")
      .select("*")
      .eq("type", "mind")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching entries:", error);
      toast({
        title: "Error fetching entries",
        description: error.message,
        variant: "destructive",
      });
    } else {
      // Map database columns to local state shape if needed, or adjust interface
      // Here assuming DB columns match interface (snake_case vs camelCase needs attention)
      // DB: created_at, mood, content (mapped to thoughts)
      const mappedEntries = data.map((e: any) => ({
        id: e.id,
        created_at: e.created_at,
        mood: e.mood,
        thoughts: e.content, // Map content to thoughts
      }));
      setEntries(mappedEntries);
    }
  };

  const moodSummary = useMemo(() => {
    const totalEntries = entries.length || 1;
    const counts = moods.map((mood) => ({
      mood: mood.label,
      value: entries.filter((entry) => entry.mood === mood.value).length,
    }));

    const mostCommon = counts.reduce((prev, current) => (current.value > prev.value ? current : prev), counts[0]);
    const today = new Date().toDateString();
    const mindfulToday = entries.some((entry) => new Date(entry.created_at).toDateString() === today);

    return {
      counts,
      mostCommonMood: mostCommon?.value ? mostCommon.mood : "Log an entry to see insights",
      averagePerWeek: Math.max(1, Math.round((entries.length / 7) * 10) / 10),
      mindfulToday,
      totalEntries: entries.length,
    };
  }, [entries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save entries.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedMood || !thoughts.trim()) {
      toast({
        title: "Missing information",
        description: "Please select a mood and write your thoughts.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    const feedback = generateMindFeedback(selectedMood, thoughts);

    const { data, error } = await supabase
      .from("entries")
      .insert([
        {
          user_id: user.id,
          type: "mind",
          mood: selectedMood,
          content: thoughts,
          category: "Mind", // Default category
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error saving entry:", error);
      toast({
        title: "Error saving entry",
        description: error.message,
        variant: "destructive",
      });
    } else {
      const newEntry: MindEntry = {
        id: data.id,
        created_at: data.created_at,
        mood: data.mood,
        thoughts: data.content,
      };
      setEntries([newEntry, ...entries]);
      setSelectedMood(null);
      setThoughts("");
      setAiFeedback(feedback);

      toast({
        title: "Entry saved!",
        description: "Your reflective coach left guidance below.",
      });
    }
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-mind">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="mb-2 text-4xl font-bold">Mind Wellness</h1>
            <p className="text-lg text-muted-foreground">
              Track your mental state and emotional wellbeing
            </p>
          </div>

          {/* New Entry Form */}
          <Card className="mb-8 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                New Mind Entry
              </CardTitle>
              <CardDescription>How are you feeling today?</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label className="mb-3 block">Your Mood</Label>
                  <div className="flex gap-4">
                    {moods.map(({ value, icon: Icon, label, color }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setSelectedMood(value)}
                        className={`flex flex-1 flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${selectedMood === value
                            ? "border-primary bg-accent shadow-soft"
                            : "border-border hover:border-muted-foreground"
                          }`}
                      >
                        <Icon className={`h-8 w-8 ${color}`} />
                        <span className="text-sm font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="thoughts">Your Thoughts</Label>
                  <Textarea
                    id="thoughts"
                    placeholder="What's on your mind? Write about your thoughts, feelings, or anything else..."
                    value={thoughts}
                    onChange={(e) => setThoughts(e.target.value)}
                    className="mt-2 min-h-[150px]"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isGenerating}>
                  {isGenerating ? "Crafting insights..." : "Save Entry & Generate Insights"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* AI Feedback */}
          {aiFeedback && (
            <Card className="mb-8 border-primary/20 bg-gradient-mind/10 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Brain className="h-5 w-5" />
                  Your AI Mental Wellness Coach
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap leading-relaxed">{aiFeedback}</p>
              </CardContent>
            </Card>
          )}

          {/* Entries List */}
          <div className="space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row">
              <Card className="flex-1 shadow-soft">
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg">Mood Insights</CardTitle>
                      <CardDescription>Dive into your emotional trends</CardDescription>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    disabled={entries.length === 0}
                    onClick={() => {
                      // Reset logic if needed, or just clear local state? 
                      // Deleting from DB might be too aggressive for a "Reset" button without confirmation
                      // For now, let's just clear the local view or maybe remove the button if not needed
                      setEntries([]);
                      setAiFeedback("");
                    }}
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Reset view
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {entries.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Log your first entry to unlock trend tracking, mindful streaks, and personalized insights.
                    </p>
                  ) : (
                    <>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-lg border border-border/60 p-3">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Top mood</p>
                          <p className="text-lg font-semibold">{moodSummary.mostCommonMood}</p>
                        </div>
                        <div className="rounded-lg border border-border/60 p-3">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Entries logged</p>
                          <p className="text-lg font-semibold">{moodSummary.totalEntries}</p>
                        </div>
                        <div className="rounded-lg border border-border/60 p-3">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Mindful today?</p>
                          <p className="text-lg font-semibold">
                            {moodSummary.mindfulToday ? "Yes — great job!" : "Not yet"}
                          </p>
                        </div>
                      </div>
                      <ChartContainer
                        config={{
                          value: { label: "Entries", color: "hsl(var(--chart-2))" },
                        }}
                        className="h-64"
                      >
                        <ResponsiveContainer>
                          <BarChart data={moodSummary.counts}>
                            <CartesianGrid strokeDasharray="4 4" className="stroke-border/40" />
                            <XAxis dataKey="mood" tickLine={false} axisLine={false} />
                            <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
            <h2 className="text-2xl font-bold">Your Mind Journal</h2>
            {entries.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Brain className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No entries yet. Start tracking your mental wellness!
                  </p>
                </CardContent>
              </Card>
            ) : (
              entries.map((entry) => {
                const MoodIcon = moods.find((m) => m.value === entry.mood)?.icon || Smile;
                const moodColor = moods.find((m) => m.value === entry.mood)?.color;
                const entryDate = new Date(entry.created_at);
                return (
                  <Card key={entry.id} className="shadow-soft">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <MoodIcon className={`h-6 w-6 ${moodColor}`} />
                          <CardTitle className="text-lg">
                            {entryDate.toLocaleDateString()} at {entryDate.toLocaleTimeString()}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap text-muted-foreground">{entry.thoughts}</p>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Mind;

