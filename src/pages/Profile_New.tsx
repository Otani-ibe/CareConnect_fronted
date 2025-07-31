import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Star, 
  Shield, 
  Camera,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Clock,
  DollarSign,
  Award,
  Calendar,
  Heart
} from 'lucide-react';
import { userService, User as UserType } from '@/lib/apiServices';
import { useToast } from '@/hooks/use-toast';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<Partial<UserType>>({});
  const [newQualification, setNewQualification] = useState('');
  const [newLanguage, setNewLanguage] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        healthNeeds: user.healthNeeds || [],
        preferences: user.preferences || [],
        qualifications: user.qualifications || [],
        availability: user.availability || [],
        // For caregivers
        ...(user.role === 'caregiver' && {
          experience: (user as any).experience || 0,
          hourlyRate: (user as any).hourlyRate || 0,
          languages: (user as any).languages || [],
          certifications: (user as any).certifications || [],
        })
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await userService.updateProfile(profileData);
      
      if (response.user) {
        updateUser(response.user);
        setIsEditing(false);
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        healthNeeds: user.healthNeeds || [],
        preferences: user.preferences || [],
        qualifications: user.qualifications || [],
        availability: user.availability || [],
        ...(user.role === 'caregiver' && {
          experience: (user as any).experience || 0,
          hourlyRate: (user as any).hourlyRate || 0,
          languages: (user as any).languages || [],
          certifications: (user as any).certifications || [],
        })
      });
    }
    setIsEditing(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const response = await userService.uploadProfilePicture(file);
      updateUser({ ...user!, profilePicture: response.profilePicture });
      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast({
        title: "Error",
        description: "Failed to upload profile picture",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addQualification = () => {
    if (newQualification.trim()) {
      setProfileData(prev => ({
        ...prev,
        qualifications: [...(prev.qualifications || []), newQualification.trim()]
      }));
      setNewQualification('');
    }
  };

  const removeQualification = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      qualifications: prev.qualifications?.filter((_, i) => i !== index) || []
    }));
  };

  const addLanguage = () => {
    if (newLanguage.trim() && user?.role === 'caregiver') {
      setProfileData(prev => ({
        ...prev,
        languages: [...((prev as any).languages || []), newLanguage.trim()]
      }));
      setNewLanguage('');
    }
  };

  const removeLanguage = (index: number) => {
    if (user?.role === 'caregiver') {
      setProfileData(prev => ({
        ...prev,
        languages: (prev as any).languages?.filter((_: string, i: number) => i !== index) || []
      }));
    }
  };

  const availabilityOptions = [
    'Monday Morning', 'Monday Afternoon', 'Monday Evening',
    'Tuesday Morning', 'Tuesday Afternoon', 'Tuesday Evening',
    'Wednesday Morning', 'Wednesday Afternoon', 'Wednesday Evening',
    'Thursday Morning', 'Thursday Afternoon', 'Thursday Evening',
    'Friday Morning', 'Friday Afternoon', 'Friday Evening',
    'Saturday Morning', 'Saturday Afternoon', 'Saturday Evening',
    'Sunday Morning', 'Sunday Afternoon', 'Sunday Evening'
  ];

  const healthNeedsOptions = [
    'Medication Management',
    'Mobility Assistance',
    'Personal Care',
    'Meal Preparation',
    'Companionship',
    'Transportation',
    'Light Housekeeping',
    'Medical Appointments',
    'Exercise Assistance',
    'Cognitive Support'
  ];

  const preferencesOptions = [
    'Female Caregiver',
    'Male Caregiver',
    'Non-Smoking',
    'Pet-Friendly',
    'Bilingual',
    'Overnight Care',
    'Emergency Response',
    'Technology Assistance'
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} className="bg-primary hover:bg-primary/90">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  disabled={loading}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Basic Information */}
          <TabsContent value="basic" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2 text-primary" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Manage your basic profile information and visibility settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center space-x-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={user?.profilePicture} />
                    <AvatarFallback className="bg-primary text-white text-2xl">
                      {user?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{user?.name}</h3>
                    <p className="text-gray-600 capitalize">{user?.role}</p>
                    <div className="flex items-center mt-2">
                      {user?.verified && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {user?.rating && (
                        <Badge className="ml-2 bg-yellow-100 text-yellow-800 border-yellow-200">
                          <Star className="w-3 h-3 mr-1" />
                          {user.rating.toFixed(1)}
                        </Badge>
                      )}
                    </div>
                    
                    {isEditing && (
                      <div className="mt-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="profile-picture"
                        />
                        <Label
                          htmlFor="profile-picture"
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Change Photo
                        </Label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Basic Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name || ''}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email || ''}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profileData.phone || ''}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profileData.location || ''}
                      onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio || ''}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                    rows={4}
                    placeholder={
                      user?.role === 'caregiver' 
                        ? "Tell seniors about your experience and approach to caregiving..."
                        : "Share some information about yourself and your care needs..."
                    }
                  />
                </div>

                {/* Caregiver-specific fields */}
                {user?.role === 'caregiver' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="experience">Years of Experience</Label>
                      <Input
                        id="experience"
                        type="number"
                        value={(profileData as any).experience || ''}
                        onChange={(e) => setProfileData(prev => ({ ...prev, experience: parseInt(e.target.value) || 0 }))}
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-gray-50' : ''}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                      <Input
                        id="hourlyRate"
                        type="number"
                        value={(profileData as any).hourlyRate || ''}
                        onChange={(e) => setProfileData(prev => ({ ...prev, hourlyRate: parseInt(e.target.value) || 0 }))}
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-gray-50' : ''}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences */}
          <TabsContent value="preferences" className="space-y-6">
            {user?.role === 'senior' ? (
              <>
                {/* Health Needs */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Heart className="w-5 h-5 mr-2 text-primary" />
                      Health & Care Needs
                    </CardTitle>
                    <CardDescription>
                      Select the types of care and assistance you need.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {healthNeedsOptions.map((need) => (
                        <label key={need} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={profileData.healthNeeds?.includes(need) || false}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setProfileData(prev => ({
                                  ...prev,
                                  healthNeeds: [...(prev.healthNeeds || []), need]
                                }));
                              } else {
                                setProfileData(prev => ({
                                  ...prev,
                                  healthNeeds: prev.healthNeeds?.filter(n => n !== need) || []
                                }));
                              }
                            }}
                            disabled={!isEditing}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">{need}</span>
                        </label>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Caregiver Preferences */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="w-5 h-5 mr-2 text-primary" />
                      Caregiver Preferences
                    </CardTitle>
                    <CardDescription>
                      Specify your preferences for caregivers.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {preferencesOptions.map((preference) => (
                        <label key={preference} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={profileData.preferences?.includes(preference) || false}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setProfileData(prev => ({
                                  ...prev,
                                  preferences: [...(prev.preferences || []), preference]
                                }));
                              } else {
                                setProfileData(prev => ({
                                  ...prev,
                                  preferences: prev.preferences?.filter(p => p !== preference) || []
                                }));
                              }
                            }}
                            disabled={!isEditing}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">{preference}</span>
                        </label>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                {/* Qualifications */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="w-5 h-5 mr-2 text-primary" />
                      Qualifications & Skills
                    </CardTitle>
                    <CardDescription>
                      List your caregiving qualifications and skills.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {profileData.qualifications?.map((qualification, index) => (
                        <Badge key={index} className="bg-primary/10 text-primary border-primary/20">
                          {qualification}
                          {isEditing && (
                            <button
                              onClick={() => removeQualification(index)}
                              className="ml-2 text-red-500 hover:text-red-700"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </Badge>
                      ))}
                    </div>
                    
                    {isEditing && (
                      <div className="flex space-x-2">
                        <Input
                          value={newQualification}
                          onChange={(e) => setNewQualification(e.target.value)}
                          placeholder="Add a qualification..."
                          onKeyPress={(e) => e.key === 'Enter' && addQualification()}
                        />
                        <Button onClick={addQualification} size="sm">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Languages */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="w-5 h-5 mr-2 text-primary" />
                      Languages
                    </CardTitle>
                    <CardDescription>
                      Languages you can communicate in.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {(profileData as any).languages?.map((language: string, index: number) => (
                        <Badge key={index} className="bg-teal-100 text-teal-800 border-teal-200">
                          {language}
                          {isEditing && (
                            <button
                              onClick={() => removeLanguage(index)}
                              className="ml-2 text-red-500 hover:text-red-700"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </Badge>
                      ))}
                    </div>
                    
                    {isEditing && (
                      <div className="flex space-x-2">
                        <Input
                          value={newLanguage}
                          onChange={(e) => setNewLanguage(e.target.value)}
                          placeholder="Add a language..."
                          onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
                        />
                        <Button onClick={addLanguage} size="sm">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Availability */}
          <TabsContent value="availability" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-primary" />
                  Availability Schedule
                </CardTitle>
                <CardDescription>
                  {user?.role === 'caregiver' 
                    ? "Set your available hours for caregiving."
                    : "Set your preferred times for receiving care."
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {availabilityOptions.map((slot) => (
                    <label key={slot} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profileData.availability?.includes(slot) || false}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setProfileData(prev => ({
                              ...prev,
                              availability: [...(prev.availability || []), slot]
                            }));
                          } else {
                            setProfileData(prev => ({
                              ...prev,
                              availability: prev.availability?.filter(a => a !== slot) || []
                            }));
                          }
                        }}
                        disabled={!isEditing}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">{slot}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-primary" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage your account security and privacy settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Email Notifications</h4>
                      <p className="text-sm text-gray-600">Receive email updates about your account</p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">SMS Notifications</h4>
                      <p className="text-sm text-gray-600">Receive text messages for important updates</p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Profile Visibility</h4>
                      <p className="text-sm text-gray-600">Allow others to find your profile</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Profile;
