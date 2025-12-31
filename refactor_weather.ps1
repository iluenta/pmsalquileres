$filePath = 'c:\Proyectos\PMSAlquileres\pmsalquileres\lib_weather_master.ts'
$content = Get-Content $filePath -Raw

# Update transformGoogleCurrentWeather signature and call
$content = $content -replace 'function transformGoogleCurrentWeather\(data: any\): CurrentWeather \{', 'function transformGoogleCurrentWeather(data: any, lang: string = "es"): CurrentWeather {'
$content = $content -replace 'const weatherInfo = getWeatherDescription\(weatherCode\);', 'const weatherInfo = getWeatherDescription(weatherCode, lang);'

# Fix transformGoogleCurrentWeather return call in getCurrentWeather
$content = $content -replace 'return transformGoogleCurrentWeather\(data\);', 'return transformGoogleCurrentWeather(data, lang);'

# Fix weatherMap type to any to avoid complex type errors
$content = $content -replace 'const weatherMap: Record<string, { \[key: string\]: any; icon: string }> =', 'const weatherMap: any ='

# Fix getWeatherData internals missing calls
$content = $content -replace 'current = await getCurrentWeather\(lat, lon\);', 'current = await getCurrentWeather(lat, lon, lang);'
$content = $content -replace 'forecast = await getWeatherForecast\(lat, lon\);', 'forecast = await getWeatherForecast(lat, lon, lang);'

[System.IO.File]::WriteAllText($filePath, $content)
