"use client";

import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { auth } from "../lib/firebase/client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react"; // Import useState
import { FirebaseError } from "firebase/app"; // Import FirebaseError

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react"; // For loading spinner

import { signIn, signUp } from "@/lib/actions/auth.action";
import FormField from "./FormField";

const authFormSchema = (type: FormType) => {
  return z.object({
    name: type === "sign-up" ? z.string().min(3, "Name must be at least 3 characters") : z.string().optional(),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"), // Firebase default is 6
  });
};

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const isSignIn = type === "sign-in";

  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  // Handle Firebase Auth errors
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


  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true); // Start loading

    try {
      if (type === "sign-up") {
        const { name, email, password } = data;

        // 1. Create user on Firebase client
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        // 2. Call server action to create user in DB
        const result = await signUp({
          uid: userCredential.user.uid,
          name: name!,
          email,
          password,
        });

        if (!result.success) {
          toast.error(result.message);
        } else {
          toast.success("Account created successfully! Please sign in.");
          router.push("/sign-in");
        }
      } else {
        // Sign-in logic
        const { email, password } = data;

        // 1. Sign in on Firebase client
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        // 2. Get ID token
        const idToken = await userCredential.user.getIdToken();
        if (!idToken) {
          toast.error("Failed to get user token. Please try again.");
          setIsLoading(false);
          return;
        }

        // 3. Call server action to set session cookie
        const result = await signIn({
          email,
          idToken,
        });

        // 4. CHECK the result from the server action
        if (result && !result.success) {
           toast.error(result.message || "Server sign-in failed. Please try again.");
        } else {
          toast.success("Signed in successfully.");
          
          // KEY CHANGE HERE:
          // We use window.location.href to force a full-page reload.
          // This sends the new cookie to the server, so it renders the dashboard.
          window.location.href = "/";
          return; // Return to prevent setIsLoading(false) from running
        }
      }
    } catch (error) {
      // Handle client-side auth errors
      handleAuthError(error);
    } 
    
    setIsLoading(false); // Stop loading (will only run on error for sign-in)
  };

  return (
    <div className="card-border lg:min-w-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-row gap-2 justify-center">
          <Image src="/next.svg" alt="logo" height={32} width={38} />
          <h2 className="text-primary-100">Prepify</h2>
        </div>

        <h3>Practice job interviews with AI</h3>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6 mt-4 form"
          >
            {!isSignIn && (
              <FormField
                control={form.control}
                name="name"
                label="Name"
                placeholder="Your Name"
                type="text"
                disabled={isLoading} // Disable when loading
              />
            )}

            <FormField
              control={form.control}
              name="email"
              label="Email"
              placeholder="Your email address"
              type="email"
              disabled={isLoading} // Disable when loading
            />

            <FormField
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter your password"
              type="password"
              disabled={isLoading} // Disable when loading
            />

            <Button className="btn" type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isSignIn ? (
                "Sign In"
              ) : (
                "Create an Account"
              )}
            </Button>
          </form>
        </Form>

        <p className="text-center">
          {isSignIn ? "No account yet?" : "Have an account already?"}
          <Link
            href={!isSignIn ? "/sign-in" : "/sign-up"}
            className="font-bold text-primary-200 ml-1"
          >
            {!isSignIn ? "Sign In" : "Sign Up"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;