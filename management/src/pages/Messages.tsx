import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Search, 
  Mail, 
  MailOpen, 
  Calendar,
  User,
  Trash2,
  CheckCircle,
  Filter
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface Message {
  _id: string;
  name: string;
  email: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const Messages: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    filterMessages();
  }, [messages, searchTerm, selectedFilter]);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const data = await api('/messages');
      setMessages(data);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch messages",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterMessages = () => {
    let filtered = messages.filter(message => {
      const name = message.name || '';
      const email = message.email || '';
      const content = message.message || '';
      
      const matchesSearch = 
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        content.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = 
        selectedFilter === 'all' ||
        (selectedFilter === 'read' && message.isRead) ||
        (selectedFilter === 'unread' && !message.isRead);
      
      return matchesSearch && matchesFilter;
    });
    
    // Sort: Unread first, then newest
    filtered.sort((a, b) => {
      if (a.isRead !== b.isRead) {
        return a.isRead ? 1 : -1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    setFilteredMessages(filtered);
  };

  const markAsRead = async (messageId: string, currentStatus: boolean) => {
    try {
      await api(`/messages/${messageId}`, {
        method: 'PUT',
        body: { isRead: !currentStatus }
      });

      fetchMessages();
      toast({
        title: "Status Updated",
        description: `Message marked as ${!currentStatus ? 'read' : 'unread'}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to permanently delete this message?')) return;

    try {
      await api(`/messages/${messageId}`, {
        method: 'DELETE'
      });

      fetchMessages();
      toast({
        title: "Success",
        description: "Message deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete message",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const unreadCount = messages.filter(m => !m.isRead).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Inbox</h1>
          <p className="text-gray-500 font-medium">Review and respond to customer inquiries</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="px-3 py-1 font-bold border-gray-200">
            {messages.length} Total
          </Badge>
          {unreadCount > 0 && (
            <Badge className="bg-blue-500 hover:bg-blue-600 px-3 py-1 font-bold">
              {unreadCount} Unread
            </Badge>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="border-none shadow-sm bg-white/80 backdrop-blur-md">
        <CardHeader className="pb-3 px-6 pt-6">
          <CardTitle className="flex items-center space-x-2 text-lg font-bold">
            <Filter className="w-5 h-5 text-yellow-600" />
            <span>Search & Filter</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
               <Input
                 placeholder="Search by name, email or message content..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="pl-10 h-11 bg-white border-gray-200"
               />
            </div>
            <div>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="w-full h-11 px-4 py-2 border border-gray-200 rounded-md font-medium text-gray-600 bg-white focus:ring-2 focus:ring-yellow-500 outline-none transition-all"
              >
                <option value="all">All Messages</option>
                <option value="unread">Unread Only</option>
                <option value="read">Read Only</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <div className="space-y-4">
        {filteredMessages.map((message) => (
          <Card 
            key={message._id} 
            className={`border-none transition-all duration-300 group ${
              !message.isRead 
                ? 'shadow-lg shadow-blue-500/5 ring-1 ring-blue-100 bg-gradient-to-r from-blue-50/50 to-white' 
                : 'shadow-sm hover:shadow-md bg-white'
            }`}
          >
            <CardHeader className="p-6 pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-md transform group-hover:scale-110 transition-transform ${
                    !message.isRead ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-gray-400 to-gray-500'
                  }`}>
                    {(message.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      {message.name}
                      {!message.isRead && (
                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                      )}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                      <div className="flex items-center font-medium">
                        <Mail className="w-3.5 h-3.5 mr-1.5 text-yellow-600" />
                        {message.email}
                      </div>
                      <div className="flex items-center font-medium">
                        <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                        {formatDate(message.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:self-start">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsRead(message._id, message.isRead)}
                    className={`font-bold transition-all px-4 ${
                      !message.isRead ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {message.isRead ? (
                      <Mail className="w-4 h-4 mr-2" />
                    ) : (
                      <MailOpen className="w-4 h-4 mr-2" />
                    )}
                    {message.isRead ? 'Mark Unread' : 'Mark as Read'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMessage(message._id)}
                    className="text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-2">
              <div className={`p-4 rounded-2xl border transition-colors ${
                !message.isRead ? 'bg-white border-blue-100' : 'bg-gray-50 border-gray-100'
              }`}>
                <p className="text-gray-700 leading-relaxed font-medium whitespace-pre-wrap">{message.message}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMessages.length === 0 && (
        <Card className="border-none shadow-none bg-transparent">
          <CardContent className="flex flex-col items-center justify-center h-80">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <MessageSquare className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-400 mb-1">Nothing to see here</h3>
            <p className="text-gray-400 font-medium">
              {messages.length === 0 
                ? "No customer inquiries have arrived yet."
                : "No messages match your current filter."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Messages;
