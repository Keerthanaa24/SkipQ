import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, CreditCard, Bell, Smartphone, ChefHat, Users, Zap, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const features = [
  {
    icon: <Clock className="w-8 h-8" />,
    title: 'Skip the Queue',
    description: 'Order ahead and pick up your food without waiting in long lines.',
  },
  {
    icon: <CreditCard className="w-8 h-8" />,
    title: 'Digital Payments',
    description: 'Pay securely via UPI, cards, or wallets. No cash hassle.',
  },
  {
    icon: <Bell className="w-8 h-8" />,
    title: 'Real-time Updates',
    description: 'Get notified when your order is ready for pickup.',
  },
  {
    icon: <Smartphone className="w-8 h-8" />,
    title: 'Token System',
    description: 'Receive a digital token number for easy collection.',
  },
];

const stats = [
  { value: '500+', label: 'Daily Orders' },
  { value: '15min', label: 'Avg. Wait Time Saved' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '5', label: 'Canteens' },
];

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
                <Zap className="w-4 h-4" />
                Now live at PSG Tech
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6 animate-slide-up">
                Skip the Queue,
                <br />
                <span className="gradient-text">Not Your Meal</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
                Order food from your college canteen instantly. Pay digitally, get a token, 
                and pick up when ready. No more waiting in long queues!
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <Link to="/register">
                  <Button variant="hero" size="xl">
                    Get Started
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="xl">
                    I already have an account
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 border-y border-border bg-card/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-3xl md:text-4xl font-display font-bold gradient-text mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Why Choose SkipQ?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We've reimagined the canteen experience for the digital age. 
                Here's what makes SkipQ the smart choice for hungry students.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card key={index} variant="elevated" className="group hover:border-primary/50 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      {React.cloneElement(feature.icon, { className: 'w-7 h-7 text-primary-foreground' })}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-20 md:py-32 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                How It Works
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Getting your food has never been easier. Follow these simple steps.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                { step: '01', title: 'Browse & Order', desc: 'Check the live menu and add your favorite items to cart.', icon: <ChefHat className="w-6 h-6" /> },
                { step: '02', title: 'Pay Digitally', desc: 'Complete payment via UPI or card. Fast and secure.', icon: <CreditCard className="w-6 h-6" /> },
                { step: '03', title: 'Collect & Enjoy', desc: 'Get notified and pick up using your token number.', icon: <Users className="w-6 h-6" /> },
              ].map((item, index) => (
                <div key={index} className="relative text-center">
                  <div className="w-16 h-16 rounded-2xl gradient-primary mx-auto mb-4 flex items-center justify-center glow-primary">
                    {item.icon}
                  </div>
                  <span className="absolute top-0 right-1/4 text-6xl font-display font-bold text-primary/10">
                    {item.step}
                  </span>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Smart Features Preview */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
                  <TrendingUp className="w-4 h-4" />
                  
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                  AI-Powered Smart Features
                </h2>
                <p className="text-muted-foreground">
                  Powered by Google Gemini, we're building intelligent features to make your experience even better.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card variant="elevated" className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                      <Clock className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Peak Time Prediction</h3>
                      <p className="text-sm text-muted-foreground">
                        Know the best time to order and avoid rush hours with AI predictions.
                      </p>
                    </div>
                  </div>
                </Card>
                <Card variant="elevated" className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Food Wastage Analytics</h3>
                      <p className="text-sm text-muted-foreground">
                        Helping canteens reduce waste with smart demand forecasting.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32 bg-gradient-to-b from-card/50 to-background">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Ready to Skip the Queue?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of students who are already saving time with SkipQ.
            </p>
            <Link to="/register">
              <Button variant="hero" size="xl">
                Create Free Account
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Landing;
