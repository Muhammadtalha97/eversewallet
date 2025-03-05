'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, createUser, loginUser } from '@/lib/firebase';
import { Button, TextField, Box, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/system';
import { toast } from "sonner"
import { SplashScreen } from './splash-screen';

const AuthForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (user && !loading) {
      router.push('/home');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        if (password.length < 8) {
          toast.error('Password must be at least 8 characters');
        }
        await createUser(email, password, referralCode);
      } else {
        await loginUser(email, password);
      }
    } catch (error: any) {
      toast.error('wrong email/password ,try again or sign up');
    }
  };

  if (loading || user) {
    return ''
  }

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          maxWidth: isSmallScreen ? '90%' : 400,
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 2,
          boxShadow: 3,
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant={isSmallScreen ? 'h5' : 'h4'} gutterBottom>
          {isRegistering ? 'Sign Up' : 'Sign In'}
        </Typography>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />
          {isRegistering && (
            <TextField
              fullWidth
              label="Referral Code (optional)"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              margin="normal"
            />
          )}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
          >
            {isRegistering ? 'Create Account' : 'Sign In'}
          </Button>
          <Button
            fullWidth
            sx={{ mt: 1 }}
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default AuthForm;