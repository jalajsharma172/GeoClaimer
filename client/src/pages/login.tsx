import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
  username: z.string().min(1, "Username is required"),
  isAnonymous: z.boolean().default(false),
});

type LoginForm = z.infer<typeof loginSchema>;

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      username: "",
      isAnonymous: false,
    },
  });

  const handleLogin = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/auth/login', {
        email: data.email || undefined,
        username: data.username,
        isAnonymous: data.isAnonymous,
      });
      
      const result = await response.json();
      onLogin(result.user);
      
      toast({
        title: "Welcome to Territory Walker!",
        description: "Start exploring and claiming your territory",
      });
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymousLogin = () => {
    const username = `Explorer${Math.floor(Math.random() * 10000)}`;
    form.setValue('username', username);
    form.setValue('isAnonymous', true);
    form.setValue('email', '');
    handleLogin({ username, isAnonymous: true, email: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Territory Walker</CardTitle>
          <p className="text-gray-600 mt-2">Claim the world, one step at a time</p>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="Email address (optional)"
                        className="px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Choose your username"
                        className="px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
              >
                {isLoading ? "Starting Adventure..." : "Start Playing"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={handleAnonymousLogin}
              disabled={isLoading}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl transition-colors"
            >
              Play as Guest
            </Button>
            <p className="text-center text-sm text-gray-500 mt-4">
              Join thousands of territory explorers worldwide!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
