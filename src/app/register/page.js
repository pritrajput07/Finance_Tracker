"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Lock, Mail, User, Loader2 } from "lucide-react";

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Registration failed");
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface relative overflow-hidden p-6 w-full absolute inset-0">
      
      {/* Background aesthetics */}
      <div className="absolute top-0 left-0 w-[50vw] h-[50vw] bg-primary/5 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[40vw] h-[40vw] bg-tertiary/5 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center z-10 mx-auto">
        
        {/* Left side: Branding */}
        <div className="hidden lg:flex flex-col gap-8 pr-12">
          <div>
            <h1 className="font-manrope font-bold text-4xl text-on-surface tracking-tight mb-2">The Kinetic Ledger</h1>
            <div className="w-16 h-1 bg-primary/20 rounded-full"></div>
          </div>
          
          <div className="flex flex-col gap-4 max-w-md mt-8">
            <h2 className="font-manrope text-5xl font-bold tracking-tight text-on-surface leading-[1.1]">
              Start your <span className="text-primary">financial journey</span>.
            </h2>
            <p className="text-on-surface-variant text-xl leading-relaxed mt-2">
              Experience the tranquility of structured wealth management. Join a community of intentional curators.
            </p>
          </div>
        </div>

        {/* Right side: Register Form */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-surface-lowest p-10 md:p-12 rounded-[2.5rem] ghost-shadow flex flex-col gap-8 shadow-[0_24px_64px_-16px_rgba(77,68,227,0.12)]">
            
            <div className="lg:hidden text-center mb-4">
              <h1 className="font-manrope font-bold text-2xl text-on-surface tracking-tight">The Kinetic Ledger</h1>
            </div>

            <div className="text-center lg:text-left">
              <h2 className="font-manrope text-3xl font-bold tracking-tight text-on-surface">Create your account</h2>
              <p className="text-on-surface-variant mt-2 font-medium">Join the sanctuary of sophisticated money management</p>
            </div>

            {error && (
              <div className="bg-tertiary/10 border border-tertiary/20 text-tertiary text-sm font-semibold p-4 rounded-xl -mt-2">
                {error}
              </div>
            )}

            <form className="flex flex-col gap-5 mt-2" onSubmit={handleRegister}>
              
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name" 
                  required
                  className="w-full bg-surface py-4 pl-14 pr-6 rounded-2xl outline-none border border-transparent focus:bg-surface-lowest focus:border-primary/20 focus:ring-2 focus:ring-primary/10 transition-all font-medium text-on-surface text-base"
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address" 
                  required
                  className="w-full bg-surface py-4 pl-14 pr-6 rounded-2xl outline-none border border-transparent focus:bg-surface-lowest focus:border-primary/20 focus:ring-2 focus:ring-primary/10 transition-all font-medium text-on-surface text-base"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password" 
                  required
                  className="w-full bg-surface py-4 pl-14 pr-6 rounded-2xl outline-none border border-transparent focus:bg-surface-lowest focus:border-primary/20 focus:ring-2 focus:ring-primary/10 transition-all font-medium text-on-surface text-base"
                />
              </div>

              <p className="text-xs text-on-surface-variant leading-relaxed text-center lg:text-left">
                By signing up, you agree to our <a href="#" className="font-bold text-primary hover:underline">Terms</a> and <a href="#" className="font-bold text-primary hover:underline">Privacy Policy</a>.
              </p>

              <button 
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full py-4 rounded-full primary-gradient text-white font-bold text-lg hover:scale-[1.02] transition-transform duration-200 shadow-[0_12px_32px_-4px_rgba(77,68,227,0.3)] disabled:opacity-75 disabled:hover:scale-100 flex justify-center items-center gap-2 group"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  <>
                    <span>Sign Up</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="flex justify-center mt-2">
              <p className="text-on-surface-variant text-sm font-medium">
                Already have an account? <Link href="/login" className="font-bold text-primary hover:underline underline-offset-4">Login</Link>
              </p>
            </div>
            
          </div>
          
          <div className="flex justify-center flex-wrap gap-6 mt-10">
            <a href="#" className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider hover:text-on-surface transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider hover:text-on-surface transition-colors">Security Architecture</a>
          </div>
        </div>

      </div>
    </div>
  );
}
