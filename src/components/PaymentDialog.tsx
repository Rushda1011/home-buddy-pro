import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CreditCard, Landmark, QrCode, ShieldCheck, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PaymentDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  amount: number
  month: string
  year: number
  onSuccess: () => void
}

export function PaymentDialog({ isOpen, onOpenChange, amount, month, year, onSuccess }: PaymentDialogProps) {
  const [step, setStep] = useState<"method" | "details" | "processing" | "success">("method")
  const [method, setMethod] = useState("upi")
  const { toast } = useToast()

  const handleNext = () => {
    if (step === "method") setStep("details")
    else if (step === "details") {
      setStep("processing")
      setTimeout(() => {
        setStep("success")
        onSuccess()
        toast({
          title: "Payment Successful",
          description: `₹${amount.toLocaleString()} paid for ${month} ${year}.`,
        })
      }, 2000)
    }
  }

  const reset = () => {
    setStep("method")
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        {step !== "success" && (
          <DialogHeader>
            <DialogTitle>Complete Your Payment</DialogTitle>
            <DialogDescription>
              Paying ₹{amount.toLocaleString()} for {month} {year} rent.
            </DialogDescription>
          </DialogHeader>
        )}

        {step === "method" && (
          <div className="py-4">
            <RadioGroup value={method} onValueChange={setMethod} className="grid grid-cols-1 gap-4">
              <Label
                htmlFor="upi"
                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  method === "upi" ? "border-primary bg-primary/5" : "border-muted"
                }`}
              >
                <div className="flex items-center gap-3">
                  <QrCode className="h-5 w-5 text-primary" />
                  <span className="font-semibold">UPI (PhonePe, GPay, Paytm)</span>
                </div>
                <RadioGroupItem value="upi" id="upi" className="sr-only" />
              </Label>
              <Label
                htmlFor="card"
                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  method === "card" ? "border-primary bg-primary/5" : "border-muted"
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Credit / Debit Card</span>
                </div>
                <RadioGroupItem value="card" id="card" className="sr-only" />
              </Label>
              <Label
                htmlFor="netbanking"
                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  method === "netbanking" ? "border-primary bg-primary/5" : "border-muted"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Landmark className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Net Banking</span>
                </div>
                <RadioGroupItem value="netbanking" id="netbanking" className="sr-only" />
              </Label>
            </RadioGroup>
          </div>
        )}

        {step === "details" && (
          <div className="py-4 space-y-4">
            {method === "upi" ? (
              <div className="space-y-2">
                <Label htmlFor="vpa">UPI ID / VPA</Label>
                <Input id="vpa" placeholder="username@okaxis" defaultValue="student@upi" />
                <p className="text-[10px] text-muted-foreground">A payment request will be sent to your UPI app.</p>
              </div>
            ) : method === "card" ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="card-num">Card Number</Label>
                  <Input id="card-num" placeholder="XXXX XXXX XXXX XXXX" defaultValue="4242 4242 4242 4242" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="expiry">Expiry</Label>
                    <Input id="expiry" placeholder="MM/YY" defaultValue="12/28" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" placeholder="XXX" type="password" defaultValue="123" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Select Bank</Label>
                <div className="p-3 rounded-lg border bg-muted/50 text-sm font-medium">State Bank of India</div>
              </div>
            )}
            <div className="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground bg-muted/30 rounded-lg font-medium">
              <ShieldCheck className="h-3 w-3 text-success" />
              Secure 256-bit SSL Encrypted Payment
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="font-semibold text-foreground">Processing your payment...</p>
            <p className="text-sm text-muted-foreground">Please do not refresh or close the window.</p>
          </div>
        )}

        {step === "success" && (
          <div className="py-8 flex flex-col items-center justify-center space-y-4 animate-fade-in text-center">
            <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center text-success mb-2">
              <ShieldCheck className="h-10 w-10" />
            </div>
            <DialogTitle className="text-2xl font-bold">Payment Confirmed!</DialogTitle>
            <p className="text-muted-foreground">
              Your rent for {month} {year} has been successfully paid.
            </p>
            <Button className="w-full mt-4" onClick={reset}>
              Close & View Receipt
            </Button>
          </div>
        )}

        {step !== "processing" && step !== "success" && (
          <DialogFooter>
            <Button variant="ghost" onClick={() => (step === "details" ? setStep("method") : onOpenChange(false))}>
              {step === "details" ? "Back" : "Cancel"}
            </Button>
            <Button onClick={handleNext} variant="hero">
              {step === "method" ? "Continue" : `Pay ₹${amount.toLocaleString()}`}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
