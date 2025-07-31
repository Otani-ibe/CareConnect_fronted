import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { 
  Calendar, 
  Clock, 
  MapPin, 
  MessageCircle, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Edit,
  MoreVertical,
  Star,
  DollarSign
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { sessionService, Session } from '@/lib/apiServices';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const Sessions: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchSessions();
  }, [statusFilter]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const filter = statusFilter === 'all' ? undefined : statusFilter;
      
      // Debug: Check current user
      const userData = localStorage.getItem('user');
      const currentUser = userData ? JSON.parse(userData) : null;
      console.log('Current user fetching sessions:', currentUser?._id);
      
      const data = await sessionService.getSessions(filter);
      console.log('Sessions data received:', data);
      console.log('First session caregiver:', data.sessions?.[0]?.caregiver);
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load sessions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSessionAction = async (sessionId: string, action: string, reason?: string) => {
    try {
      switch (action) {
        case 'accept':
          await sessionService.acceptSession(sessionId);
          toast({
            title: "Session Accepted",
            description: "You have successfully accepted this session.",
          });
          break;
        case 'decline':
          await sessionService.declineSession(sessionId, reason);
          toast({
            title: "Session Declined",
            description: "You have declined this session.",
          });
          break;
        case 'cancel':
          await sessionService.cancelSession(sessionId, reason);
          toast({
            title: "Session Cancelled",
            description: "The session has been cancelled.",
          });
          break;
        case 'complete':
          await sessionService.completeSession(sessionId);
          toast({
            title: "Session Completed",
            description: "The session has been marked as completed.",
          });
          break;
      }
      fetchSessions(); // Refresh the list
    } catch (error) {
      console.error(`Error ${action}ing session:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} session`,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const filterSessionsByStatus = (status: string) => {
    if (status === 'all') return sessions;
    return sessions.filter(session => session.status === status);
  };

  const getSessionCounts = () => {
    return {
      all: sessions.length,
      pending: sessions.filter(s => s.status === 'pending').length,
      confirmed: sessions.filter(s => s.status === 'confirmed').length,
      completed: sessions.filter(s => s.status === 'completed').length,
      cancelled: sessions.filter(s => s.status === 'cancelled').length,
    };
  };

  const counts = getSessionCounts();

  const renderSessionCard = (session: Session) => {
    // Handle nested caregiver structure or use fallback
    const caregiverData = session.caregiver?.caregiver || session.caregiver;
    const otherUser = user?.role === 'senior' ? caregiverData : session.senior;
    const canModify = session.status === 'pending' || session.status === 'confirmed';
    const isUpcoming = new Date(session.appointmentDate || session.date) > new Date();
    
    // Use caregiver name if available, otherwise use a simple fallback
    const caregiverName = otherUser?.name || `Caregiver ${session.caregiverId?.slice(-4) || 'ID'}`;
    const caregiverLocation = otherUser?.location || 'Location not available';
    
    console.log('Rendering session card:', {
      sessionId: session._id,
      caregiverName: caregiverName,
      caregiverId: session.caregiverId
    });

    return (
      <Card key={session._id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={otherUser?.profilePicture} />
                <AvatarFallback className="bg-primary text-white">
                  {otherUser?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  {caregiverName}
                </h3>
                <p className="text-sm text-gray-600 capitalize">
                  {user?.role === 'senior' ? 'Caregiver' : 'Senior'}
                </p>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  {caregiverLocation}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge className={`${getStatusColor(session.status)} border`}>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(session.status)}
                  <span className="capitalize">{session.status}</span>
                </div>
              </Badge>
              
              {canModify && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-2">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {user?.role === 'caregiver' && session.status === 'pending' && (
                      <>
                        <DropdownMenuItem 
                          onClick={() => handleSessionAction(session._id, 'accept')}
                          className="text-green-600"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accept Session
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleSessionAction(session._id, 'decline')}
                          className="text-red-600"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Decline Session
                        </DropdownMenuItem>
                      </>
                    )}
                    {session.status === 'confirmed' && isUpcoming && (
                      <DropdownMenuItem 
                        onClick={() => handleSessionAction(session._id, 'cancel')}
                        className="text-red-600"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancel Session
                      </DropdownMenuItem>
                    )}
                    {session.status === 'confirmed' && !isUpcoming && user?.role === 'caregiver' && (
                      <DropdownMenuItem 
                        onClick={() => handleSessionAction(session._id, 'complete')}
                        className="text-blue-600"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Complete
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Reschedule
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Date & Time</p>
              <div className="flex items-center text-gray-900">
                <Calendar className="w-4 h-4 mr-2 text-primary" />
                <span>{formatDate(session.appointmentDate || session.date)}</span>
              </div>
              <div className="flex items-center text-gray-900 mt-1">
                <Clock className="w-4 h-4 mr-2 text-primary" />
                <span>{formatTime(session.time)} ({session.duration || 2}h)</span>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Purpose</p>
              <p className="text-gray-900">{session.purpose}</p>
            </div>
          </div>

          {session.notes && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Notes</p>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {session.notes}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Session ID: {session._id.slice(-8)}</span>
              <span>Created: {new Date(session.createdAt).toLocaleDateString()}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                asChild
                variant="outline"
                size="sm"
              >
                <Link to={`/messages?userId=${otherUser?._id}`}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message
                </Link>
              </Button>
              
              {session.status === 'completed' && user?.role === 'senior' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Open review modal
                    toast({
                      title: "Leave Review",
                      description: "Review functionality coming soon",
                    });
                  }}
                >
                  <Star className="w-4 h-4 mr-2" />
                  Review
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {user?.role === 'senior' ? 'My Care Sessions' : 'My Caregiving Sessions'}
              </h1>
              <p className="text-gray-600">
                {user?.role === 'senior' 
                  ? 'Manage your scheduled care sessions and book new ones.'
                  : 'Manage your caregiving appointments and availability.'
                }
              </p>
            </div>
            
            {user?.role === 'senior' && (
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link to="/find-caregivers">
                  <Calendar className="w-4 h-4 mr-2" />
                  Book New Session
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Filter by status:</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All ({counts.all})</SelectItem>
                  <SelectItem value="pending">Pending ({counts.pending})</SelectItem>
                  <SelectItem value="confirmed">Confirmed ({counts.confirmed})</SelectItem>
                  <SelectItem value="completed">Completed ({counts.completed})</SelectItem>
                  <SelectItem value="cancelled">Cancelled ({counts.cancelled})</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Sessions</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="pending">
              Pending
              {counts.pending > 0 && (
                <Badge className="ml-2 bg-yellow-500 text-white text-xs px-2 py-0.5">
                  {counts.pending}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filterSessionsByStatus(statusFilter).length > 0 ? (
              <div className="space-y-6">
                {filterSessionsByStatus(statusFilter).map(renderSessionCard)}
              </div>
            ) : (
              <Card className="border-0 shadow-md">
                <CardContent className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No sessions found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {statusFilter === 'all' 
                      ? user?.role === 'senior' 
                        ? "You haven't booked any care sessions yet."
                        : "You don't have any caregiving sessions yet."
                      : `No ${statusFilter} sessions found.`
                    }
                  </p>
                  {user?.role === 'senior' && statusFilter === 'all' && (
                    <Button asChild>
                      <Link to="/find-caregivers">Find Caregivers</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-6">
            {sessions
              .filter(session => new Date(session.date) > new Date())
              .map(renderSessionCard)}
          </TabsContent>

          <TabsContent value="past" className="space-y-6">
            {sessions
              .filter(session => new Date(session.date) <= new Date())
              .map(renderSessionCard)}
          </TabsContent>

          <TabsContent value="pending" className="space-y-6">
            {sessions
              .filter(session => session.status === 'pending')
              .map(renderSessionCard)}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Sessions;
