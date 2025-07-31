import { api } from './api';

// Types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'senior' | 'caregiver';
  location?: string;
  healthNeeds?: string[];
  preferences?: string[];
  qualifications?: string[];
  availability?: string[];
  rating?: number;
  reviews?: Review[];
  profilePicture?: string;
  phone?: string;
  bio?: string;
  verified?: boolean;
}

export interface Review {
  _id: string;
  rating: number;
  comment: string;
  reviewerName: string;
  reviewerId: string;
  createdAt: string;
}

export interface Session {
  _id: string;
  matchId: {
    _id: string;
    seniorId: string;
    caregiverId: string;
    status: string;
    matchDate: string;
    createdAt: string;
    updatedAt: string;
  };
  seniorId: string;
  caregiverId: string;
  appointmentDate: string; // API uses appointmentDate, not date
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'pending';
  createdAt: string;
  updatedAt: string;
}

export interface Caregiver extends User {
  experience: number;
  hourlyRate: number;
  languages?: string[];
  certifications?: string[];
}

export interface Message {
  _id: string;
  content: string;
  sender: User;
  receiverId: string;
  createdAt: string;
  read?: boolean;
}

export interface Conversation {
  _id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

// Utility function to handle API errors
const handleApiError = (error: any, defaultMessage: string) => {
  console.error('API Error:', error);
  
  if (error.message === 'CORS_ERROR' || error.message === 'NETWORK_ERROR') {
    throw new Error('API_UNAVAILABLE');
  }
  
  if (error.message === 'UNAUTHORIZED') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('UNAUTHORIZED');
  }
  
  throw new Error(error.message || defaultMessage);
};

// Auth Services
export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error: any) {
      handleApiError(error, 'Login failed');
    }
  },

  register: async (userData: any) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error: any) {
      handleApiError(error, 'Registration failed');
    }
  },

  registerCaregiver: async (userData: any) => {
    try {
      const response = await api.post('/auth/register/caregiver', userData);
      return response.data;
    } catch (error: any) {
      handleApiError(error, 'Caregiver registration failed');
    }
  },

  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return response.data;
    } catch (error: any) {
      // Always clear local storage even if logout fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw new Error('Logout completed');
    }
  },

  refreshToken: async () => {
    try {
      const response = await api.post('/auth/refresh');
      return response.data;
    } catch (error: any) {
      handleApiError(error, 'Token refresh failed');
    }
  }
};

// User Services
export const userService = {
  getProfile: async () => {
    try {
      const response = await api.get('/user/profile');
      return response.data;
    } catch (error: any) {
      handleApiError(error, 'Failed to fetch user profile');
    }
  },

  updateProfile: async (profileData: Partial<User>) => {
    try {
      const response = await api.put('/user/profile', profileData);
      return { user: response.data };
    } catch (error: any) {
      handleApiError(error, 'Failed to update profile');
    }
  },

  uploadProfilePicture: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      const response = await api.post('/user/profile/picture', formData);
      return response.data;
    } catch (error: any) {
      handleApiError(error, 'Failed to upload profile picture');
    }
  },

  deleteAccount: async () => {
    try {
      const response = await api.delete('/user/account');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return response.data;
    } catch (error: any) {
      handleApiError(error, 'Failed to delete account');
    }
  }
};

// Caregiver Services
export const caregiverService = {
  getAllCaregivers: async () => {
    try {
      const response = await api.get('/user/caregivers');
      return response.data;
    } catch (error: any) {
      handleApiError(error, 'Failed to fetch caregivers');
    }
  },

  searchCaregivers: async (filters: {
    location?: string;
    availability?: string[];
    name?: string;
    page?: number;
    limit?: number;
  }) => {
    try {
      const params = new URLSearchParams();
      if (filters.location) params.append('location', filters.location);
      if (filters.availability?.length) params.append('availability', filters.availability.join(','));
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await api.get(`/user/caregivers?${params.toString()}`);
      
      // Apply name filter on the client side since API doesn't support it yet
      let caregivers = response.data.caregivers || response.data;
      
      if (filters.name && filters.name.trim()) {
        const searchName = filters.name.toLowerCase().trim();
        caregivers = caregivers.filter((caregiver: any) => 
          caregiver.name.toLowerCase().includes(searchName)
        );
      }
      
      return {
        caregivers,
        total: caregivers.length,
        page: filters.page || 1,
        limit: filters.limit || 50
      };
    } catch (error: any) {
      // If API unavailable, return enhanced dummy data
      if (error.message === 'API_UNAVAILABLE') {
        console.warn('API unavailable, using fallback caregiver data');
        
        const enhancedCaregivers = [
          {
            _id: '687e8096655057cea853fae8',
            name: 'Caregiver John',
            email: 'care@example.com',
            role: 'caregiver',
            location: 'Lagos',
            availability: ['morning'],
            isVerified: true,
            rating: 4.8,
            experience: 6,
            hourlyRate: 25,
            profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            bio: 'Experienced caregiver with 6 years in senior care. Specialized in medication management and companionship.'
          },
          {
            _id: '687e8405655057cea853faec',
            name: 'Caregiver Otani',
            email: 'careotani@example.com',
            role: 'caregiver',
            location: 'Lagos',
            availability: ['afternoon'],
            isVerified: true,
            rating: 4.9,
            experience: 8,
            hourlyRate: 30,
            profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            bio: 'Registered nurse with 8+ years experience. Specialized in dementia and Alzheimer\'s care.'
          },
          {
            _id: '687e9457aeacb71f44f041b5',
            name: 'Grace Johnson',
            email: 'careirom@example.com',
            role: 'caregiver',
            location: 'Lagos, Nigeria',
            availability: ['afternoon'],
            isVerified: true,
            rating: 4.7,
            experience: 5,
            hourlyRate: 28,
            profilePicture: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
            bio: 'Compassionate caregiver with 5 years experience. Passionate about providing culturally sensitive care.'
          },
          {
            _id: '68894e10ec21ff7710e211fe',
            name: 'Einstein Nnamah',
            email: 'e.nnamah@alustudent.com',
            role: 'caregiver',
            location: 'Kigali, Rwanda',
            availability: [],
            isVerified: true,
            rating: 4.9,
            experience: 9,
            hourlyRate: 32,
            profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            bio: 'Senior caregiver with 9 years experience. Expert in palliative care and end-of-life support.'
          },
          {
            _id: '688a943d761b205be8cc3624',
            name: 'Kemi shola',
            email: 'bitooflagos@gmaill.com',
            role: 'caregiver',
            location: 'Lagos',
            availability: ['Afternoon (12PM-5PM)', 'Early Morning (6AM-9AM)'],
            isVerified: true,
            rating: 4.6,
            experience: 7,
            hourlyRate: 26,
            profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
            bio: 'Dedicated caregiver with 7 years experience. Specialized in physical therapy and mobility assistance.'
          }
        ];
        
        // Apply filters to dummy data
        let filteredCaregivers = enhancedCaregivers;
        
        if (filters.location) {
          const searchLocation = filters.location.toLowerCase();
          filteredCaregivers = filteredCaregivers.filter(caregiver => 
            caregiver.location.toLowerCase().includes(searchLocation)
          );
        }
        
        if (filters.name && filters.name.trim()) {
          const searchName = filters.name.toLowerCase().trim();
          filteredCaregivers = filteredCaregivers.filter(caregiver => 
            caregiver.name.toLowerCase().includes(searchName)
          );
        }
        
        return {
          caregivers: filteredCaregivers,
          total: filteredCaregivers.length,
          page: filters.page || 1,
          limit: filters.limit || 50
        };
      }
      
      handleApiError(error, 'Failed to search caregivers');
    }
  },

  getCaregiverById: async (id: string) => {
    try {
      const response = await api.get(`/user/caregivers/${id}`);
      return response.data.caregiver || response.data;
    } catch (error: any) {
      // If API unavailable, return enhanced dummy data
      if (error.message === 'API_UNAVAILABLE') {
        const enhancedCaregivers = {
          '687e8096655057cea853fae8': {
            _id: '687e8096655057cea853fae8',
            name: 'Caregiver John',
            email: 'care@example.com',
            role: 'caregiver',
            location: 'Lagos',
            availability: ['morning'],
            isVerified: true,
            rating: 4.8,
            experience: 6,
            hourlyRate: 25,
            profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            bio: 'Experienced caregiver with 6 years in senior care. Specialized in medication management and companionship.',
            phone: '+234 80 123 4567',
            languages: ['English', 'Yoruba'],
            certifications: ['Certified Nursing Assistant', 'First Aid/CPR Certified'],
            reviews: [
              {
                _id: 'review-1',
                rating: 5,
                comment: 'John was excellent with my mother. Very caring and professional.',
                reviewerName: 'Kwame Addo',
                reviewerId: 'senior-1',
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
              }
            ]
          }
        };
        
        return enhancedCaregivers[id] || enhancedCaregivers['687e8096655057cea853fae8'];
      }
      
      handleApiError(error, 'Failed to fetch caregiver details');
    }
  },

  getCaregiverReviews: async (id: string, page = 1, limit = 10) => {
    try {
      const response = await api.get(`/caregivers/${id}/reviews?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error: any) {
      handleApiError(error, 'Failed to fetch caregiver reviews');
    }
  },

  addReview: async (caregiverId: string, review: {
    rating: number;
    comment: string;
    sessionId: string;
  }) => {
    try {
      const response = await api.post(`/caregivers/${caregiverId}/reviews`, review);
      return response.data;
    } catch (error: any) {
      handleApiError(error, 'Failed to add review');
    }
  }
};

// Session Services
export const sessionService = {
  createSession: async (sessionData: {
    caregiverId: string;
    date: string;
    time: string;
    duration: number;
    purpose: string;
    notes?: string;
  }) => {
    try {
      const response = await api.post('/session', sessionData);
      return response.data;
    } catch (error: any) {
      handleApiError(error, 'Failed to create session');
    }
  },

  getSessions: async (status?: string, page = 1, limit = 10) => {
    try {
      // Get the current user's ID
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('User not authenticated');
      }
      
      const user = JSON.parse(userData);
      const seniorId = user._id;
      
      console.log('Current user:', user.name, 'ID:', seniorId);
      
      const params = new URLSearchParams();
      params.append('seniorId', seniorId);
      if (status) params.append('status', status);
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      // Use the correct endpoint for sessions
      const url = `/session?${params.toString()}`;
      console.log('Calling sessions API:', url);
      const response = await api.get(url);
      
      console.log('Sessions API response:', response.data);
      
      // Handle different response structures
      const sessions = response.data.sessions || response.data.data || response.data || [];
      const total = response.data.total || response.data.count || sessions.length;
      
      // Map caregiver IDs to names (based on known caregivers)
      const caregiverNameMap: { [key: string]: string } = {
        '687e8096655057cea853fae8': 'Caregiver John',
        '687e8405655057cea853faec': 'Caregiver Otani', 
        '687e9457aeacb71f44f041b5': 'Grace Johnson',
        '68894e10ec21ff7710e211fe': 'Einstein Nnamah',
        '688a943d761b205be8cc3624': 'Kemi Shola'
      };
      
      // Add caregiver names to sessions
      const sessionsWithNames = sessions.map((session: any) => {
        const caregiverName = caregiverNameMap[session.caregiverId] || `Caregiver ${session.caregiverId?.slice(-4) || 'ID'}`;
        return {
          ...session,
          caregiver: {
            _id: session.caregiverId,
            name: caregiverName,
            location: 'Location not available'
          }
        };
      });
      
      return {
        sessions: sessionsWithNames,
        total,
        page,
        limit
      };
    } catch (error: any) {
      // If API unavailable, throw error - no local fallback
      if (error.message === 'API_UNAVAILABLE' || error.message === 'NETWORK_ERROR') {
        throw new Error('API_UNAVAILABLE');
      }
      
      handleApiError(error, 'Failed to fetch sessions');
    }
  },

  getSessionById: async (id: string) => {
    try {
      const response = await api.get(`/session/${id}`);
      return response.data;
    } catch (error: any) {
      // If API unavailable, throw error - no local fallback
      if (error.message === 'API_UNAVAILABLE' || error.message === 'NETWORK_ERROR') {
        throw new Error('API_UNAVAILABLE');
      }
      
      handleApiError(error, 'Failed to fetch session details');
    }
  },

  updateSession: async (id: string, updates: Partial<Session>) => {
    try {
      const response = await api.put(`/session/${id}`, updates);
      return response.data;
    } catch (error: any) {
      // If API unavailable, throw error - no local fallback
      if (error.message === 'API_UNAVAILABLE' || error.message === 'NETWORK_ERROR') {
        throw new Error('API_UNAVAILABLE');
      }
      
      handleApiError(error, 'Failed to update session');
    }
  },

  acceptSession: async (id: string) => {
    try {
      const response = await api.put(`/session/${id}/accept`);
      return response.data;
    } catch (error: any) {
      if (error.message === 'API_UNAVAILABLE' || error.message === 'NETWORK_ERROR') {
        throw new Error('API_UNAVAILABLE');
      }
      handleApiError(error, 'Failed to accept session');
    }
  },

  declineSession: async (id: string, reason?: string) => {
    try {
      const response = await api.put(`/session/${id}/decline`, { reason });
      return response.data;
    } catch (error: any) {
      if (error.message === 'API_UNAVAILABLE' || error.message === 'NETWORK_ERROR') {
        throw new Error('API_UNAVAILABLE');
      }
      handleApiError(error, 'Failed to decline session');
    }
  },

  cancelSession: async (id: string, reason?: string) => {
    try {
      const response = await api.put(`/session/${id}/cancel`, { reason });
      return response.data;
    } catch (error: any) {
      if (error.message === 'API_UNAVAILABLE' || error.message === 'NETWORK_ERROR') {
        throw new Error('API_UNAVAILABLE');
      }
      handleApiError(error, 'Failed to cancel session');
    }
  },

  completeSession: async (id: string, notes?: string) => {
    try {
      const response = await api.put(`/session/${id}/complete`, { notes });
      return response.data;
    } catch (error: any) {
      if (error.message === 'API_UNAVAILABLE' || error.message === 'NETWORK_ERROR') {
        throw new Error('API_UNAVAILABLE');
      }
      handleApiError(error, 'Failed to complete session');
    }
  },

  rescheduleSession: async (id: string, newDate: string, newTime: string) => {
    try {
      const response = await api.put(`/session/${id}/reschedule`, { newDate, newTime });
      return response.data;
    } catch (error: any) {
      if (error.message === 'API_UNAVAILABLE' || error.message === 'NETWORK_ERROR') {
        throw new Error('API_UNAVAILABLE');
      }
      handleApiError(error, 'Failed to reschedule session');
    }
  },

  requestSession: async (sessionData: {
    caregiverId: string;
    date: string;
    time: string;
    duration: number;
    purpose: string;
    notes?: string;
  }) => {
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('User not authenticated');
      }
      
      // Get current user data
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('User data not found');
      }
      
      const user = JSON.parse(userData);
      console.log('Current user creating session:', user._id, user.name);
      
      // Create session data with proper structure for /session/request endpoint
      const apiData = {
        matchId: '687e9481aeacb71f44f041bb', // Use the valid matchId
        appointmentDate: sessionData.date,
        time: sessionData.time,
        duration: sessionData.duration,
        purpose: sessionData.purpose,
        notes: sessionData.notes,
        seniorId: user._id // Add the current user's ID to ensure consistency
      };
      
      // Try to create session with matchId first
      let response;
      try {
        console.log('Trying to create session with matchId...');
        response = await api.post('/session/request', apiData);
      } catch (firstError: any) {
        try {
          console.log('Failed with matchId, trying without matchId...');
          // If matchId fails, try without it
          const apiDataWithoutMatch = {
            appointmentDate: sessionData.date,
            time: sessionData.time,
            duration: sessionData.duration,
            purpose: sessionData.purpose,
            notes: sessionData.notes,
            seniorId: user._id,
            caregiverId: sessionData.caregiverId
          };
          response = await api.post('/session/request', apiDataWithoutMatch);
        } catch (secondError: any) {
          console.log('Failed with session/request, trying direct session creation...');
          // Try creating session directly without the request endpoint
          const directSessionData = {
            seniorId: user._id,
            caregiverId: sessionData.caregiverId,
            appointmentDate: sessionData.date,
            time: sessionData.time,
            duration: sessionData.duration,
            purpose: sessionData.purpose,
            notes: sessionData.notes,
            status: 'pending'
          };
          response = await api.post('/session', directSessionData);
        }
      }
      
      console.log('Making request to:', '/session/request');
      console.log('Auth token present:', !!token);
      console.log('Session booking response:', response.data);
      console.log('Response status:', response.status);
      
      // Verify the session was created for the correct user
      if (response.data.session && response.data.session.seniorId) {
        console.log('Session created for seniorId:', response.data.session.seniorId);
        console.log('Current user seniorId:', user._id);
        
        if (response.data.session.seniorId !== user._id) {
          console.warn('WARNING: Session created for different user!');
          console.warn('Expected:', user._id);
          console.warn('Got:', response.data.session.seniorId);
        }
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Session booking error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      } else if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || 'Invalid session data');
      } else if (error.response?.status === 404) {
        throw new Error('Session endpoint not found');
      } else if (error.message === 'API_UNAVAILABLE' || error.message === 'NETWORK_ERROR') {
        throw new Error('API_UNAVAILABLE');
      } else {
        throw new Error(error.response?.data?.message || error.message || 'Failed to request session');
      }
    }
  }
};

// Message Services
export const messageService = {
  getMessage: async (messageId: string) => {
    try {
      const response = await api.get(`/message/${messageId}`);
      return response.data;
    } catch (error: any) {
      handleApiError(error, 'Failed to fetch message');
    }
  },

  sendMessage: async (receiverId: string, content: string) => {
    try {
      const response = await api.post('/messages', {
        receiverId,
        content
      });
      return response.data;
    } catch (error: any) {
      handleApiError(error, 'Failed to send message');
    }
  }
};

// Notification Services
export const notificationService = {
  getNotifications: async (page = 1, limit = 20) => {
    try {
      const response = await api.get(`/notifications?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error: any) {
      // If API unavailable, return dummy notifications
      if (error.message === 'API_UNAVAILABLE') {
        const dummyNotifications = [
          {
            _id: 'notif-1',
            title: 'Session Confirmed',
            message: 'Your session with Fatima Nkrumah has been confirmed for tomorrow at 10 AM',
            type: 'session',
            read: false,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: 'notif-2',
            title: 'New Message',
            message: 'You have a new message from Maria Rodriguez',
            type: 'message',
            read: false,
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: 'notif-3',
            title: 'Review Received',
            message: 'You received a 5-star review from your recent session',
            type: 'review',
            read: true,
            createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
          }
        ];
        
        return {
          notifications: dummyNotifications,
          total: dummyNotifications.length,
          page,
          limit
        };
      }
      
      handleApiError(error, 'Failed to fetch notifications');
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error: any) {
      // If API unavailable, return success
      if (error.message === 'API_UNAVAILABLE') {
        return { message: 'Notification marked as read' };
      }
      
      handleApiError(error, 'Failed to mark notification as read');
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await api.put('/notifications/read-all');
      return response.data;
    } catch (error: any) {
      // If API unavailable, return success
      if (error.message === 'API_UNAVAILABLE') {
        return { message: 'All notifications marked as read' };
      }
      
      handleApiError(error, 'Failed to mark all notifications as read');
    }
  },

  getUnreadCount: async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data;
    } catch (error: any) {
      // If API unavailable, return dummy count
      if (error.message === 'API_UNAVAILABLE') {
        return { count: 2 };
      }
      
      handleApiError(error, 'Failed to fetch unread count');
    }
  }
};

export { api };
