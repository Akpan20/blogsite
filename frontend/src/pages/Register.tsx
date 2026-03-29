import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Register form submitted');
    console.log('📝 Form data:', { 
      name, 
      email, 
      passwordLength: password.length,
      passwordConfirmationLength: passwordConfirmation.length 
    });
    
    if (password !== passwordConfirmation) {
      console.error('❌ Passwords do not match');
      setError('Passwords do not match');
      return;
    }

    try {
      console.log('📡 Calling register function...');
      await register(name, email, password, passwordConfirmation);
      console.log('✅ Registration successful');
      console.log('🔄 Navigating to home page...');
      navigate('/');
    } catch (err: any) {
      console.error('❌ Registration failed:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      console.error('Error message:', err.response?.data?.message);
      
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Your Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            
            <div>
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                type="text" 
                value={name} 
                onChange={e => {
                  console.log('Name changed:', e.target.value);
                  setName(e.target.value);
                }} 
                required 
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={e => {
                  console.log('Email changed:', e.target.value);
                  setEmail(e.target.value);
                }} 
                required 
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={e => {
                  console.log('Password changed, length:', e.target.value.length);
                  setPassword(e.target.value);
                }} 
                required 
                minLength={8}
              />
            </div>

            <div>
              <Label htmlFor="password_confirmation">Confirm Password</Label>
              <Input 
                id="password_confirmation" 
                type="password" 
                value={passwordConfirmation} 
                onChange={e => {
                  console.log('Password confirmation changed, length:', e.target.value.length);
                  setPasswordConfirmation(e.target.value);
                }} 
                required 
                minLength={8}
              />
            </div>

            <Button type="submit" className="w-full">Create Account</Button>
            
            <p className="text-center text-sm">
              Already have an account? <a href="/login" className="text-blue-600 hover:underline">Login</a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}