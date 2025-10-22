import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Lightbulb, Zap, Users, TrendingUp, ArrowRight } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-3 group">
  <img
    src="/gimme-idea-logo.png"
    alt="Gimme Idea"
    className="w-10 h-10 rounded-lg border border-border/60 shadow-sm group-hover:shadow-md transition-shadow"
  />
  <span className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
    Gimme Idea
  </span>
</Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-primary hover:bg-primary/90">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Get Feedback on Your Ideas with{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI-Powered Insights
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-balance max-w-2xl mx-auto">
            Share your projects, get constructive feedback from the community, and leverage AI moderation to filter spam
            and surface the most valuable insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-primary hover:bg-primary/90 gap-2">
                Start Sharing Ideas <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/browse">
              <Button size="lg" variant="outline" className="gap-2 bg-transparent">
                Browse Ideas
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16 text-foreground">Why Gimme Idea?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-8 h-8" />,
                title: "AI-Powered Moderation",
                description: "IdeaBot filters spam and highlights the most valuable feedback automatically.",
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Community Feedback",
                description: "Get constructive criticism from real people who care about your ideas.",
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Earn Rewards",
                description: "Get compensated for providing valuable feedback to other creators.",
              },
            ].map((feature, i) => (
              <div key={i} className="glass p-8 rounded-xl border hover:border-primary/50 transition-all duration-300">
                <div className="text-primary mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto glass p-12 rounded-2xl border text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Share Your Ideas?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of creators getting feedback and building better products.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-6 text-center text-muted-foreground">
        <p>&copy; 2025 Gimme Idea. All rights reserved.</p>
      </footer>
    </div>
  )
}
