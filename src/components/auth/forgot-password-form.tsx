"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const schema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
})

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition()
  const [isSent, setIsSent] = useState(false)

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  })

  async function onSubmit(values: z.infer<typeof schema>) {
    startTransition(async () => {
      // In a real implementation we would call an API like `/api/auth/forgot-password`
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSent(true)
      toast.success("If an account exists, a reset link was sent.");
    })
  }

  if (isSent) {
    return (
      <div className="text-center space-y-4">
        <p className="text-zinc-300">
          Check your email for the reset link! If it doesn&apos;t appear within a few minutes, check your spam folder.
        </p>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input 
                  placeholder="name@example.com" 
                  {...field} 
                  className="bg-muted border-border text-foreground placeholder:text-muted-foreground" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={isPending} 
          className="w-full bg-gold text-black hover:bg-gold-light mt-6 font-semibold"
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send Reset Link
        </Button>
      </form>
    </Form>
  )
}
