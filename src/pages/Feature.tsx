import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Mic, Video, Brain, Languages, Zap, Shield, Clock } from "lucide-react";

const Feature = () => {
  const features = [
    {
      icon: Languages,
      title: "50+ Languages Support",
      description: "Time-synced subtitles in over 50 languages with context-aware translation that preserves meaning and cultural nuances.",
      badge: "Core Feature",
    },
    {
      icon: Brain,
      title: "AI Context-Aware Translation",
      description: "Advanced AI understands context, idioms, and cultural references to deliver accurate translations that maintain the original intent.",
      badge: "AI-Powered",
    },
    {
      icon: Mic,
      title: "Speaker ID & Recognition",
      description: "Automatically identifies different speakers and maintains consistent voice characteristics across translations.",
      badge: "Smart Detection",
    },
    {
      icon: Video,
      title: "4K UHD Quality",
      description: "Support for high-definition video content up to 4K resolution with crystal-clear audio processing.",
      badge: "High Quality",
    },
    {
      icon: Globe,
      title: "Emotion Preservation",
      description: "Maintains the emotional tone and sentiment of dialogue across all translations for authentic communication.",
      badge: "Emotional AI",
    }, 
    {
      icon: Clock,
      title: "Time-Synced Subtitles",
      description: "Perfectly synchronized subtitles that match audio timing with frame-accurate precision.",
      badge: "Precision",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-black text-foreground mb-4 tracking-tight text-premium">
              Powerful Features
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-poppins">
              Experience cutting-edge AI technology that breaks language barriers while preserving 
              the essence of every word, emotion, and cultural context.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {feature.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-20 text-center">
            <div className="inline-block p-8 bg-card border border-border rounded-lg">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl">
                Upload your first video or audio file and experience the power of AI-driven translation.
              </p>
              <div className="flex gap-4 justify-center">
                <a 
                  href="/upload" 
                  className="inline-flex items-center justify-center gap-2 h-11 px-8 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold uppercase tracking-wide rounded-md transition-colors"
                >
                  Start Now
                </a>
                <a 
                  href="/pricing" 
                  className="inline-flex items-center justify-center gap-2 h-11 px-8 border-2 border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background font-semibold uppercase tracking-wide rounded-md transition-colors"
                >
                  View Pricing
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Feature;
