import { Award, Clock, Users, Shield } from "lucide-react"

const trustItems = [
  {
    icon: Clock,
    stat: "30+",
    label: "Years Experience",
    description: "Three decades of expertise in pond design and construction across the South West.",
  },
  {
    icon: Users,
    stat: "500+",
    label: "Projects Completed",
    description: "From intimate garden ponds to grand commercial installations.",
  },
  {
    icon: Award,
    stat: "100%",
    label: "Client Satisfaction",
    description: "Every project delivered to the highest standards with a full aftercare guarantee.",
  },
  {
    icon: Shield,
    stat: "10yr",
    label: "Warranty",
    description: "All major builds come with our comprehensive long-term warranty.",
  },
]

export function TrustSection() {
  return (
    <section className="bg-card py-20" aria-label="Why choose Cornwall Ponds">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-14">
          <span className="text-xs font-medium tracking-widest uppercase text-primary">Why Choose Us</span>
          <h2 className="mt-3 font-serif text-3xl font-bold text-foreground sm:text-4xl text-balance">
            Trusted by Homeowners Across Cornwall
          </h2>
          <p className="mt-4 mx-auto max-w-2xl text-muted-foreground leading-relaxed">
            With over three decades of hands-on experience, we bring unmatched expertise and genuine passion to every project we undertake.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map((item) => (
            <div key={item.label} className="flex flex-col items-center text-center p-6 rounded-lg bg-background border border-border/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <span className="font-serif text-3xl font-bold text-primary">{item.stat}</span>
              <span className="mt-1 text-sm font-semibold text-foreground">{item.label}</span>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
