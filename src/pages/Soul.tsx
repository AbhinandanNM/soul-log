import { useEffect, useMemo, useState } from "react";
import { Heart, Plus, Sparkles, Moon, Sun, Quote, CalendarRange, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePersistentState } from "@/hooks/usePersistentState";
import { createId } from "@/lib/utils";

interface SoulEntry {
  id: string;
  createdAt: string;
  category: "meditation" | "gratitude" | "reflection";
  entry: string;
}

const categories = {
  meditation: {
    icon: Moon,
    label: "Meditation",
    placeholder: "Describe your meditation practice today. What technique did you use? How did you feel?",
    color: "text-purple-500",
  },
  gratitude: {
    icon: Heart,
    label: "Gratitude",
    placeholder: "What are you grateful for today? Write about the moments that brought you joy.",
    color: "text-pink-500",
  },
  reflection: {
    icon: Sun,
    label: "Reflection",
    placeholder: "Reflect on your inner journey today. What insights did you gain?",
    color: "text-orange-500",
  },
};

const affirmations = [
  "I give myself permission to slow down and listen deeply.",
  "My inner wisdom is a compass I can trust.",
  "Every breath is a doorway back to peace.",
  "Gratitude turns ordinary moments into miracles.",
  "I am grounded, guided, and growing in grace.",
];

const generateSoulFeedback = (category: SoulEntry["category"], entry: string) => {
  const highlight = entry.trim().length > 200 ? `${entry.trim().slice(0, 200)}…` : entry.trim();

  const closingBlessings: Record<SoulEntry["category"], string[]> = {
    meditation: [
      "Light a candle tonight and breathe with the flame for three slow cycles.",
      "Set a two-minute timer and scan your body from toes to crown with gratitude.",
    ],
    gratitude: [
      "Send one sentence of appreciation to a person who crossed your mind.",
      "Note three sensory delights you noticed today—honor them aloud.",
    ],
    reflection: [
      "Write a gentle question for tomorrow's self and place it on your nightstand.",
      "Release anything heavy by journaling three things you're ready to forgive.",
    ],
  };

  const opening: Record<SoulEntry["category"], string> = {
    meditation: "Meditation is how you plant seeds of stillness. Thank you for tending your heart with care.",
    gratitude: "Gratitude reorients the soul toward abundance. Your reflections brighten the day.",
    reflection: "Reflection is a mirror for the spirit—you are bravely noticing what wants to be healed.",
  };

  return `${opening[category]}

You wrote: “${highlight || "..."}”

Next soul ritual:
• ${closingBlessings[category][0]}
• ${closingBlessings[category][1]}

Trust your rhythm. Every note of presence counts.`;
};

const Soul = () => {
  const { toast } = useToast();
  const [entries, setEntries, resetEntries] = usePersistentState<SoulEntry[]>("soul-log:soul-entries", []);
  const [activeTab, setActiveTab] = usePersistentState<"meditation" | "gratitude" | "reflection">(
    "soul-log:soul-tab",
    "meditation",
  );
  const [entry, setEntry] = usePersistentState<string>("soul-log:soul-draft", "");
  const [aiFeedback, setAiFeedback] = usePersistentState<string>("soul-log:soul-feedback", "");
  const [dailyIntention, setDailyIntention] = usePersistentState<string>("soul-log:intention", "");
  const [affirmation, setAffirmation] = usePersistentState<{ message: string; date: string } | null>(
    "soul-log:affirmation",
    null,
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const todayString = new Date().toDateString();

  useEffect(() => {
    if (!affirmation || new Date(affirmation.date).toDateString() !== todayString) {
      const message = affirmations[Math.floor(Math.random() * affirmations.length)];
      setAffirmation({ message, date: new Date().toISOString() });
    }
  }, [affirmation, setAffirmation, todayString]);

  const streak = useMemo(() => {
    const uniqueDays = Array.from(
      new Set(entries.map((entry) => new Date(entry.createdAt).toDateString())),
    ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let currentStreak = 0;
    const cursor = new Date();

    for (const day of uniqueDays) {
      if (new Date(day).toDateString() === cursor.toDateString()) {
        currentStreak += 1;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }

    return currentStreak;
  }, [entries]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry.trim()) {
      toast({
        title: "Missing information",
        description: "Please write your entry.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    const feedback = generateSoulFeedback(activeTab, entry);
    const newEntry: SoulEntry = {
      id: createId(),
      createdAt: new Date().toISOString(),
      category: activeTab,
      entry,
    };

    setEntries([newEntry, ...entries]);
    setEntry("");
    setAiFeedback(feedback);
    setIsGenerating(false);

    toast({
      title: "Entry saved!",
      description: "Your soul guide whispered a new reflection for you.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-soul">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="mb-2 text-4xl font-bold">Soul Wellness</h1>
            <p className="text-lg text-muted-foreground">
              Nurture your spiritual growth with guided affirmations and reflective rituals
            </p>
          </div>

          {/* New Entry Form */}
          <Card className="mb-8 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                New Soul Entry
              </CardTitle>
              <CardDescription>Connect with your inner self</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label className="mb-3 block">Practice Type</Label>
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
                  {isGenerating ? "Listening to your spirit..." : "Save Entry & Generate Guidance"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* AI Feedback */}
          {aiFeedback && (
            <Card className="mb-8 border-primary/20 bg-gradient-soul/10 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Sparkles className="h-5 w-5" />
                  Your AI Spiritual Guide
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
                  <Quote className="h-5 w-5 text-primary" />
                  Today’s Affirmation
                </CardTitle>
                <CardDescription>Anchor your day with a grounding mantra</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="rounded-lg border border-border/60 bg-background/40 p-4 text-sm leading-relaxed text-muted-foreground">
                  {affirmation?.message}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Refreshed daily</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      const message = affirmations[Math.floor(Math.random() * affirmations.length)];
                      setAffirmation({ message, date: new Date().toISOString() });
                      toast({
                        title: "Affirmation updated",
                        description: "May this message carry you gently through the day.",
                      });
                    }}
                  >
                    <RefreshCcw className="h-4 w-4" />
                    New whisper
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="flex flex-col gap-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CalendarRange className="h-5 w-5 text-primary" />
                  Soul Streak & Intention
                </CardTitle>
                <CardDescription>Celebrate consistency and speak a purpose for today</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-border/60 p-3">
                  <p className="text-sm text-muted-foreground">Current soul streak</p>
                  <p className="mt-1 text-2xl font-bold">{streak} day{streak === 1 ? "" : "s"}</p>
                </div>
                <div>
                  <Label htmlFor="daily-intention" className="text-sm font-medium">
                    Today I intend to...
                  </Label>
                  <Textarea
                    id="daily-intention"
                    placeholder="Offer yourself a gentle intention or mantra."
                    value={dailyIntention}
                    onChange={(event) => setDailyIntention(event.target.value)}
                    className="mt-2 min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Entries List */}
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-bold">Your Soul Journal</h2>
              {entries.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  className="gap-2"
                  onClick={() => {
                    resetEntries([]);
                    setAiFeedback("");
                    toast({
                      title: "Journal cleared",
                      description: "A blank page awaits your next reflection.",
                    });
                  }}
                >
                  <RefreshCcw className="h-4 w-4" />
                  Clear entries
                </Button>
              )}
            </div>
            {entries.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Sparkles className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No entries yet. Start your spiritual wellness journey!
                  </p>
                </CardContent>
              </Card>
            ) : (
              entries.map((entry) => {
                const CategoryIcon = categories[entry.category].icon;
                const categoryColor = categories[entry.category].color;
                const createdAt = new Date(entry.createdAt);
                return (
                  <Card key={entry.id} className="shadow-soft">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CategoryIcon className={`h-6 w-6 ${categoryColor}`} />
                          <div>
                            <CardTitle className="text-lg capitalize">{entry.category}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {createdAt.toLocaleDateString()} at {createdAt.toLocaleTimeString()}
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

export default Soul;
