import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Logo from '@/components/Logo';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { handleOAuthCallback } = useAuth();

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get token from URL query params
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const error = urlParams.get('error');

        if (error) {
          toast.error(`Authentication failed: ${error}`);
          navigate('/login');
          return;
        }

        if (token) {
          const result = await handleOAuthCallback(token);
          
          if (result.success) {
            toast.success('Successfully logged in with Google!');
            navigate('/dashboard');
          } else {
            toast.error(result.error || 'Authentication failed');
            navigate('/login');
          }
        } else {
          toast.error('No authentication token received');
          navigate('/login');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        toast.error('Authentication failed. Please try again.');
        navigate('/login');
      }
    };

    processCallback();
  }, [handleOAuthCallback, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-lime/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/5 rounded-full blur-3xl" />
      </div>

      <div className="text-center relative">
        {/* Logo with animation */}
        <div className="inline-flex items-center gap-3 mb-6">
          <Logo size="large" />
          <span className="text-3xl font-bold text-foreground">SynapseAI</span>
        </div>

        {/* Loading message */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-lg text-muted-foreground">
            Completing authentication...
          </p>
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback;

