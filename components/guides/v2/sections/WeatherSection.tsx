import { WeatherWidget } from "@/components/weather/WeatherWidget"

interface WeatherSectionProps {
    latitude: number | null
    longitude: number | null
    propertyName?: string
    locality?: string | null
    currentLanguage?: string
}

export function WeatherSection({ latitude, longitude, propertyName, locality, currentLanguage }: WeatherSectionProps) {
    return (
        <section className="bg-white py-2 px-4 md:px-8">
            <div className="max-w-5xl mx-auto">
                <WeatherWidget
                    latitude={latitude}
                    longitude={longitude}
                    propertyName={propertyName}
                    locality={locality}
                    currentLanguage={currentLanguage}
                />
            </div>
        </section>
    )
}
