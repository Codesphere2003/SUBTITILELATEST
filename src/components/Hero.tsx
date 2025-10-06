import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Info } from "lucide-react";
import heroBackground from "@/assets/hero-background.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroBackground} 
          alt="AI Network Visualization" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl">
           
          
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-foreground mb-4 tracking-tight text-premium text-glow animate-scale-pulse">
            Say It... Feel It... Anywhere...
          </h1>
          
          <div className="flex flex-wrap gap-2 text-sm font-montserrat font-semibold text-muted-foreground mb-6">
            <span className="px-2 py-1 bg-secondary/50 rounded">5024</span>
            <span>•</span>
            <span className="px-2 py-1 bg-secondary/50 rounded">4K UHD</span>
            <span>•</span>
            <span className="px-2 py-1 bg-secondary/50 rounded">Context-Aware</span>
            <span>•</span>
            <span className="px-2 py-1 bg-secondary/50 rounded">Speaker ID</span>
          </div>
          
          <p className="text-lg md:text-xl text-foreground/90 mb-8 max-w-2xl leading-relaxed font-poppins font-medium">
            Experience the <span className="text-gradient-animate font-bold">breathtaking visuals</span>, time-synced subtitles in 50+ languages, 
            preserving dialogue emotion and cultural integrity.
          </p>
          
          <div className="flex flex-wrap gap-4">
            {/* <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
              <Play className="w-5 h-5" />
              Start a New Project
            </Button>
            <Button variant="outline" size="lg" className="gap-2 hover:scale-105 transition-all duration-300">
              <Info className="w-5 h-5" />
              Request a Demo
            </Button> */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
