import type { PropertyGuide } from "@/types/guides"

interface GuideHeaderProps {
    guide: PropertyGuide
}

export function GuideHeader({ guide }: GuideHeaderProps) {
    return (
        <header className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 text-white py-6 md:py-8 relative overflow-hidden transition-all duration-300">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
                    <h1 className="text-xl md:text-2xl font-bold text-balance text-center">
                        {guide.title}
                    </h1>
                    <span className="hidden md:inline text-blue-300">|</span>
                    <p className="text-sm md:text-base text-blue-100 text-pretty max-w-xl text-center">
                        Tu compañero esencial para disfrutar al máximo tu estancia
                    </p>
                </div>
            </div>
        </header>
    )
}
