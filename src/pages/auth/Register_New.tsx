import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Heart, UserPlus, Users, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Register: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '' as 'senior' | 'caregiver' | '',
    location: '',
    healthNeeds: [] as string[],
    preferences: [] as string[],
    qualifications: [] as string[],
    availability: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const healthNeedsOptions = [
    'Medication Management', 'Mobility Assistance', 'Personal Care', 
    'Companionship', 'Meal Preparation', 'Transportation',
    'Light Housekeeping', 'Dementia Care', 'Post-Surgery Care'
  ];

  const preferenceOptions = [
    'Female Caregiver', 'Male Caregiver', 'Non-smoker', 
    'Pet-friendly', 'Bilingual (Spanish)', 'Bilingual (Other)',
    'Certified Nurse', 'Experience with Dementia', 'Available Weekends'
  ];

  const qualificationOptions = [
    'Certified Nursing Assistant (CNA)', 'Home Health Aide (HHA)', 
    'Personal Care Assistant (PCA)', 'Registered Nurse (RN)',
    'Licensed Practical Nurse (LPN)', 'Physical Therapy Assistant',
    'Geriatric Care Manager', 'Dementia Care Specialist',
    'First Aid/CPR Certified'
  ];

  const availabilityOptions = [
    'Early Morning (6AM-9AM)', 'Morning (9AM-12PM)', 
    'Afternoon (12PM-5PM)', 'Evening (5PM-9PM)',
    'Night (9PM-6AM)', 'Weekends Only', 'Holidays Available',
    'Live-in Care', 'Respite Care'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: string, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field as keyof typeof prev] as string[], value]
        : (prev[field as keyof typeof prev] as string[]).filter(item => item !== value)
    }));
  };

  const validateStep = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.email && formData.password && formData.confirmPassword;
      case 2:
        return formData.role && formData.location;
      case 3:
        if (formData.role === 'senior') {
          return formData.healthNeeds.length > 0;
        } else {
          return formData.qualifications.length > 0;
        }
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    } else {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive",
      });
    }
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        location: formData.location,
        healthNeeds: formData.role === 'senior' ? formData.healthNeeds : undefined,
        preferences: formData.role === 'senior' ? formData.preferences : undefined,
        qualifications: formData.role === 'caregiver' ? formData.qualifications : undefined,
        availability: formData.role === 'caregiver' ? formData.availability : undefined,
      });
      
      toast({
        title: "Welcome to CareConnect!",
        description: "Your account has been created successfully.",
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h2>
              <p className="text-gray-600">Let's start with your basic information</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="h-12 mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="h-12 mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="h-12 mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="h-12 mt-1"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Role</h2>
              <p className="text-gray-600">Are you looking for care or providing care?</p>
            </div>

            <RadioGroup 
              value={formData.role} 
              onValueChange={(value) => handleInputChange('role', value)}
              className="space-y-4"
            >
              <div className="flex items-start space-x-4 p-4 border-2 border-gray-200 rounded-xl hover:border-primary transition-colors">
                <RadioGroupItem value="senior" id="senior" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="senior" className="text-lg font-semibold text-gray-900 cursor-pointer">
                    I'm a Senior Looking for Care
                  </Label>
                  <p className="text-gray-600 mt-1">
                    Find qualified caregivers who can help with daily activities, companionship, and specialized care needs.
                  </p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>

              <div className="flex items-start space-x-4 p-4 border-2 border-gray-200 rounded-xl hover:border-primary transition-colors">
                <RadioGroupItem value="caregiver" id="caregiver" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="caregiver" className="text-lg font-semibold text-gray-900 cursor-pointer">
                    I'm a Caregiver Offering Services
                  </Label>
                  <p className="text-gray-600 mt-1">
                    Share your qualifications and availability to connect with seniors who need your care and expertise.
                  </p>
                </div>
                <Heart className="w-8 h-8 text-primary" />
              </div>
            </RadioGroup>

            <div>
              <Label htmlFor="location" className="text-sm font-medium text-gray-700">Location (City, State)</Label>
              <Input
                id="location"
                type="text"
                placeholder="San Francisco, CA"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="h-12 mt-1"
                required
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {formData.role === 'senior' ? 'Care Needs & Preferences' : 'Qualifications & Availability'}
              </h2>
              <p className="text-gray-600">
                {formData.role === 'senior' 
                  ? 'Help us match you with the right caregiver' 
                  : 'Tell us about your qualifications and when you\'re available'
                }
              </p>
            </div>

            {formData.role === 'senior' ? (
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-semibold text-gray-900 mb-4 block">
                    What type of care do you need? <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {healthNeedsOptions.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={option}
                          checked={formData.healthNeeds.includes(option)}
                          onCheckedChange={(checked) => 
                            handleArrayChange('healthNeeds', option, checked as boolean)
                          }
                        />
                        <Label htmlFor={option} className="text-sm text-gray-700">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold text-gray-900 mb-4 block">
                    Caregiver Preferences (Optional)
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {preferenceOptions.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={`pref-${option}`}
                          checked={formData.preferences.includes(option)}
                          onCheckedChange={(checked) => 
                            handleArrayChange('preferences', option, checked as boolean)
                          }
                        />
                        <Label htmlFor={`pref-${option}`} className="text-sm text-gray-700">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-semibold text-gray-900 mb-4 block">
                    Qualifications & Certifications <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-1 gap-3">
                    {qualificationOptions.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={option}
                          checked={formData.qualifications.includes(option)}
                          onCheckedChange={(checked) => 
                            handleArrayChange('qualifications', option, checked as boolean)
                          }
                        />
                        <Label htmlFor={option} className="text-sm text-gray-700">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold text-gray-900 mb-4 block">
                    Availability (Optional)
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {availabilityOptions.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={`avail-${option}`}
                          checked={formData.availability.includes(option)}
                          onCheckedChange={(checked) => 
                            handleArrayChange('availability', option, checked as boolean)
                          }
                        />
                        <Label htmlFor={`avail-${option}`} className="text-sm text-gray-700">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const totalSteps = 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <Link 
          to="/" 
          className="flex items-center gap-3 text-primary hover:opacity-90 transition-opacity"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
        
        <Link 
          to="/" 
          className="flex items-center gap-3 font-bold text-2xl text-primary"
        >
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Heart className="h-6 w-6 text-white fill-current" />
          </div>
          <span>CareConnect</span>
        </Link>
      </div>

      {/* Progress Bar */}
      <div className="max-w-md mx-auto px-4 mb-8">
        <div className="flex items-center justify-between mb-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step > i + 1
                  ? 'bg-green-500 text-white'
                  : step === i + 1
                  ? 'bg-primary text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              {step > i + 1 ? <CheckCircle className="w-5 h-5" /> : i + 1}
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 pb-20">
        <div className="w-full max-w-2xl">
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <form onSubmit={step === totalSteps ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
                {renderStep()}

                <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                  {step > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="px-6"
                    >
                      Previous
                    </Button>
                  ) : (
                    <div />
                  )}

                  {step < totalSteps ? (
                    <Button
                      type="submit"
                      className="bg-primary hover:bg-primary/90 px-6"
                      disabled={!validateStep(step)}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-primary hover:bg-primary/90 px-6"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  )}
                </div>
              </form>

              <div className="text-center mt-6 pt-4 border-t border-gray-200">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <Link 
                    to="/login" 
                    className="text-primary hover:text-primary/80 font-semibold"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;
