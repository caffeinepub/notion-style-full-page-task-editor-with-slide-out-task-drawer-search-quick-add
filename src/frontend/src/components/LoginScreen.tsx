import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from './ui/button';
import { Loader2, Flame, Shield, Zap, Lock } from 'lucide-react';
import { Card, CardContent } from './ui/card';

export default function LoginScreen() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-6 animate-in fade-in zoom-in">
          <div className="flex items-center justify-center">
            <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 ring-4 ring-primary/20">
              <Flame className="h-12 w-12 text-primary" />
            </div>
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Impact Forge</h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Transform your productivity with beautiful task management and project tracking
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-primary/20 bg-card/50">
            <CardContent className="pt-6 text-center space-y-2">
              <div className="flex justify-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="font-semibold text-sm text-foreground">Fast & Intuitive</h3>
              <p className="text-xs text-muted-foreground">Streamlined workflow</p>
            </CardContent>
          </Card>
          <Card className="border-primary/20 bg-card/50">
            <CardContent className="pt-6 text-center space-y-2">
              <div className="flex justify-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="font-semibold text-sm text-foreground">Secure</h3>
              <p className="text-xs text-muted-foreground">Blockchain-powered</p>
            </CardContent>
          </Card>
          <Card className="border-primary/20 bg-card/50">
            <CardContent className="pt-6 text-center space-y-2">
              <div className="flex justify-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="font-semibold text-sm text-foreground">Private</h3>
              <p className="text-xs text-muted-foreground">Your data, your control</p>
            </CardContent>
          </Card>
        </div>

        {/* Login Button */}
        <div className="space-y-4">
          <Button
            onClick={login}
            disabled={isLoggingIn}
            size="lg"
            className="w-full h-12 text-base font-semibold"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Connecting...
              </>
            ) : (
              'Get Started'
            )}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Secure authentication powered by Internet Identity
          </p>
        </div>
      </div>
    </div>
  );
}

