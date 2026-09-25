"use client";

import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  LocateIcon,
  MapPinIcon,
  CalendarIcon,
  CreditCardIcon,
  Loader2,
  WifiIcon,
  XIcon,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import Image from "next/image";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const transportOptions = [
  { name: "KAI", icon: "/kai.svg" },
  { name: "TransJakarta", icon: "/transjakarta.svg" },
  { name: "MRT", icon: "/mrt.svg" },
  { name: "LRT Jakarta", icon: "/lrt-jakarta.svg" },
  { name: "LRT Jabodebek", icon: "/lrt-jabodebek.svg" },
] as const;

const paymentMethods = [{ name: "E-Money", icon: CreditCardIcon }] as const;

const FormSchema = z.object({
  currentLocation: z.string().min(2, {
    message: "Current location must be at least 2 characters.",
  }),
  destination: z.string().min(2, {
    message: "Destination must be at least 2 characters.",
  }),
  date: z.date({
    required_error: "Please select a date.",
  }),
  transport: z.enum(
    [transportOptions[0].name, ...transportOptions.slice(1).map((t) => t.name)],
    {
      required_error: "Please select a transport method.",
    },
  ),
  paymentMethod: z.enum(
    [paymentMethods[0].name, ...paymentMethods.slice(1).map((p) => p.name)],
    {
      required_error: "Please select a payment method.",
    },
  ),
});

type FormValues = z.infer<typeof FormSchema>;

export function TravelCard() {
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showNFCDialog, setShowNFCDialog] = useState(false);
  const [nfcSupported, setNfcSupported] = useState<boolean | null>(true);
  const [nfcStatus, setNfcStatus] = useState<
    "idle" | "scanning" | "success" | "error"
  >("idle");

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      currentLocation: "",
      destination: "",
      date: new Date(),
    },
  });

  const { mutate, data, isPending } = api.travel.getDistance.useMutation();

  useEffect(() => {
    const checkNfcSupport = async () => {
      if ("NDEFReader" in window) {
        setNfcSupported(true);
      } else {
        setNfcSupported(false);
      }
    };
    void checkNfcSupport();
  }, []);

  useEffect(() => {
    if (showNFCDialog && nfcSupported) {
      void handleNfcScan();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showNFCDialog, nfcSupported]);

  const getLocationAddress = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
      );
      const data = (await response.json()) as { display_name: string };
      return data.display_name;
    } catch (error) {
      console.error("Error fetching address:", error);
      return null;
    }
  };

  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (
        (name === "destination" || name === "currentLocation") &&
        value.currentLocation &&
        value.destination
      ) {
        mutate({
          start_destination: value.currentLocation,
          end_destination: value.destination,
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [form, mutate, form.watch]);

  const handleGetCurrentLocation = () => {
    setIsLoadingLocation(true);

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        getLocationAddress(latitude, longitude)
          .then((address) => {
            if (address) {
              form.setValue("currentLocation", address);
              toast.success("Location detected", {
                description: "Your current location has been set.",
              });
            } else {
              toast.error("Could not determine address");
            }
          })
          .catch(() => {
            toast.error("Error getting address");
          })
          .finally(() => {
            setIsLoadingLocation(false);
          });
      },
      (error: GeolocationPositionError) => {
        console.error("Error getting location:", error);
        toast.error("Error getting location", {
          description: error.message,
        });
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      },
    );
  };

  function onSubmit() {
    setShowNFCDialog(true);
  }

  const handleNfcScan = async () => {
    if (!nfcSupported) return;

    setNfcStatus("scanning");
    try {
      if (window.NDEFReader) {
        const ndef = new (window.NDEFReader as unknown as typeof NDEFReader)();
        await ndef.scan();

        ndef.addEventListener("readingerror", () => {
          setNfcStatus("error");
          toast.error("NFC Scan Failed", {
            description: "Cannot read data from the NFC tag. Try another one?",
          });
        });

        ndef.addEventListener("reading", () => {
          setNfcStatus("success");
          toast.success("NFC Scan Successful", {
            description: "Your payment has been processed.",
          });
          setTimeout(() => {
            setShowNFCDialog(false);
            form.reset();
          }, 2000);
        });
      } else {
        setNfcStatus("error");
        toast.error("NFC Error", {
          description: "NDEFReader is not available in this environment.",
        });
      }
    } catch (error) {
      console.error(error);
      setNfcStatus("error");
      toast.error("NFC Scan Failed", {
        description: "Please try again or use an alternative payment method.",
      });
    }
  };

  return (
    <>
      <Card className="w-full max-w-[485px]">
        <CardContent className="space-y-4 p-4 sm:p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full rounded-lg border-2 text-muted-foreground"
              >
                <div className="flex items-center gap-2 border-b-2 p-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 p-0"
                    onClick={handleGetCurrentLocation}
                    disabled={isLoadingLocation}
                  >
                    {isLoadingLocation ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <LocateIcon size={20} />
                    )}
                  </Button>
                  <FormField
                    control={form.control}
                    name="currentLocation"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <div className="flex w-full flex-col">
                            <span className="text-xs">Current Location</span>
                            <Input
                              {...field}
                              placeholder="Choose your current location"
                              className="h-fit rounded-none border-0 bg-transparent p-0 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-0"
                              onClick={handleGetCurrentLocation}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex items-center gap-2 p-3">
                  <MapPinIcon className="text-blue-500" size={20} />
                  <FormField
                    control={form.control}
                    name="destination"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <div className="flex w-full flex-col">
                            <span className="text-xs text-blue-500">
                              Destination
                            </span>
                            <Input
                              {...field}
                              placeholder="Set your destination"
                              className="h-fit rounded-none border-0 bg-transparent p-0 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-0"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full justify-start border-2 text-left font-normal text-muted-foreground"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Schedule Date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            autoFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <FormField
                  control={form.control}
                  name="transport"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex w-full flex-col items-start justify-center gap-2 rounded-lg border-2 bg-white p-3 text-muted-foreground">
                        <FormLabel className="text-sm font-medium">
                          Transport
                        </FormLabel>
                        <FormControl>
                          <div className="grid h-fit w-full grid-cols-5 gap-2">
                            {transportOptions.map((transport) => (
                              <Button
                                key={transport.name}
                                type="button"
                                variant="outline"
                                onClick={() => field.onChange(transport.name)}
                                className={`aspect-square h-fit w-full flex-col gap-2 p-1 md:p-2 ${
                                  field.value === transport.name
                                    ? "bg-gray-300 text-muted-foreground"
                                    : ""
                                }`}
                              >
                                <Image
                                  src={transport.icon}
                                  alt={transport.name}
                                  width={100}
                                  height={100}
                                  className="h-8 w-8 rounded-md object-contain sm:h-10 sm:w-10"
                                />
                                <span className="hidden text-[8px] sm:inline">
                                  {transport.name}
                                </span>
                              </Button>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="grid grid-cols-2 gap-4"
              >
                <div className="flex w-full items-center justify-between gap-2 rounded-lg border-2 bg-white p-3 text-muted-foreground">
                  <span className="text-xs font-medium sm:text-sm">
                    Distance
                  </span>
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span className="text-xs font-bold sm:text-sm">
                      {data?.object.distance} km
                    </span>
                  )}
                </div>
                <div className="flex w-full items-center justify-between gap-2 rounded-lg border-2 bg-white p-3 text-muted-foreground">
                  <span className="text-xs font-medium sm:text-sm">Points</span>
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span className="text-xs font-bold sm:text-sm">
                      {(data?.object.distance ?? 0) * 10} pts
                    </span>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex w-full flex-col items-start justify-center gap-2 rounded-lg border-2 bg-white p-3 text-muted-foreground">
                        <FormLabel className="text-sm font-medium">
                          Payment Methods
                        </FormLabel>
                        <FormControl>
                          <div className="grid h-fit w-full gap-2">
                            {paymentMethods.map((method) => (
                              <Button
                                key={method.name}
                                type="button"
                                variant="outline"
                                onClick={() => field.onChange(method.name)}
                                className={`h-fit w-full flex-col gap-1 sm:gap-2 sm:p-2 ${
                                  field.value === method.name
                                    ? "bg-gray-300 text-muted-foreground"
                                    : ""
                                }`}
                              >
                                <method.icon className="h-6 w-6 sm:h-8 sm:w-8" />
                                <span className="text-[10px] sm:text-xs">
                                  {method.name}
                                </span>
                              </Button>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Button
                  type="submit"
                  className="w-full bg-primary"
                  disabled={isPending}
                >
                  Claim Now
                </Button>
              </motion.div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <AlertDialog open={showNFCDialog} onOpenChange={setShowNFCDialog}>
        <AlertDialogContent className="flex h-fit max-w-xs flex-col rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Scan with NFC to Pay</AlertDialogTitle>
            <AlertDialogDescription>
              {nfcSupported
                ? "Please tap your NFC-enabled device to complete the payment."
                : "Your device does not support NFC. Please use an alternative payment method."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="flex h-24 w-24 items-center justify-center">
              <AnimatePresence mode="wait">
                {nfcSupported && nfcStatus === "idle" && (
                  <motion.div
                    key="wifi"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <WifiIcon className="h-24 w-24 text-blue-500" />
                  </motion.div>
                )}
                {nfcSupported && nfcStatus === "scanning" && (
                  <motion.div
                    key="scanning"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Loader2 className="h-24 w-24 animate-spin text-blue-500" />
                  </motion.div>
                )}
                {nfcSupported && nfcStatus === "success" && (
                  <motion.div
                    key="success"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <CheckCircle className="h-24 w-24 text-green-500" />
                  </motion.div>
                )}
                {(nfcStatus === "error" || !nfcSupported) && (
                  <motion.div
                    key="error"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <XIcon className="h-24 w-24 text-red-500" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="text-center text-sm">
              {nfcSupported && nfcStatus === "idle" && "Ready to scan"}
              {nfcSupported && nfcStatus === "scanning" && "Scanning..."}
              {nfcSupported && nfcStatus === "success" && "Payment successful!"}
              {nfcSupported &&
                nfcStatus === "error" &&
                "Scan failed. Please try again."}
            </div>
          </div>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {nfcSupported && nfcStatus === "idle" && (
            <AlertDialogAction onClick={handleNfcScan}>
              Start NFC Scan
            </AlertDialogAction>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
