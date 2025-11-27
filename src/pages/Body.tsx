import { useEffect, useMemo, useState } from "react";
import { Dumbbell, Plus, Sparkles, Apple, Droplets, Flame, RefreshCcw, Droplet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface BodyEntry {
  id: string;
  created_at: string;
  category: "exercise" | "nutrition" | "hydration";
  entry: string;
}

const categories = {
  exercise: {
    icon: Dumbbell,
    label: "Exercise",
    placeholder: "What exercise did you do today? How long? How did you feel?",
    color: "text-red-500",
  },
  nutrition: {
    icon: Apple,
    label: "Nutrition",
    placeholder: "What did you eat today? How was your nutrition balanced?",
    color: "text-green-500",
  },
  hydration: {
    icon: Droplets,
    label: "Hydration",
    placeholder: "How much water did you drink? How do you feel hydrated?",
    color: "text-blue-500",
  },
};

const generateBodyFeedback = (category: BodyEntry["category"], entry: string) => {
  const summary = entry.trim().length > 200 ? `${entry.trim().slice(0, 200)}…` : entry.trim();

  const advice: Record<BodyEntry["category"], string[]> = {
    exercise: [
      "Schedule a gentle stretch or mobility session for tomorrow.",
      "Fuel your body with protein within an hour of finishing your workout.",
    ],
    nutrition: [
      "Aim to color your next plate with at least three different plants.",
      "Hydrate before your meals to support digestion and energy.",
    ],
    hydration: [
      "Pair every cup of coffee with a full glass of water.",
      "Keep a refill reminder on your phone for mid-afternoon slumps.",
    ],
  };

  const encouragement: Record<BodyEntry["category"], string> = {
    exercise: "Consistency compounds. Your body will thank you for moving today.",
    nutrition: "Balanced nutrition is an act of self-respect—notice how your energy responds.",
    hydration: "Each glass is a reset button for your focus, mood, and recovery.",
  };

  return `${encouragement[category]}

You captured: “${summary || "..."}”

Try this next:
• ${advice[category][0]}
• ${advice[category][1]}

Remember to celebrate the effort, not just the outcome.`;
};

const Body = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [entries, setEntries] = useState<BodyEntry[]>([]);
  const [activeTab, setActiveTab] = useState<"exercise" | "nutrition" | "hydration">("exercise");
  const [entry, setEntry] = useState("");
  const [aiFeedback, setAiFeedback] = useState("");
  const [hydrationGoal, setHydrationGoal] = useState(8);
  const [hydrationProgress, setHydrationProgress] = useState(0);
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
      .eq("type", "body")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching entries:", error);
      toast({
        title: "Error fetching entries",
        description: error.message,
        variant: "destructive",
      });
    } else {
      const mappedEntries = data.map((e: any) => ({
        id: e.id,
        created_at: e.created_at,
        category: e.category,
        entry: e.content, // Map content to entry
      }));
      setEntries(mappedEntries);
    }
  };

  const bodyStats = useMemo(() => {
    const totals = entries.reduce(
      (acc, entry) => {
        acc[entry.category] += 1;
        return acc;
      },
      { exercise: 0, nutrition: 0, hydration: 0 },
    );

    const latestEntry = entries[0];
    return {
      totals,
      lastCheckIn: latestEntry ? new Date(latestEntry.created_at).toLocaleString() : "Log your first entry",
      hydrationPercent: hydrationGoal ? Math.min(100, Math.round((hydrationProgress / hydrationGoal) * 100)) : 0,
    };
  }, [entries, hydrationGoal, hydrationProgress]);

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

    if (!entry.trim()) {
      toast({
        title: "Missing information",
        description: "Please write your entry.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    const feedback = generateBodyFeedback(activeTab, entry);

    const { data, error } = await supabase
      .from("entries")
      .insert([
        {
          user_id: user.id,
          type: "body",
          category: activeTab,
          content: entry,
          title: `Body ${activeTab} update`, // Adding a title for consistency
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
      const newEntry: BodyEntry = {
        id: data.id,
        created_at: data.created_at,
        category: data.category,
        entry: data.content,
      };
      setEntries([newEntry, ...entries]);
      setEntry("");
      setAiFeedback(feedback);

      toast({
        title: "Entry saved!",
        description: "Your body coach crafted new guidance for you.",
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
            <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-body">
              <Dumbbell className="h-8 w-8 text-white" />
            </div>
            <h1 className="mb-2 text-4xl font-bold">Body Wellness</h1>
            <p className="text-lg text-muted-foreground">
              Track your physical health and unlock smart hydration, nutrition, and movement coaching
            </p>
          </div>

          {/* New Entry Form */}
          <Card className="mb-8 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                New Body Entry
              </CardTitle>
              <CardDescription>Log your physical activities</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label className="mb-3 block">Category</Label>
                  <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                    <TabsList className="grid w-full grid-cols-3">
                      {Object.entries(categories).map(([key, { icon: Icon, label }]) => (
                        <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span className="hidden sm:inline">{label}</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>

                <div>
                  <Label htmlFor="entry">Your Entry</Label>
                  <Textarea
                    id="entry"
                    placeholder={categories[activeTab].placeholder}
                    value={entry}
                    onChange={(e) => setEntry(e.target.value)}
                    className="mt-2 min-h-[150px]"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isGenerating}>
                  {isGenerating ? "Synthesizing coaching..." : "Save Entry & Generate Coaching"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* AI Feedback */}
          {aiFeedback && (
            <Card className="mb-8 border-primary/20 bg-gradient-body/10 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Sparkles className="h-5 w-5" />
                  Your AI Fitness Coach
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap leading-relaxed">{aiFeedback}</p>
              </CardContent>
            </Card>
          )}

          <div className="mb-8 grid gap-4 lg:grid-cols-2">
            <Card className="shadow-soft">
              <CardHeader className="flex flex-col gap-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Flame className="h-5 w-5 text-orange-500" />
                  Weekly Training Snapshot
                </CardTitle>
                <CardDescription>Keep tabs on your movement, meals, and hydration habits</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-3">
                {(Object.keys(categories) as Array<BodyEntry["category"]>).map((category) => {
                  const Icon = categories[category].icon;
                  return (
                    <div key={category} className="rounded-lg border border-border/60 p-3">
                      <div className="flex items-center gap-2 text-sm font-medium capitalize">
                        <Icon className="h-4 w-4" />
                        {category}
                      </div>
                      <p className="mt-2 text-2xl font-bold">{bodyStats.totals[category]}</p>
                      <p className="text-xs text-muted-foreground">entries logged</p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="flex flex-col gap-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Droplet className="h-5 w-5 text-sky-500" />
                  Hydration Tracker
                </CardTitle>
                <CardDescription>Stay on top of your daily water ritual</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      {hydrationProgress}/{hydrationGoal} cups
                    </span>
                    <span>{bodyStats.hydrationPercent}%</span>
                  </div>
                  <Progress value={bodyStats.hydrationPercent} className="mt-2" />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant="default"
                    className="flex-1"
                    onClick={() => setHydrationProgress(Math.min(hydrationGoal, hydrationProgress + 1))}
                  >
                    Add a cup
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setHydrationProgress(Math.max(0, hydrationProgress - 1))}
                    disabled={hydrationProgress === 0}
                  >
                    Remove cup
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <Label htmlFor="hydration-goal" className="text-sm font-medium">
                    Daily goal
                  </Label>
                  <input
                    id="hydration-goal"
                    type="number"
                    min={4}
                    max={20}
                    value={hydrationGoal}
                    onChange={(event) => setHydrationGoal(Math.max(4, Number(event.target.value)))}
                    className="h-9 w-20 rounded-md border border-border bg-background px-2 text-sm"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      setHydrationProgress(0);
                      toast({
                        title: "Hydration reset",
                        description: "Ready for a brand-new hydration streak!",
                      });
                    }}
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Entries List */}
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold">Your Body Journal</h2>
                <p className="text-sm text-muted-foreground">
                  Last check-in: {bodyStats.lastCheckIn}
                </p>
              </div>
              {entries.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  className="gap-2"
                  onClick={() => {
                    setEntries([]);
                    setAiFeedback("");
                    toast({
                      title: "Journal cleared",
                      description: "Start fresh with new body insights whenever you're ready.",
                    });
                  }}
                >
                  <RefreshCcw className="h-4 w-4" />
                  Clear journal
                </Button>
              )}
            </div>
            {entries.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Dumbbell className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No entries yet. Start tracking your physical wellness!
                  </p>
                </CardContent>
              </Card>
            ) : (
              entries.map((entry) => {
                const CategoryIcon = categories[entry.category].icon;
                const categoryColor = categories[entry.category].color;
                const entryDate = new Date(entry.created_at);
                return (
                  <Card key={entry.id} className="shadow-soft">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CategoryIcon className={`h-6 w-6 ${categoryColor}`} />
                          <div>
                            <CardTitle className="text-lg capitalize">{entry.category}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {entryDate.toLocaleDateString()} at {entryDate.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap text-muted-foreground">{entry.entry}</p>
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

export default Body;
