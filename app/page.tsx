// path = /Users/kushshah/source/repos/onepercent/onepercent/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  ListTodo,
  TrendingUp,
  CheckCircle2,
  Flame,
  Sprout,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { SignUpButton, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { BetaTag } from "@/components/BetaTag";

export default function Component() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const navigateToMultiProjectBoard = () => {
    router.push("/multi-project-board");
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const days = ["Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed"];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center justify-center">
        <div className="container flex items-center justify-between">
          <Link className="flex items-center justify-center" href="#">
            <span className="text-lg font-bold">OnePercent</span>
            <BetaTag />
          </Link>
          <nav className="flex gap-4 sm:gap-6 items-center">
            <Link
              className="text-sm font-medium hover:underline underline-offset-4"
              href="#"
            >
              Features
            </Link>
            {/* <Link
              className="text-sm font-medium hover:underline underline-offset-4"
              href="#"
            >
              Pricing
            </Link> */}
            <Link
              className="text-sm font-medium hover:underline underline-offset-4"
              href="#"
            >
              About
            </Link>
            <SignedIn>
              <Button
                onClick={navigateToMultiProjectBoard}
                className="bg-green-600 hover:bg-green-700"
              >
                Home
              </Button>
            </SignedIn>
            <SignedOut>
              <SignInButton forceRedirectUrl={"/multi-project-board"}>
                <Button className="bg-green-600 hover:bg-green-700">
                  Login
                </Button>
              </SignInButton>
            </SignedOut>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6 mx-auto flex flex-col items-center justify-center text-center">
            <motion.div
              className="flex flex-col items-center space-y-4"
              initial="hidden"
              animate={isLoaded ? "visible" : "hidden"}
              variants={containerVariants}
            >
              <motion.div className="space-y-2" variants={itemVariants}>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Grow Your Goals
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Complete just 1% daily. Turn your projects green and watch
                  small wins add up! 🌱
                </p>
              </motion.div>
              <motion.div className="space-x-4" variants={itemVariants}>
                {/* redirect to /multi-project-board after signup */}
                <SignUpButton forceRedirectUrl={"/multi-project-board"}>
                  <Button className="bg-green-600 hover:bg-green-700">
                    Get Started
                  </Button>
                </SignUpButton>
                <Button variant="outline">Learn More</Button>
              </motion.div>
            </motion.div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6 mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
              <Card className="flex flex-col items-center space-y-4">
                <CardContent className="p-6 flex flex-col items-center space-y-4">
                  <div className="size-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <TrendingUp className="size-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold">Daily Progress</h3>
                  <p className="text-center text-gray-500 dark:text-gray-400">
                    Track your daily improvements with beautiful progress
                    indicators
                  </p>
                  <Progress className="w-[80%]" value={80} />
                </CardContent>
              </Card>
              <Card className="flex flex-col items-center space-y-4">
                <CardContent className="p-6 flex flex-col items-center space-y-4">
                  <div className="size-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <Trophy className="size-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold">Build Streaks</h3>
                  <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
                    Maintain consistency and build powerful habits through
                    streaks
                  </p>
                  <div className="flex flex-col items-center space-y-4">
                    <Flame className="size-12 text-red-600" />
                    <div className="flex items-center gap-1 bg-white rounded-full p-2 shadow-sm">
                      {days.map((day, index) => (
                        <div key={day} className="flex flex-col items-center">
                          <div
                            className={`size-6 rounded-full flex items-center justify-center ${
                              index < 4 ? "bg-green-100" : "bg-gray-100"
                            }`}
                          >
                            {index < 4 && (
                              <CheckCircle2 className="size-4 text-green-600" />
                            )}
                          </div>
                          <span className="text-xs mt-1 font-medium">
                            {day}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="flex flex-col items-center space-y-4">
                <CardContent className="p-6 flex flex-col items-center space-y-4">
                  <div className="size-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <ListTodo className="size-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold">Project Tasks</h3>
                  <p className="text-center text-gray-500 dark:text-gray-400 mb-4">
                    Organize your goals into manageable daily tasks
                  </p>
                  <div className="w-full space-y-4 text-left">
                    <div className="space-y-2">
                      <h4 className="font-semibold">Learn a New Language</h4>
                      <ul className="space-y-1">
                        <li className="flex items-center">
                          <CheckCircle2 className="size-4 text-green-600 mr-2" />
                          <span className="text-sm">
                            Practice vocabulary (10 mins)
                          </span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle2 className="size-4 text-green-600 mr-2" />
                          <span className="text-sm">
                            Listen to a podcast (15 mins)
                          </span>
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Get in Shape</h4>
                      <ul className="space-y-1">
                        <li className="flex items-center">
                          <CheckCircle2 className="size-4 text-green-600 mr-2" />
                          <span className="text-sm">30-minute workout</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle2 className="size-4 text-green-600 mr-2" />
                          <span className="text-sm">Track calories</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="flex flex-col items-center space-y-4">
                <CardContent className="p-6 flex flex-col items-center space-y-4">
                  <div className="size-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <Sprout className="size-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold">Start Small</h3>
                  <p className="text-center text-gray-500 dark:text-gray-400">
                    Begin with one project and grow as you progress
                  </p>
                  <div className="w-full space-y-4 text-left">
                    <div className="space-y-2">
                      <h4 className="font-semibold">Your Journey</h4>
                      <ul className="space-y-1">
                        <li className="flex items-center">
                          <CheckCircle2 className="size-4 text-green-600 mr-2" />
                          <span className="text-sm">
                            Start with one project
                          </span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle2 className="size-4 text-green-600 mr-2" />
                          <span className="text-sm">Build consistency</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle2 className="size-4 text-green-600 mr-2" />
                          <span className="text-sm">Unlock more projects</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          {/* <div className="container px-4 md:px-6 mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Pricing</h2>
            <div className="grid gap-6 md:grid-cols-3 lg:gap-12 max-w-5xl mx-auto">
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-2xl">Free</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-4xl font-bold mb-2">$0</p>
                  <p className="text-gray-500 mb-4">
                    Perfect for getting started
                  </p>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-center">
                      <Check className="size-4 text-green-600 mr-2" />
                      <span>1 Project</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="size-4 text-green-600 mr-2" />
                      <span>Basic Progress Tracking</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="size-4 text-green-600 mr-2" />
                      <span>7-Day Streaks</span>
                    </li>
                  </ul>
                </CardContent>
                <Button className="mt-auto">Get Started</Button>
              </Card>
              <Card className="flex flex-col border-green-600">
                <CardHeader>
                  <CardTitle className="text-2xl">Standard</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-4xl font-bold mb-2">$9.99</p>
                  <p className="text-gray-500 mb-4">
                    For serious goal achievers
                  </p>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-center">
                      <Check className="size-4 text-green-600 mr-2" />
                      <span>Unlimited Projects</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="size-4 text-green-600 mr-2" />
                      <span>Advanced Analytics</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="size-4 text-green-600 mr-2" />
                      <span>30-Day Streaks</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="size-4 text-green-600 mr-2" />
                      <span>Priority Support</span>
                    </li>
                  </ul>
                </CardContent>
                <Button className="mt-auto bg-green-600 hover:bg-green-700">
                  Subscribe Now
                </Button>
              </Card>
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-2xl">Enterprise</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-4xl font-bold mb-2">Custom</p>
                  <p className="text-gray-500 mb-4">
                    For teams and organizations
                  </p>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-center">
                      <Check className="size-4 text-green-600 mr-2" />
                      <span>All Standard Features</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="size-4 text-green-600 mr-2" />
                      <span>Team Collaboration</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="size-4 text-green-600 mr-2" />
                      <span>Custom Integrations</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="size-4 text-green-600 mr-2" />
                      <span>Dedicated Account Manager</span>
                    </li>
                  </ul>
                </CardContent>
                <Button className="mt-auto" variant="outline">
                  Contact Sales
                </Button>
              </Card>
            </div>
          </div> */}
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Start Your Journey Today
                </h2>
                <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                  Join thousands of users achieving their goals one percent at a
                  time
                </p>
              </div>
              <Button className="bg-green-600 hover:bg-green-700">
                Sign Up Now
              </Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full py-6 px-4 md:px-6 border-t">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © 2024 OnePercent. All rights reserved.
          </p>
          <nav className="flex gap-4 sm:gap-6 mt-4 sm:mt-0">
            <Link
              className="text-xs hover:underline underline-offset-4"
              href="#"
            >
              Terms of Service
            </Link>
            <Link
              className="text-xs hover:underline underline-offset-4"
              href="#"
            >
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
