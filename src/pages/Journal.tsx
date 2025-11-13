import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, Brain, Heart, Sparkles, Filter, Download, RefreshCcw, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type JournalFilter = "all" | "mind" | "body" | "soul";

const Journal = () => {
  const { toast } = useToast();
  const [filter, setFilter] = useState<JournalFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [entries, setEntries] = useState<
    Array<{
      id: string;
      date: Date;
      type: "mind" | "body" | "soul";
      title: string;
      content: string;
      category: string;
    }>
  >([]);

  const loadEntries = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      const mindEntries: Array<{ id: string; createdAt: string; mood: string; thoughts: string }> = JSON.parse(
        window.localStorage.getItem("soul-log:mind-entries") ?? "[]",
      );
      const bodyEntries: Array<{ id: string; createdAt: string; category: string; entry: string }> = JSON.parse(
        window.localStorage.getItem("soul-log:body-entries") ?? "[]",
      );
      const soulEntries: Array<{ id: string; createdAt: string; category: string; entry: string }> = JSON.parse(
        window.localStorage.getItem("soul-log:soul-entries") ?? "[]",
      );

      const mapped = [
        ...mindEntries.map((entry) => ({
          id: entry.id,
          date: new Date(entry.createdAt),
          type: "mind" as const,
          title: `Mind check-in (${entry.mood})`,
          content: entry.thoughts,
          category: "Mind",
        })),
        ...bodyEntries.map((entry) => ({
          id: entry.id,
          date: new Date(entry.createdAt),
          type: "body" as const,
          title: `Body ${entry.category} update`,
          content: entry.entry,
          category: "Body",
        })),
        ...soulEntries.map((entry) => ({
          id: entry.id,
          date: new Date(entry.createdAt),
          type: "soul" as const,
          title: `Soul ${entry.category} reflection`,
          content: entry.entry,
          category: "Soul",
        })),
      ].sort((a, b) => b.date.getTime() - a.date.getTime());

      setEntries(mapped);
    } catch (error) {
      console.error("Failed to read journal entries", error);
      toast({
        title: "Unable to load journal",
        description: "We had trouble reading saved entries. Try refreshing the page.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const filteredEntries = useMemo(() => {
    const byType = filter === "all" ? entries : entries.filter((entry) => entry.type === filter);
    if (!searchTerm.trim()) return byType;

    const query = searchTerm.toLowerCase();
    return byType.filter(
      (entry) =>
        entry.title.toLowerCase().includes(query) ||
        entry.content.toLowerCase().includes(query) ||
        entry.category.toLowerCase().includes(query),
    );
  }, [entries, filter, searchTerm]);

  const getIcon = (type: string) => {
    switch (type) {
      case "mind": return Brain;
      case "body": return Heart;
      case "soul": return Sparkles;
      default: return BookOpen;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "mind": return "bg-gradient-mind";
      case "body": return "bg-gradient-body";
      case "soul": return "bg-gradient-soul";
      default: return "bg-primary";
    }
  };

  const stats = useMemo(
    () => [
      { label: "Total Entries", value: entries.length, icon: BookOpen },
      { label: "Mind Entries", value: entries.filter((e) => e.type === "mind").length, icon: Brain },
      { label: "Body Entries", value: entries.filter((e) => e.type === "body").length, icon: Heart },
      { label: "Soul Entries", value: entries.filter((e) => e.type === "soul").length, icon: Sparkles },
    ],
    [entries],
  );

  const handleExport = () => {
    try {
      const payload = entries.map((entry) => ({
        id: entry.id,
        type: entry.type,
        title: entry.title,
        content: entry.content,
        date: entry.date.toISOString(),
      }));
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `soul-log-journal-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast({
        title: "Journal exported",
        description: "Your entries were saved as a JSON file.",
      });
    } catch (error) {
      console.error("Failed to export journal", error);
      toast({
        title: "Export failed",
        description: "We couldn't export your journal. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
              <BookOpen className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="mb-2 text-4xl font-bold">Your Wellness Journal</h1>
            <p className="text-lg text-muted-foreground">
              All your mind, body, and soul entries in one place
            </p>
          </div>

          {/* Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(({ label, value, icon: Icon }) => (
              <Card key={label}>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="rounded-lg bg-accent p-3">
                    <Icon className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{value}</p>
                    <p className="text-sm text-muted-foreground">{label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Entries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <Tabs value={filter} onValueChange={(value) => setFilter(value as JournalFilter)}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="mind">Mind</TabsTrigger>
                    <TabsTrigger value="body">Body</TabsTrigger>
                    <TabsTrigger value="soul">Soul</TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="flex w-full flex-col gap-3 md:flex-row md:w-auto md:items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search entries..."
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2"
                      onClick={() => {
                        loadEntries();
                        toast({
                          title: "Journal refreshed",
                          description: "Pulled the latest entries from your wellness logs.",
                        });
                      }}
                    >
                      <RefreshCcw className="h-4 w-4" />
                      Refresh
                    </Button>
                    <Button type="button" className="gap-2" onClick={handleExport} disabled={entries.length === 0}>
                      <Download className="h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Entries Timeline */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Your Journey</h2>
            {entries.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Your journal is waiting for its first entry. Log moments in the Mind, Body, or Soul pages.
                  </p>
                </CardContent>
              </Card>
            ) : filteredEntries.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No entries matched your filters. Clear the search or pick another category.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredEntries.map((entry) => {
                const Icon = getIcon(entry.type);
                const colorClass = getColor(entry.type);
                return (
                  <Card key={entry.id} className="shadow-soft hover:shadow-elevated transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`rounded-lg ${colorClass} p-2 mt-1`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <CardTitle className="text-lg">{entry.title}</CardTitle>
                              <Badge variant="secondary" className="text-xs">
                                {entry.category}
                              </Badge>
                            </div>
                            <CardDescription>
                              {entry.date.toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })} at {entry.date.toLocaleTimeString()}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{entry.content}</p>
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

export default Journal;
