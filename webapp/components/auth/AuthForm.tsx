"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { signIn, signUp } from "@/lib/actions/auth.action";
import { toast } from "sonner";
import { Eye, EyeOff, Github, Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

// --- Schemas ---
const authFormSchema = (type: "sign-in" | "sign-up") => {
  return z.object({
    name: type === "sign-up" ? z.string().min(3, "Name must be at least 3 characters") : z.string().optional(),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });
};

export default function AuthForm({ type }: { type: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isSignIn = type === "sign-in";

  const formSchema = authFormSchema(type);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const handleAuthError = (error: any) => {
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case "auth/email-already-in-use":
          toast.error("This email is already in use. Please sign in.");
          break;
        case "auth/wrong-password":
        case "auth/invalid-credential":
          toast.error("Invalid email or password. Please try again.");
          break;
        case "auth/user-not-found":
          toast.error("No account found with this email. Please sign up.");
          break;
        case "auth/weak-password":
          toast.error("Password is too weak. It must be at least 6 characters.");
          break;
        default:
          toast.error("An error occurred. Please try again.");
      }
    } else {
      toast.error(`An unknown error occurred: ${error.message}`);
    }
    console.error("Auth Error:", error);
  };

  const syncUserToDatabase = async (idToken: string, name?: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/auth/sync`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${idToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name })
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error("Failed to sync user to database:", data);
        return false;
      }

      if (data.is_new) {
        toast.success("Your profile has been saved to the database!");
      }
      
      return true;
    } catch (error) {
      console.error("Error syncing user to database:", error);
      return false;
    }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      if (type === "sign-up") {
        const { name, email, password } = data;
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Get ID token for backend sync
        const idToken = await userCredential.user.getIdToken();
        
        const result = await signUp({
          uid: userCredential.user.uid,
          name: name!,
          email,
          password,
        });

        if (!result.success) {
          toast.error(result.message);
        } else {
          // Sync user to database with name
          await syncUserToDatabase(idToken, name);
          toast.success("Account created successfully! Please sign in.");
          router.push("/sign-in");
        }
      } else {
        const { email, password } = data;
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await userCredential.user.getIdToken();
        
        if (!idToken) {
          toast.error("Failed to get user token. Please try again.");
          setIsLoading(false);
          return;
        }

        // Sync user to database
        await syncUserToDatabase(idToken);

        const result = await signIn({ email, idToken });

        if (result && !result.success) {
          toast.error(result.message || "Server sign-in failed. Please try again.");
        } else {
          toast.success("Signed in successfully!");
          window.location.href = "/";
          return;
        }
      }
    } catch (error) {
      handleAuthError(error);
    }

    setIsLoading(false);
  };

  return (
    <div className="w-full space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white font-sans">
          {isSignIn ? "Welcome back" : "Create an account"}
        </h1>
        <p className="text-zinc-400 text-lg">
          {isSignIn ? "Enter your details to access your workspace." : "Start your journey to interview mastery."}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {!isSignIn && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300 ml-1">
              Full Name
            </label>
            <div className="relative group">
              <input
                {...register("name")}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
                placeholder="John Doe"
                disabled={isLoading}
              />
              <div className="absolute inset-0 rounded-xl bg-white/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
            </div>
            {errors.name && (
              <p className="text-xs text-red-400 mt-1 ml-1">{errors.name.message}</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300 ml-1">
            Email Address
          </label>
          <div className="relative group">
            <input
              {...register("email")}
              type="email"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
              placeholder="name@example.com"
              disabled={isLoading}
            />
            <div className="absolute inset-0 rounded-xl bg-white/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
          </div>
          {errors.email && (
            <p className="text-xs text-red-400 mt-1 ml-1">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between ml-1">
            <label className="text-sm font-medium text-zinc-300">
              Password
            </label>
            {isSignIn && (
              <Link 
                href="/forgot-password" 
                className="text-xs text-zinc-400 hover:text-white transition-colors"
              >
                Forgot password?
              </Link>
            )}
          </div>
          <div className="relative group">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all pr-10"
              placeholder="••••••••"
              disabled={isLoading}
            />
            <div className="absolute inset-0 rounded-xl bg-white/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors p-1"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-400 mt-1 ml-1">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-white text-black font-bold text-base py-3.5 rounded-xl hover:bg-zinc-200 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              {isSignIn ? "Sign In" : "Create Account"}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-black px-2 text-zinc-500 font-medium">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all group"
            onClick={() => toast.info("GitHub login coming soon.")}
          >
            <Github className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
            <span className="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">GitHub</span>
          </button>
          <button
            type="button"
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all group"
            onClick={() => toast.info("Google login coming soon.")}
          >
            <svg className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.333.533 12S5.867 24 12.48 24c3.44 0 6.013-1.133 8.027-3.293 2.053-2.107 2.627-5.2 2.627-7.787 0-.76-.067-1.467-.173-2.147H12.48z" />
            </svg>
            <span className="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">Google</span>
          </button>
        </div>

        <div className="text-center pt-2">
          <p className="text-zinc-500 text-sm">
            {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
            <Link
              href={isSignIn ? "/sign-up" : "/sign-in"}
              className="text-white font-medium hover:text-blue-400 transition-colors"
            >
              {isSignIn ? "Sign up" : "Sign in"}
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
