'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, database } from '@/lib/firebase';
import { ref, set } from 'firebase/database';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Switch } from "@/components/ui/switch";
import { User } from 'firebase/auth';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = loginSchema.extend({
  fullName: z.string().min(2, 'Full name is required'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const saveUserProfile = async (user: User) => {
    const userRef = ref(database, `users/${user.uid}`);
    await set(userRef, {
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
    });
  };

  const onSubmit = async (data: LoginFormData | SignupFormData) => {
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, data.email, data.password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        if (userCredential.user) {
          await updateProfile(userCredential.user, {
            displayName: (data as SignupFormData).fullName,
          });
          await saveUserProfile(userCredential.user);
        }
      }
      router.push('/profile');
    } catch (error) {
      console.error('Auth error:', error);
      setError(isLogin ? 'Invalid email or password.' : 'Error creating account.');
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        await updateProfile(result.user, {
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
        });
        await saveUserProfile(result.user);
      }
      router.push('/profile');
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError('An error occurred during Google sign-in.');
    }
  };

  return (
    <div className="bg-gradient-to-b from-orange-50 to-amber-100 min-h-screen py-12">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
            {isLogin ? 'Login to HouseSwap' : 'Sign Up for HouseSwap'}
          </h1>
          <div className="flex items-center justify-center mb-6">
            <Label htmlFor="auth-switch" className="mr-2">Sign Up</Label>
            <Switch
              id="auth-switch"
              checked={isLogin}
              onCheckedChange={setIsLogin}
            />
            <Label htmlFor="auth-switch" className="ml-2">Login</Label>
          </div>
          {error && (
            <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}
          <form onSubmit={isLogin ? loginForm.handleSubmit(onSubmit) : signupForm.handleSubmit(onSubmit)} className="space-y-4">
            {!isLogin && (
              <div>
                <Label htmlFor="fullName" className="text-gray-700">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  {...signupForm.register('fullName')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                />
                {signupForm.formState.errors.fullName && <p className="mt-1 text-sm text-red-600">{signupForm.formState.errors.fullName.message}</p>}
              </div>
            )}
            <div>
              <Label htmlFor="email" className="text-gray-700">Email Address</Label>
              <Input
                id="email"
                type="email"
                {...(isLogin ? loginForm.register('email') : signupForm.register('email'))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
              />
              {(isLogin ? loginForm.formState.errors.email : signupForm.formState.errors.email) && (
                <p className="mt-1 text-sm text-red-600">{(isLogin ? loginForm.formState.errors.email?.message : signupForm.formState.errors.email?.message)}</p>
              )}
            </div>
            <div>
              <Label htmlFor="password" className="text-gray-700">Password</Label>
              <Input
                id="password"
                type="password"
                {...(isLogin ? loginForm.register('password') : signupForm.register('password'))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
              />
              {(isLogin ? loginForm.formState.errors.password : signupForm.formState.errors.password) && (
                <p className="mt-1 text-sm text-red-600">{(isLogin ? loginForm.formState.errors.password?.message : signupForm.formState.errors.password?.message)}</p>
              )}
            </div>
            {!isLogin && (
              <div>
                <Label htmlFor="confirmPassword" className="text-gray-700">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...signupForm.register('confirmPassword')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                />
                {signupForm.formState.errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{signupForm.formState.errors.confirmPassword.message}</p>}
              </div>
            )}
            <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              {isLogin ? 'Login' : 'Sign Up'}
            </Button>
          </form>
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
            <div className="mt-6">
              <Button onClick={handleGoogleSignIn} variant="outline" className="w-full border-orange-500 text-orange-500 hover:bg-orange-50">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_13183_10121)"><path d="M20.3081 10.2303C20.3081 9.55056 20.253 8.86711 20.1354 8.19836H10.7031V12.0492H16.1046C15.8804 13.2911 15.1602 14.3898 14.1057 15.0879V17.5866H17.3282C19.2205 15.8449 20.3081 13.2728 20.3081 10.2303Z" fill="#3F83F8"/><path d="M10.7019 20.0006C13.3989 20.0006 15.6734 19.1151 17.3306 17.5865L14.1081 15.0879C13.2115 15.6979 12.0541 16.0433 10.7056 16.0433C8.09669 16.0433 5.88468 14.2832 5.091 11.9169H1.76562V14.4927C3.46322 17.8695 6.92087 20.0006 10.7019 20.0006V20.0006Z" fill="#34A853"/><path d="M5.08857 11.9169C4.66969 10.6749 4.66969 9.33008 5.08857 8.08811V5.51233H1.76688C0.348541 8.33798 0.348541 11.667 1.76688 14.4927L5.08857 11.9169V11.9169Z" fill="#FBBC04"/><path d="M10.7019 3.95805C12.1276 3.936 13.5055 4.47247 14.538 5.45722L17.393 2.60218C15.5852 0.904587 13.1858 -0.0287217 10.7019 0.000673888C6.92087 0.000673888 3.46322 2.13185 1.76562 5.51234L5.08732 8.08813C5.87733 5.71811 8.09302 3.95805 10.7019 3.95805V3.95805Z" fill="#EA4335"/></g><defs><clipPath id="clip0_13183_10121"><rect width="20" height="20" fill="white" transform="translate(0.5)"/></clipPath></defs>
                </svg>
                Sign in with Google
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}