import { useState } from "react";
import { cn } from "@/lib/utils";

const categories = ["ACTION", "COMEDY", "DRAMA", "SCI-FI", "THRILLER"];

const TrendingSection = () => {
  const [activeCategory, setActiveCategory] = useState("DRAMA");

  return (
    <section className="py-12 bg-background border-t border-border">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-foreground uppercase tracking-wide font-poppins">
            Trending Now
          </h2>
          
          <div className="flex gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "px-4 py-2 text-sm font-bold uppercase tracking-wide transition-all duration-300 rounded-sm font-montserrat",
                  activeCategory === category
                    ? "bg-primary text-primary-foreground shadow-lg scale-105"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-105"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrendingSection;
