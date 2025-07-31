import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, 
  Clock, 
  Users, 
  Star, 
  Heart, 
  TrendingUp, 
  Plus,
  MessageCircle,
  Activity,
  CheckCircle,
  AlertCircle,
  DollarSign,
  UserCheck
} from 'lucide-react';
import { dashboardService, sessionService, Session } from '@/lib/apiServices';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalSessions: number;
  upcomingSessions: number;
  completedSessions: number;
  averageRating: number;
  totalEarnings?: number;
  monthlyEarnings?: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalSessions: 0,
    upcomingSessions: 0,
    completedSessions: 0,
    averageRating: 0,
    totalEarnings: 0,
    monthlyEarnings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Use dummy data directly since dashboard API endpoints don't exist
      const statsData = {
        totalSessions: 12,
        upcomingSessions: 3,
        completedSessions: 8,
        averageRating: 4.7,
        totalEarnings: 1250,
        monthlyEarnings: 320
      };
      
      const upcomingSessionsData = [
        {
          _id: 'session-1',
          seniorId: 'senior-1',
          caregiverId: 'caregiver-1',
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time: '10:00 AM',
          duration: 2,
          purpose: 'Medication Management & Companionship',
          status: 'confirmed',
          notes: 'Regular check-in and medication assistance',
          caregiver: {
            _id: 'caregiver-1',
            name: 'Fatima Nkrumah',
            email: 'fatima@example.com',
            role: 'caregiver',
            rating: 4.8,
            profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
          },
          senior: {
            _id: 'senior-1',
            name: 'Kwame Addo',
            email: 'kwame@example.com',
            role: 'senior',
            profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
          },
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      // Get locally stored sessions
      const localSessions = JSON.parse(localStorage.getItem('userSessions') || '[]');
      
      // Combine dummy sessions with local sessions and sort by date
      const allSessions = [...upcomingSessionsData, ...localSessions];
      const sortedSessions = allSessions
        .filter(session => session.status === 'pending' || session.status === 'confirmed')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5);
      
      // Update stats to include local sessions
      const updatedStats = {
        ...statsData,
        totalSessions: statsData.totalSessions + localSessions.length,
        upcomingSessions: statsData.upcomingSessions + localSessions.filter(s => s.status === 'pending' || s.status === 'confirmed').length
      };
      
      setStats(updatedStats);
      setSessions(sortedSessions);
    } catch (error: any) {
      console.error('Error setting up dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const statCards = [
    {
      title: 'Total Sessions',
      value: stats.totalSessions,
      icon: Calendar,
      description: 'All time sessions',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Upcoming Sessions',
      value: stats.upcomingSessions,
      icon: Clock,
      description: 'This week',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Completed Sessions',
      value: stats.completedSessions,
      icon: CheckCircle,
      description: 'Successfully finished',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Average Rating',
      value: stats.averageRating?.toFixed(1) || '0.0',
      icon: Star,
      description: 'From reviews',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    }
  ];

  if (user?.role === 'caregiver') {
    statCards.push({
      title: 'Total Earnings',
      value: `$${stats.totalEarnings || 0}`,
      icon: DollarSign,
      description: 'All time earnings',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    });
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.name}!
              </h1>
              <p className="mt-2 text-gray-600">
                {user?.role === 'senior' 
                  ? 'Here\'s an overview of your care sessions and activities.'
                  : 'Here\'s an overview of your caregiving activities and upcoming sessions.'
                }
              </p>
            </div>
            <div className="flex items-center gap-4">
              {user?.role === 'senior' ? (
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <Link to="/find-caregivers">
                    <Plus className="w-4 h-4 mr-2" />
                    Find Caregivers
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="outline">
                  <Link to="/profile">
                    <UserCheck className="w-4 h-4 mr-2" />
                    Update Profile
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline">
                <Link to="/messages">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Messages
                </Link>
              </Button>
            </div>
          </div>
        </div>



        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {stat.description}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Sessions */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold text-gray-900">
                      Upcoming Sessions
                    </CardTitle>
                    <CardDescription>
                      Your next scheduled care sessions
                    </CardDescription>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/sessions">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : sessions.length > 0 ? (
                  <div className="space-y-4">
                    {sessions.map((session) => (
                      <div key={session._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={user?.role === 'senior' ? session.caregiver?.profilePicture : session.senior?.profilePicture} />
                            <AvatarFallback className="bg-primary text-white">
                              {user?.role === 'senior' 
                                ? session.caregiver?.name?.charAt(0) 
                                : session.senior?.name?.charAt(0)
                              }
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {user?.role === 'senior' ? session.caregiver?.name : session.senior?.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatDate(session.date)} at {session.time}
                            </p>
                            <p className="text-sm text-gray-500">
                              {session.purpose}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className={`${getStatusColor(session.status)} border-0`}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(session.status)}
                              <span className="capitalize">{session.status}</span>
                            </div>
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No upcoming sessions
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {user?.role === 'senior' 
                        ? 'Start by finding a caregiver that matches your needs.'
                        : 'You don\'t have any upcoming sessions scheduled.'
                      }
                    </p>
                    {user?.role === 'senior' && (
                      <Button asChild>
                        <Link to="/find-caregivers">Find Caregivers</Link>
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Profile */}
          <div className="space-y-6">
            {/* Profile Summary */}
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Profile Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={user?.profilePicture} />
                    <AvatarFallback className="bg-primary text-white text-lg">
                      {user?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900">{user?.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{user?.role}</p>
                    <p className="text-sm text-gray-500">{user?.location}</p>
                  </div>
                </div>
                
                {user?.role === 'caregiver' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Rating</span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{stats.averageRating?.toFixed(1) || '0.0'}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Sessions Completed</span>
                      <span className="text-sm font-medium">{stats.completedSessions}</span>
                    </div>
                  </div>
                )}

                <Button asChild variant="outline" className="w-full mt-4">
                  <Link to="/profile">Edit Profile</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {user?.role === 'senior' ? (
                  <>
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link to="/find-caregivers">
                        <Users className="w-4 h-4 mr-2" />
                        Find Caregivers
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link to="/sessions">
                        <Calendar className="w-4 h-4 mr-2" />
                        View Sessions
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link to="/sessions">
                        <Calendar className="w-4 h-4 mr-2" />
                        Manage Sessions
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link to="/profile">
                        <UserCheck className="w-4 h-4 mr-2" />
                        Update Availability
                      </Link>
                    </Button>
                  </>
                )}
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/messages">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Messages
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
