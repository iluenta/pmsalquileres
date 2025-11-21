"use client"

export function TailwindTest() {
  return (
    <div className="p-8 bg-muted">
      <h1 className="text-3xl font-bold text-foreground mb-4">Test Tailwind</h1>
      <p className="text-lg text-muted-foreground mb-6">Testing CSS variables</p>
      
      <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold text-card-foreground mb-3">Card Test</h2>
        <p className="text-muted-foreground">This should look like the guia folder</p>
        
        <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
          <div className="h-7 w-7 bg-primary rounded"></div>
        </div>
      </div>
    </div>
  )
}
