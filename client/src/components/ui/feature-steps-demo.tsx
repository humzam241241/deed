import { FeatureSteps } from "@/components/ui/feature-section"

const features = [
  {
    step: "Step 1",
    title: "Learn the Basics",
    content:
      "Start your custom apparel journey by understanding materials, fits, and print options.",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop",
  },
  {
    step: "Step 2",
    title: "Design Your Drop",
    content:
      "Collaborate with our team to finalize colors, placements, and branding for every piece.",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2069&auto=format&fit=crop",
  },
  {
    step: "Step 3",
    title: "Launch and Deliver",
    content:
      "We produce and ship your apparel so your club or team can launch confidently and on time.",
    image:
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=2070&auto=format&fit=crop",
  },
]

export function FeatureStepsDemo() {
  return (
    <section className="bg-background">
      <FeatureSteps
        features={features}
        title="Your Apparel Journey Starts Here"
        autoPlayInterval={4000}
        imageHeight="h-[500px]"
      />
    </section>
  )
}
