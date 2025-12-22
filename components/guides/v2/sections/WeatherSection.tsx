import { WeatherWidget } from "@/components/weather/WeatherWidget"

interface WeatherSectionProps {
    latitude: number | null
    longitude: number | null
    propertyName?: string
    locality?: string | null
}

export function WeatherSection({ latitude, longitude, propertyName, locality }: WeatherSectionProps) {
    return (
        <section className="bg-white py-2 px-4 md:px-8">
            <div className="max-w-5xl mx-auto">
                <WeatherWidget
                    latitude={latitude}
                    longitude={longitude}
                    propertyName={propertyName}
                    locality={locality}
                />
            </div>
        </section>
    )
}
