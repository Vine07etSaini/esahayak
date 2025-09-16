// "use client";

// import Link from "next/link";
// import { useAuth } from "@/hooks/useAuth";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Users, Plus, FileText } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { useEffect } from "react";

// export default function Index() {
//   const { user } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     if (user) {
//       // Redirect authenticated users to buyers list
//       router.push("/buyers");
//     }
//   }, [user, router]);

//   if (user) {
//     return null; // Will redirect
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       <header className="border-b">
//         <div className="container mx-3 px-4 py-4 flex items-center justify-between">
//           <h1 className="text-xl font-bold">Buyer Lead Intake</h1>
//           <Link href="/auth">
//             <Button>Sign In</Button>
//           </Link>
//         </div>
//       </header>
      
//       <main className="container mx-auto px-4 py-12">
//         <div className="text-center mb-12">
//           <h1 className="text-4xl font-bold mb-4">
//             Manage Your Buyer Leads Efficiently
//           </h1>
//           <p className="text-xl text-muted-foreground mb-8">
//             Capture, organize, and track potential property buyers with our comprehensive lead management system.
//           </p>
//           <Link href="/auth">
//             <Button size="lg">Get Started</Button>
//           </Link>
//         </div>

//         <div className="grid md:grid-cols-3 gap-1 max-w-4xl mx-auto">
//           <Card>
//             <CardHeader>
//               <Users className="h-8 w-8 mb-2 text-primary" />
//               <CardTitle>Lead Management</CardTitle>
//               <CardDescription>
//                 Capture and organize buyer information with detailed forms and validation
//               </CardDescription>
//             </CardHeader>
//           </Card>

//           <Card>
//             <CardHeader>
//               <Plus className="h-8 w-8 mb-2 text-primary" />
//               <CardTitle>Easy Creation</CardTitle>
//               <CardDescription>
//                 Quick lead creation with smart forms that adapt based on property type
//               </CardDescription>
//             </CardHeader>
//           </Card>

//           <Card>
//             <CardHeader>
//               <FileText className="h-8 w-8 mb-2 text-primary" />
//               <CardTitle>Import & Export</CardTitle>
//               <CardDescription>
//                 Bulk import leads via CSV and export filtered data for analysis
//               </CardDescription>
//             </CardHeader>
//           </Card>
//         </div>
//       </main>
//     </div>
//   );
// }
// app/page.tsx
"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Plus, FileText, CheckCircle, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.push("/buyers");
  }, [user, router]);

  if (user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
      <header className="border-b bg-transparent">
        <div className="container mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="rounded-full bg-gradient-to-br from-primary to-indigo-600 p-2 shadow-md">
              <Users className="h-6 w-6 text-white" />
            </div>
            <span className="font-semibold text-lg">Buyer Lead Intake</span>
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              href="/features"
              className="hidden md:inline-block text-sm hover:underline text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="hidden md:inline-block text-sm hover:underline text-purple-600 hover:text-purple-800 font-medium"
            >
              Pricing
            </Link>
            <Link href="/auth">
              <Button 
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 px-6 py-2 rounded-lg font-medium"
                aria-label="Sign in to Buyer Lead Intake"
              >
               Sign In
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-6 py-14">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Hero Text */}
          <div className="space-y-6">
            <div className="max-w-xl">
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
                Capture, qualify, and convert buyer leads —
                <span className="text-primary"> faster.</span>
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                A simple, thoughtful CRM built for property teams. Smart forms,
                bulk CSV import/export, quick filters and actionable insights —
                all in one place.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/auth">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 font-semibold px-8 py-3 rounded-xl"
                    aria-label="Get started"
                  >
                   Get started — it's free
                  </Button>
                </Link>
              </div>

              <ul className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Fast multi-field search</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>CSV import / export</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Role-based access</span>
                </li>
              </ul>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div className="rounded-md bg-muted px-3 py-2">
                <span className="text-xs font-medium">Trusted by</span>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm font-semibold">Local Realty Co.</span>
                  <Star className="h-4 w-4 text-amber-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Static Sample Form */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md">
              <div className="rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">
                        Create lead (Sample)
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Demo only
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Autosave
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3">
                    <input
                      disabled
                      value="John Doe"
                      className="w-full rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500"
                    />
                    <input
                      disabled
                      value="john@example.com"
                      className="w-full rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500"
                    />
                    <div className="flex gap-2">
                      <input
                        disabled
                        value="+91 98765 43210"
                        className="flex-1 rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500"
                      />
                      <select
                        disabled
                        className="rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500"
                      >
                        <option>Website</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="text-sm text-muted-foreground">
                        Add notes
                      </div>
                      <div className="px-3 py-1.5 rounded-md bg-primary text-white text-sm cursor-default opacity-70">
                        Save
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 p-3">
                  <div className="text-xs text-muted-foreground">Preview</div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="text-sm">John Doe</div>
                    <div className="text-sm text-muted-foreground">Website</div>
                    <div className="text-sm">+91 98765 43210</div>
                    <div className="text-sm text-muted-foreground">
                      Interested: 2 BHK
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section className="mt-14">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">
              Designed for speed and clarity
            </h2>
            <p className="text-muted-foreground">
              Clean layouts, clear actions, and keyboard-friendly forms let your
              team move fast without losing context.
            </p>

            <div className="mt-8 grid md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Users className="h-6 w-6 mb-2 text-primary" />
                  <CardTitle>Lead Management</CardTitle>
                  <CardDescription>
                    Capture and organize buyer information with detailed forms
                    and validation.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Custom fields, tags, and notes.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Plus className="h-6 w-6 mb-2 text-primary" />
                  <CardTitle>Quick Creation</CardTitle>
                  <CardDescription>
                    Smart forms adapt based on property type to reduce friction.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Keyboard first, mobile friendly.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <FileText className="h-6 w-6 mb-2 text-primary" />
                  <CardTitle>Import & Export</CardTitle>
                  <CardDescription>
                    Bulk import leads via CSV and export filtered data for
                    analysis.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Map columns quickly with previews.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm">
            © 2024 Buyer Lead Intake — Built with care
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:underline"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:underline"
            >
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

