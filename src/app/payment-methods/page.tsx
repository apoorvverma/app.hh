"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CreditCardIcon, PlusCircleIcon } from "lucide-react"

export default function PaymentMethodsPage() {
  const router = useRouter()
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, type: "Visa", last4: "1234", primary: true },
    { id: 2, type: "Mastercard", last4: "5678", primary: false },
  ])

  const handleSetPrimary = (id: number) => {
    setPaymentMethods(
      paymentMethods.map((method) => ({
        ...method,
        primary: method.id === id,
      })),
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup defaultValue={paymentMethods.find((m) => m.primary)?.id.toString()}>
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center space-x-2 bg-white p-4 rounded shadow mb-4">
                <RadioGroupItem value={method.id.toString()} id={`method-${method.id}`} />
                <Label htmlFor={`method-${method.id}`} className="flex items-center space-x-2 cursor-pointer">
                  <CreditCardIcon className="h-5 w-5" />
                  <span>
                    {method.type} ending in {method.last4}
                  </span>
                  {method.primary && <span className="text-green-600 text-sm">(Primary)</span>}
                </Label>
                <Button variant="ghost" size="sm" onClick={() => handleSetPrimary(method.id)} disabled={method.primary}>
                  Set as Primary
                </Button>
              </div>
            ))}
          </RadioGroup>
          <Button className="w-full mt-4">
            <PlusCircleIcon className="h-4 w-4 mr-2" />
            Add New Payment Method
          </Button>
        </CardContent>
      </Card>
      <Button className="mt-4" onClick={() => router.push("/home")}>
        Back to Home
      </Button>
    </div>
  )
}

