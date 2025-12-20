import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { Shield } from 'lucide-react';
import ieltsLogo from '@/assets/ielts-logo.png';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = authSchema.safeParse({ email, password });
    if (!validation.success) {
      toast({
        title: 'Validation Error',
        description: validation.error.errors[0].message,
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: 'Login Failed',
            description: error.message.includes('Invalid login credentials')
              ? 'Invalid email or password. Please try again.'
              : error.message,
            variant: 'destructive'
          });
        } else {
          // Update last login
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from('profiles').update({ last_login: new Date().toISOString() }).eq('id', user.id);
          }
          toast({ title: 'Welcome back!', description: 'You have successfully logged in.' });
          navigate('/');
        }
      } else {
        // Check whitelist before signup
        const emailLower = email.toLowerCase().trim();
        const { data: whitelisted } = await supabase
          .from('email_whitelist')
          .select('id')
          .eq('email', emailLower)
          .maybeSingle();

        if (!whitelisted) {
          toast({
            title: 'Sign Up Restricted',
            description: 'Your email is not on the approved list. Please contact the administrator.',
            variant: 'destructive'
          });
          setIsLoading(false);
          return;
        }

        const { error } = await signUp(email, password);
        if (error) {
          toast({
            title: 'Sign Up Failed',
            description: error.message.includes('User already registered')
              ? 'This email is already registered. Please log in instead.'
              : error.message,
            variant: 'destructive'
          });
        } else {
          // Mark whitelist entry as used
          await supabase
            .from('email_whitelist')
            .update({ used_at: new Date().toISOString() })
            .eq('email', emailLower);

          toast({
            title: 'Account Created!',
            description: 'You can now start practicing for your IELTS exam.'
          });
          navigate('/');
        }
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4 relative">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary" />
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />

      {/* Secret admin button */}
      <Link
        to="/admin"
        className="absolute bottom-4 left-4 p-2 text-muted-foreground/30 hover:text-primary transition-colors"
        title="Admin Panel"
      >
        <Shield className="w-4 h-4" />
      </Link>

      <Card className="w-full max-w-md border-t-4 border-t-primary shadow-xl bg-card/95 backdrop-blur">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-20 h-20 bg-header rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
            <img src={ieltsLogo} alt="IELTS Logo" className="w-16 h-16 object-contain" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {isLogin 
              ? 'Sign in to continue your IELTS practice' 
              : 'Sign up to start practicing for your IELTS exam'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={6}
                className="bg-secondary border-border"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-5"
              disabled={isLoading}
            >
              {isLoading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline text-sm font-medium"
              disabled={isLoading}
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>

          {!isLogin && (
            <p className="mt-4 text-xs text-center text-muted-foreground">
              Note: Registration requires prior approval. Contact the administrator if you need access.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}