import { Link } from "react-router-dom";
import { Brain, Heart, Sparkles, ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Index = () => {
  const pillars = [
    {
      title: "Mind",
      description: "Track your mental wellness, thoughts, and emotional state",
      icon: Brain,
      color: "mind",
      link: "/mind",
      features: ["Mood tracking", "Thought journaling", "Mental clarity"],
    },
    {
      title: "Body",
      description: "Monitor physical health, exercise, and nutrition",
      icon: Heart,
      color: "body",
      link: "/body",
      features: ["Exercise logs", "Nutrition tracking", "Physical wellness"],
    },
    {
      title: "Soul",
      description: "Nurture spiritual growth, gratitude, and inner peace",
      icon: Sparkles,
      color: "soul",
      link: "/soul",
      features: ["Meditation logs", "Gratitude practice", "Spiritual reflection"],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-hero py-20 sm:py-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
                Your Complete
                <span className="block text-primary">Wellness Journey</span>
              </h1>
              <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
                Track and nurture your mind, body, and soul in one beautiful space. 
                Build lasting habits and discover balance in your daily life.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="shadow-elevated">
                  <Link to="/journal" className="flex items-center gap-2">
                    Start Journaling <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/mind">Explore Features</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Three Pillars */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                Three Pillars of Wellness
              </h2>
              <p className="text-lg text-muted-foreground">
                Balance your life across all dimensions
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3">
              {pillars.map(({ title, description, icon: Icon, color, link, features }) => (
                <Card key={title} className="group hover:shadow-elevated transition-all duration-300">
                  <CardHeader>
                    <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-${color}`}>
                      <Icon className={`h-6 w-6 text-${color}-foreground`} />
                    </div>
                    <CardTitle className="text-2xl">{title}</CardTitle>
                    <CardDescription className="text-base">{description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="mb-6 space-y-2">
                      {features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className={`h-1.5 w-1.5 rounded-full bg-${color}`} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button asChild variant="outline" className="w-full group-hover:border-primary">
                      <Link to={link} className="flex items-center gap-2">
                        Explore {title} <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-accent py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <BookOpen className="mx-auto mb-6 h-16 w-16 text-accent-foreground" />
              <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                Start Your Wellness Journey Today
              </h2>
              <p className="mb-8 text-lg text-muted-foreground">
                Begin tracking your progress and discover patterns in your wellness journey.
              </p>
              <Button asChild size="lg" className="shadow-elevated">
                <Link to="/journal" className="flex items-center gap-2">
                  Open Your Journal <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
