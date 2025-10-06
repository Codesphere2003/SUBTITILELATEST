import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Crown, Rocket } from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      icon: Zap,
      price: "Free",
      period: "forever",
      description: "Perfect for trying out our AI translation service",
      badge: null,
      features: [
        "Up to 10 minutes of content per month",
        "20+ languages support",
        "720p video quality",
        "Basic speaker identification",
        "Standard processing speed",
        "Email support",
      ],
      cta: "Get Started",
      highlighted: false,
    },
    {
      name: "Professional",
      icon: Crown,
      price: "$29",
      period: "per month",
      description: "Ideal for content creators and small teams",
      badge: "Most Popular",
      features: [
        "Up to 100 minutes of content per month",
        "50+ languages support",
        "4K UHD video quality",
        "Advanced speaker identification",
        "Priority processing speed",
        "Context-aware translation",
        "Emotion preservation",
        "Priority email support",
        "24/7 chat support",
      ],
      cta: "Start Free Trial",
      highlighted: true,
    },
    {
      name: "Enterprise",
      icon: Rocket,
      price: "Custom",
      period: "contact us",
      description: "For large organizations with custom needs",
      badge: "Best Value",
      features: [
        "Unlimited content processing",
        "All 50+ languages support",
        "8K video quality support",
        "Custom AI model training",
        "Dedicated account manager",
        "API access",
        "Custom integrations",
        "SLA guarantees",
        "24/7 phone & chat support",
        "On-premise deployment option",
      ],
      cta: "Contact Sales",
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-black text-foreground mb-4 tracking-tight text-premium">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-poppins">
              Choose the perfect plan for your needs. All plans include our core AI features 
              with no hidden fees.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index}
                className={`relative flex flex-col ${
                  plan.highlighted 
                    ? 'border-primary shadow-lg shadow-primary/20 scale-105 md:scale-110' 
                    : 'hover:border-primary/50 hover:shadow-lg'
                } transition-all duration-300`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      {plan.badge}
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-8">
                  <div className="mx-auto p-3 bg-primary/10 rounded-lg w-fit mb-4">
                    <plan.icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-foreground">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {plan.description}
                  </CardDescription>
                  <div className="mt-6">
                    <span className="text-5xl font-black text-foreground">
                      {plan.price}
                    </span>
                    {plan.price !== "Custom" && (
                      <span className="text-muted-foreground ml-2">
                        / {plan.period}
                      </span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex-grow">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-foreground/90">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-6">
                  <a 
                    href="/upload"
                    className={`w-full inline-flex items-center justify-center gap-2 h-11 px-8 font-semibold uppercase tracking-wide rounded-md transition-all duration-300 ${
                      plan.highlighted
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl'
                        : 'border-2 border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background'
                    }`}
                  >
                    {plan.cta}
                  </a>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Can I switch plans anytime?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, 
                    and we'll prorate the difference.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What happens if I exceed my monthly limit?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    You'll be notified when you're approaching your limit. You can upgrade your plan or 
                    purchase additional minutes as needed.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Do you offer refunds?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Yes, we offer a 30-day money-back guarantee for all paid plans. No questions asked.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Pricing;
