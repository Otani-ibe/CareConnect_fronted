import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  MapPin, 
  Filter,
  Clock,
  Heart,
  MessageCircle,
  Calendar,
  Shield,
  ChevronDown
} from 'lucide-react';
import { caregiverService, sessionService, Caregiver } from '@/lib/apiServices';
import { useToast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';

const FindCaregivers: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    name: '',
    location: '',
    availability: [] as string[],
  });



  const availabilityOptions = [
    'Early Morning (6AM-9AM)',
    'Morning (9AM-12PM)', 
    'Afternoon (12PM-5PM)',
    'Evening (5PM-9PM)',
    'Night (9PM-6AM)',
    'Weekends Only',
    'Holidays Available',
    'Live-in Care',
    'Respite Care'
  ];

  useEffect(() => {
    fetchCaregivers();
  }, [filters]);

  const fetchCaregivers = async () => {
    try {
      setLoading(true);
      
      // Use searchCaregivers with current filters
      const searchFilters = {
        name: filters.name || undefined,
        location: filters.location || undefined,
        availability: filters.availability.length > 0 ? filters.availability : undefined,
        page: 1,
        limit: 50
      };
      
      const data = await caregiverService.searchCaregivers(searchFilters);
      setCaregivers(Array.isArray(data) ? data : (data.caregivers || []));
    } catch (error: any) {
      console.error('Error searching caregivers:', error);
      
      // Don't show error toast for CORS errors since we have fallback data
      if (error.message !== 'CORS_ERROR' && !error.message?.includes('Network Error')) {
        toast({
          title: "Error",
          description: "Failed to search caregivers. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleArrayFilterChange = (key: string, value: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [key]: checked 
        ? [...prev[key as keyof typeof prev] as string[], value]
        : (prev[key as keyof typeof prev] as string[]).filter(item => item !== value)
    }));
  };

  const clearFilters = () => {
    setFilters({
      name: '',
      location: '',
      availability: [],
    });
  };

  const handleBookSession = async (caregiverId: string) => {
    try {
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to book a session",
          variant: "destructive",
        });
        return;
      }

      // Find the caregiver data first
      const caregiver = caregivers.find(c => c._id === caregiverId);
      if (!caregiver) {
        toast({
          title: "Error",
          description: "Caregiver not found",
          variant: "destructive",
        });
        return;
      }

      // Get tomorrow's date as default
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const appointmentDate = tomorrow.toISOString().split('T')[0];
      const time = '10:00 AM';
      
      // Create session request data
      const sessionData = {
        caregiverId: caregiverId,
        date: appointmentDate,
        time: time,
        duration: 2, // Default 2 hours
        purpose: 'General Care & Companionship',
        notes: `Session requested from Find Caregivers page with ${caregiver.name}`
      };
      
      const result = await sessionService.requestSession(sessionData);
      
      // Show success message
      toast({
        title: "Session Requested Successfully!",
        description: `Session with ${caregiver.name} requested for ${appointmentDate} at ${time}. Check your Sessions page to track the status.`,
      });
      
      // Navigate to sessions page to see the new session
      setTimeout(() => {
        navigate('/sessions');
      }, 1500);
      
    } catch (error: any) {
      console.error('Error requesting session:', error);
      
      // For API unavailable errors, show a helpful message
      if (error.message === 'API_UNAVAILABLE') {
        toast({
          title: "Session Requested",
          description: "Session request stored locally. Check your Sessions page to track the status.",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to request session",
          variant: "destructive",
        });
      }
    }
  };

  const handleSendMessage = async (caregiverId: string) => {
    try {
      // Navigate to messages with the caregiver
      window.location.href = `/messages?userId=${caregiverId}`;
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to open messaging",
        variant: "destructive",
      });
    }
  };



  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Caregivers</h1>
          <p className="text-gray-600 text-lg">
            Discover qualified caregivers who match your specific needs and preferences.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Search & Filter</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="name"
                      placeholder="Search by caregiver name"
                      value={filters.name}
                      onChange={(e) => handleFilterChange('name', e.target.value)}
                      className="pl-10 h-12"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="location"
                      placeholder="Enter city, state, or ZIP code"
                      value={filters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                      className="pl-10 h-12"
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={fetchCaregivers}
                    disabled={loading}
                    className="bg-primary hover:bg-primary/90 h-12 px-8 w-full"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="border-t pt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Clear Filters */}
                    <div className="flex items-end">
                      <Button variant="outline" onClick={clearFilters} className="w-full">
                        Clear Filters
                      </Button>
                    </div>
                  </div>

                  {/* Availability */}
                  <div>
                    <Label className="text-base font-semibold mb-3 block">Availability</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {availabilityOptions.map((availability) => (
                        <div key={availability} className="flex items-center space-x-2">
                          <Checkbox
                            id={availability}
                            checked={filters.availability.includes(availability)}
                            onCheckedChange={(checked) => 
                              handleArrayFilterChange('availability', availability, checked as boolean)
                            }
                          />
                          <Label htmlFor={availability} className="text-sm">
                            {availability}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              {loading ? 'Searching...' : `Found ${caregivers.length} caregivers`}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : caregivers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {caregivers.map((caregiver) => (
                <Card key={caregiver._id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-center space-x-4 mb-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={caregiver.profilePicture} />
                        <AvatarFallback className="bg-primary text-white text-lg">
                          {caregiver.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">{caregiver.name}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{caregiver.location}</span>
                        </div>

                      </div>
                      {caregiver.verified && (
                        <div className="flex items-center text-green-600">
                          <Shield className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    {/* Bio */}
                    {caregiver.bio && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {caregiver.bio}
                      </p>
                    )}





                    {/* Availability */}
                    {caregiver.availability && caregiver.availability.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Available:</p>
                        <div className="flex flex-wrap gap-1">
                          {caregiver.availability.slice(0, 2).map((slot, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              {slot}
                            </Badge>
                          ))}
                          {caregiver.availability.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{caregiver.availability.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-2 pt-4 border-t">
                      <Button
                        onClick={() => handleBookSession(caregiver._id)}
                        className="flex-1 bg-primary hover:bg-primary/90"
                        size="sm"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Book Session
                      </Button>
                      <Button
                        onClick={() => handleSendMessage(caregiver._id)}
                        variant="outline"
                        size="sm"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>

                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-md">
              <CardContent className="text-center py-12">
                <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No caregivers found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search criteria or location to find more caregivers.
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default FindCaregivers;
