import { Hero } from "@/components/hero"
import { ValueProposition } from "@/components/value-proposition"
import { WeatherWidget } from "@/components/weather-widget"
import { ApartmentSection } from "@/components/apartment-section"
import { HouseRulesSection } from "@/components/house-rules-section"
import { HouseGuideSection } from "@/components/house-guide-section"
import { TipsSection } from "@/components/tips-section"
import { BeachesSection } from "@/components/beaches-section"
import { RestaurantsSection } from "@/components/restaurants-section"
import { ActivitiesSection } from "@/components/activities-section"
import { PracticalInfoSection } from "@/components/practical-info-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"
import { Navigation } from "@/components/navigation"

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <ValueProposition />
      <WeatherWidget />
      <ApartmentSection />
      <HouseRulesSection />
      <HouseGuideSection />
      <TipsSection />
      <BeachesSection />
      <RestaurantsSection />
      <ActivitiesSection />
      <PracticalInfoSection />
      <ContactSection />
      <Footer />
    </main>
  )
}
