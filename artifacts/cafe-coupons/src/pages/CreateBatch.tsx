import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useCreateBatch, CreateBatchBodyDiscountType, CreateBatchBodyLanguage } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CouponCard } from "@/components/CouponCard";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  quantity: z.coerce.number().min(1).max(100),
  discountType: z.enum(["percentage", "fixed", "free_item"]),
  discountValue: z.coerce.number().optional(),
  freeItemName: z.string().optional(),
  displayTitle: z.string().min(1, "Title is required"),
  displaySubtitle: z.string().optional(),
  language: z.enum(["en", "tr"]).default("en"),
  backgroundColor: z.string().default("#FDFBF7"),
  logoUrl: z.string().url().optional().or(z.literal("")),
  footerText: z.string().optional(),
  expiresAt: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateBatch() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 10,
      discountType: "percentage",
      discountValue: 15,
      displayTitle: "15% Off Your Next Coffee",
      displaySubtitle: "Show this to your barista",
      language: "en",
      backgroundColor: "#e8f0e4", // A nice soft sage green default
      footerText: "Valid at all locations. One per customer.",
    }
  });

  const watchAllFields = form.watch();

  const createBatchMutation = useCreateBatch({
    mutation: {
      onSuccess: (data) => {
        toast({
          title: "Batch Created",
          description: `Successfully generated ${data.quantity} coupons.`,
        });
        setLocation(`/batches/${data.id}`);
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: "Failed to create batch. Please try again.",
          variant: "destructive"
        });
      }
    }
  });

  const onSubmit = (data: FormValues) => {
    const payload: any = {
      ...data,
      logoUrl: data.logoUrl || undefined,
    };
    
    if (data.expiresAt) {
      payload.expiresAt = new Date(data.expiresAt).toISOString();
    } else {
      delete payload.expiresAt;
    }

    createBatchMutation.mutate({ data: payload });
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground">Create Coupon Batch</h1>
          <p className="text-muted-foreground mt-1">Generate a new batch of printable QR coupons.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Side */}
          <div className="lg:col-span-7">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <Card>
                  <CardHeader>
                    <CardTitle>Offer Details</CardTitle>
                    <CardDescription>What kind of discount are you providing?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity to generate</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="discountType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discount Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="percentage">Percentage (%)</SelectItem>
                                <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                                <SelectItem value="free_item">Free Item</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {watchAllFields.discountType === "free_item" ? (
                      <FormField
                        control={form.control}
                        name="freeItemName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Free Item Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Free Latte" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <FormField
                        control={form.control}
                        name="discountValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discount Value</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Visual Design</CardTitle>
                    <CardDescription>How the coupon will look when printed</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="displayTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Main Headline</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 15% Off Your Next Coffee" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="displaySubtitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subtitle (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Valid on any espresso beverage" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="backgroundColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Background Color</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input type="color" className="w-16 p-1 h-10" {...field} />
                              </FormControl>
                              <Input type="text" className="flex-1" {...field} />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="logoUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Logo URL (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="footerText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fine Print / Footer Text</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Terms and conditions..." className="resize-none h-20" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="expiresAt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expiration Date (Optional)</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="language"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Language</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="tr">Turkish</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end pt-4 pb-12">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full md:w-auto font-bold px-8"
                    disabled={createBatchMutation.isPending}
                  >
                    {createBatchMutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                    Generate {watchAllFields.quantity || 0} Coupons
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* Preview Side */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-8">
              <h3 className="text-lg font-serif font-bold mb-4">Live Preview</h3>
              <p className="text-sm text-muted-foreground mb-6">This is how your coupons will look when printed.</p>
              
              <div className="flex justify-center bg-muted/30 p-8 rounded-xl border border-dashed">
                <CouponCard
                  code="PREVIEW-1234"
                  batchId={0}
                  discountType={watchAllFields.discountType}
                  discountValue={watchAllFields.discountValue}
                  freeItemName={watchAllFields.freeItemName}
                  displayTitle={watchAllFields.displayTitle || "Your Title Here"}
                  displaySubtitle={watchAllFields.displaySubtitle}
                  backgroundColor={watchAllFields.backgroundColor}
                  logoUrl={watchAllFields.logoUrl}
                  footerText={watchAllFields.footerText}
                  expiresAt={watchAllFields.expiresAt}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
