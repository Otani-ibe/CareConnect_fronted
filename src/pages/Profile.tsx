import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, Heart, Award, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    location: user?.location || '',
    healthNeeds: user?.healthNeeds || [],
    preferences: user?.preferences || [],
    qualifications: user?.qualifications || [],
    availability: user?.availability || [],
  });

  const healthNeedsOptions = [
    'Medication Management', 'Mobility Assistance', 'Personal Care', 
    'Companionship', 'Meal Preparation', 'Transportation'
  ];

  const preferenceOptions = [
    'Female Caregiver', 'Male Caregiver', 'Non-smoker', 
    'Pet-friendly', 'Bilingual', 'Certified Nurse'
  ];

  const qualificationOptions = [
    'Certified Nursing Assistant', 'Home Health Aide', 'Personal Care Assistant',
    'Registered Nurse', 'Physical Therapy Assistant', 'Geriatric Care Manager'
  ];

  const availabilityOptions = [
    'Morning (6AM-12PM)', 'Afternoon (12PM-6PM)', 'Evening (6PM-12AM)',
    'Night (12AM-6AM)', 'Weekends', 'Holidays'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: string, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field as keyof typeof prev] as string[]), value]
        : (prev[field as keyof typeof prev] as string[]).filter(item => item !== value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(formData);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto p-6 space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your account information and preferences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Summary */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Profile Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-10 w-10 text-white" />
                </div>
                <h3 className="font-semibold">{user?.name}</h3>
                <Badge variant="secondary" className="mt-1">
                  {user?.role === 'senior' ? 'Senior' : 'Caregiver'}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{user?.location || 'Location not set'}</span>
                </div>
                {user?.rating && (
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-warning" />
                    <span>{user.rating.toFixed(1)} rating</span>
                  </div>
                )}
              </div>

              {user?.role === 'caregiver' && user?.qualifications && user.qualifications.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Qualifications</h4>
                  <div className="flex flex-wrap gap-1">
                    {user.qualifications.slice(0, 3).map((qual, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {qual}
                      </Badge>
                    ))}
                    {user.qualifications.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{user.qualifications.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profile Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>
                Update your information to help find better matches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="City, State"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                    />
                  </div>
                </div>

                {/* Role-specific sections */}
                {user?.role === 'senior' && (
                  <div className="space-y-6">
                    <div>
                      <Label className="text-base font-medium">Health Needs</Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Select the types of care you need
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {healthNeedsOptions.map((need) => (
                          <div key={need} className="flex items-center space-x-2">
                            <Checkbox
                              id={need}
                              checked={formData.healthNeeds.includes(need)}
                              onCheckedChange={(checked) => 
                                handleArrayChange('healthNeeds', need, checked as boolean)
                              }
                            />
                            <Label htmlFor={need} className="text-sm">{need}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-base font-medium">Caregiver Preferences</Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        What kind of caregiver would you prefer?
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {preferenceOptions.map((preference) => (
                          <div key={preference} className="flex items-center space-x-2">
                            <Checkbox
                              id={preference}
                              checked={formData.preferences.includes(preference)}
                              onCheckedChange={(checked) => 
                                handleArrayChange('preferences', preference, checked as boolean)
                              }
                            />
                            <Label htmlFor={preference} className="text-sm">{preference}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {user?.role === 'caregiver' && (
                  <div className="space-y-6">
                    <div>
                      <Label className="text-base font-medium">Qualifications</Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Select your certifications and qualifications
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {qualificationOptions.map((qualification) => (
                          <div key={qualification} className="flex items-center space-x-2">
                            <Checkbox
                              id={qualification}
                              checked={formData.qualifications.includes(qualification)}
                              onCheckedChange={(checked) => 
                                handleArrayChange('qualifications', qualification, checked as boolean)
                              }
                            />
                            <Label htmlFor={qualification} className="text-sm">{qualification}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-base font-medium">Availability</Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        When are you available to provide care?
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {availabilityOptions.map((time) => (
                          <div key={time} className="flex items-center space-x-2">
                            <Checkbox
                              id={time}
                              checked={formData.availability.includes(time)}
                              onCheckedChange={(checked) => 
                                handleArrayChange('availability', time, checked as boolean)
                              }
                            />
                            <Label htmlFor={time} className="text-sm">{time}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    variant="care"
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Profile'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;