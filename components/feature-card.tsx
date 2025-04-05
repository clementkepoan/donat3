import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { ReactNode } from "react"

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-col items-center pb-2">
        {icon}
        <h3 className="text-xl font-bold mt-4">{title}</h3>
      </CardHeader>
      <CardContent className="text-center text-muted-foreground">{description}</CardContent>
    </Card>
  )
}

