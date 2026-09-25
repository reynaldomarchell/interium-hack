"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { StepItems } from "./data";
import Steps from "@/components/tutorial/steps";
import {
  TransportSliderButton,
  TransportSliderImage,
} from "@/components/tutorial/transport-slider";
import { SetRouteForm, SetRouteHero } from "@/components/tutorial/set-route";
import {
  ClaimPointForm,
  ClaimPointHero,
} from "@/components/tutorial/claim-point";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import type { Variant } from "framer-motion";

type NavigationDirection = "next" | "prev";
type StepKey = "select-transport" | "set-route" | "claim-points";

interface SlideAnimation {
  [key: string]:
    | Variant
    | {
        type: string;
        stiffness: number;
        damping: number;
        duration: number;
      };
  initial: Variant;
  animate: Variant;
  exit: Variant;
  transition: {
    type: string;
    stiffness: number;
    damping: number;
    duration: number;
  };
}

interface SlideAnimations {
  left: SlideAnimation;
  right: SlideAnimation;
}

const getSlideAnimations = (
  direction: NavigationDirection,
): SlideAnimations => ({
  left: {
    initial: { x: direction === "next" ? 50 : -50, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: direction === "next" ? -50 : 50, opacity: 0 },
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      duration: 0.3,
    },
  },
  right: {
    initial: { x: direction === "next" ? -50 : 50, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: direction === "next" ? 50 : -50, opacity: 0 },
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      duration: 0.3,
    },
  },
});

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 },
} as const;

export default function TutorialPageClient(): React.JSX.Element {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<StepKey>("select-transport");
  const [direction, setDirection] = useState<NavigationDirection>("next");

  const handleNavigationStep = (type: NavigationDirection): void => {
    const currentStepIndex = StepItems.findIndex(
      (step) => step.key === currentStep,
    );

    setDirection(type);

    if (type === "next") {
      const nextStepIndex = currentStepIndex + 1;
      if (nextStepIndex < StepItems.length) {
        if (StepItems[nextStepIndex]) {
          setCurrentStep(StepItems[nextStepIndex].key as StepKey);
        }
      } else {
        router.push("/profile");
      }
    } else {
      const prevStepIndex = currentStepIndex - 1;
      if (prevStepIndex >= 0 && StepItems[prevStepIndex]) {
        setCurrentStep(StepItems[prevStepIndex].key as StepKey);
      }
    }
  };

  const renderLeftComponent = (step: StepKey): React.JSX.Element | null => {
    switch (step) {
      case "select-transport":
        return (
          <TransportSliderButton
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
          />
        );
      case "set-route":
        return <SetRouteHero />;
      case "claim-points":
        return <ClaimPointHero />;
      default:
        return null;
    }
  };

  const renderRightComponent = (step: StepKey): React.JSX.Element | null => {
    switch (step) {
      case "select-transport":
        return <TransportSliderImage selectedIndex={selectedIndex} />;
      case "set-route":
        return <SetRouteForm />;
      case "claim-points":
        return <ClaimPointForm />;
      default:
        return null;
    }
  };

  const currentStepIndex = StepItems.findIndex(
    (step) => step.key === currentStep,
  );
  const slideAnimations = getSlideAnimations(direction);

  return (
    <LayoutGroup>
      <motion.div
        className="flex min-h-svh flex-col md:h-svh md:flex-row"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={`background-${currentStep}`}
            className="absolute inset-0 -z-10 blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              background: `url(${
                StepItems.find((step) => currentStep === step.key)
                  ?.backgroundImage
              }) no-repeat center center fixed`,
              backgroundSize: "cover",
            }}
          />
        </AnimatePresence>

        {/* Left Section */}
        <motion.div
          className={`flex flex-col justify-center p-6 md:w-[40%] md:p-8 ${
            currentStep === "select-transport" ? "bg-primary text-white" : ""
          }`}
          layoutId="left-section"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`left-${currentStep}`}
              variants={slideAnimations.right}
              initial="initial"
              animate="animate"
              exit="exit"
              layoutId={`left-content-${currentStep}`}
            >
              {renderLeftComponent(currentStep)}
            </motion.div>
          </AnimatePresence>
          <Steps currentStep={currentStep} />
        </motion.div>

        {/* Right Section */}
        <motion.div
          className="flex flex-col items-center justify-center gap-4 p-6 md:w-[60%] md:p-8"
          layoutId="right-section"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`right-${currentStep}`}
              className="flex w-full flex-col items-center justify-center gap-4"
              variants={slideAnimations.left}
              initial="initial"
              animate="animate"
              exit="exit"
              layoutId={`right-content-${currentStep}`}
            >
              {renderRightComponent(currentStep)}
            </motion.div>
          </AnimatePresence>

          <motion.div
            className="flex gap-4"
            variants={fadeIn}
            initial="initial"
            animate="animate"
            layoutId="navigation-buttons"
          >
            {currentStepIndex > 0 && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => handleNavigationStep("prev")}
                  className="w-full rounded-full border-2 border-blue-600 bg-transparent text-primary hover:bg-blue-50 md:w-32"
                  variant="outline"
                >
                  Previous
                </Button>
              </motion.div>
            )}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => handleNavigationStep("next")}
                className="w-full rounded-full bg-gradient-to-b from-primary to-blue-400 hover:bg-blue-700 md:w-32"
              >
                {currentStepIndex === StepItems.length - 1 ? "Finish" : "Next"}
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </LayoutGroup>
  );
}
