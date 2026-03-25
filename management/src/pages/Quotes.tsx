import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Search, 
  Calendar,
  User,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  ChevronRight,
  Phone,
  Layout
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface Quote {
  _id: string;
  name: string;
  email: string;
  phone: string;
  productName: string;
  message?: string;
  status: 'pending' | 'responded' | 'closed';
  createdAt: string;
}

const Quotes: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchQuotes();
  }, []);

  useEffect(() => {
    filterQuotes();
  }, [quotes, searchTerm, selectedStatus]);

  const fetchQuotes = async () => {
    try {
      setIsLoading(true);
      const data = await api('/quotes');
      setQuotes(data);
    } catch (error: any) {
      console.error('Error fetching quotes:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch quotes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterQuotes = () => {
    let filtered = quotes.filter(quote => {
      const matchesSearch = 
        quote.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.productName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = selectedStatus === 'all' || quote.status === selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
    
    // Sort: Pending first, then newest
    filtered.sort((a, b) => {
      if (a.status !== b.status) {
        if (a.status === 'pending') return -1;
        if (b.status === 'pending') return 1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    setFilteredQuotes(filtered);
  };

  const updateQuoteStatus = async (quoteId: string, status: string) => {
    try {
      await api(`/quotes/${quoteId}`, {
        method: 'PUT',
        body: { status }
      });
      fetchQuotes();
      toast({
        title: "Success",
        description: `Quote marked as ${status}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const deleteQuote = async (quoteId: string) => {
    if (!confirm('Are you sure you want to permanently delete this quote request?')) return;

    try {
      await api(`/quotes/${quoteId}`, {
        method: 'DELETE'
      });
      fetchQuotes();
      toast({
        title: "Success",
        description: "Quote request deleted",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete quote",
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-orange-500 hover:bg-orange-600 border-none font-bold uppercase text-[10px] tracking-widest"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'responded':
        return <Badge className="bg-blue-500 hover:bg-blue-600 border-none font-bold uppercase text-[10px] tracking-widest"><CheckCircle className="w-3 h-3 mr-1" /> Responded</Badge>;
      case 'closed':
        return <Badge className="bg-gray-400 hover:bg-gray-500 border-none font-bold uppercase text-[10px] tracking-widest"><XCircle className="w-3 h-3 mr-1" /> Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Quote Inquiries</h1>
          <p className="text-gray-500 font-medium">Manage and respond to price requests from buyers</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="px-3 py-1 font-bold">
            {quotes.length} Total
          </Badge>
          {quotes.filter(q => q.status === 'pending').length > 0 && (
            <Badge className="bg-orange-500 px-3 py-1 font-bold">
              {quotes.filter(q => q.status === 'pending').length} Action Required
            </Badge>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="border-none shadow-sm bg-white/80 backdrop-blur-md">
        <CardHeader className="pb-3 px-6 pt-6">
          <CardTitle className="flex items-center space-x-2 text-lg font-bold">
            <Filter className="w-5 h-5 text-yellow-600" />
            <span>Search & Pipeline</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
               <Input
                 placeholder="Search by buyer name, email or product interest..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="pl-10 h-11 bg-white border-gray-200"
               />
            </div>
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full h-11 px-4 py-2 border border-gray-200 rounded-md font-medium text-gray-600 bg-white focus:ring-2 focus:ring-yellow-500 outline-none"
              >
                <option value="all">Every Stage</option>
                <option value="pending">Pending Requests</option>
                <option value="responded">Already Responded</option>
                <option value="closed">Closed Cases</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredQuotes.map((quote) => (
          <Card key={quote._id} className={`border-none transition-all duration-300 group overflow-hidden ${
            quote.status === 'pending' 
              ? 'shadow-lg shadow-orange-500/5 ring-1 ring-orange-100' 
              : 'shadow-sm hover:shadow-md'
          }`}>
            <div className={`h-1 w-full ${
              quote.status === 'pending' ? 'bg-orange-500' : 
              quote.status === 'responded' ? 'bg-blue-500' : 'bg-gray-300'
            }`} />
            <CardHeader className="p-6 pb-2">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-xl font-bold text-gray-900 leading-none">
                        {quote.name}
                      </CardTitle>
                      {getStatusBadge(quote.status)}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-2 font-medium">
                      <div className="flex items-center text-indigo-600">
                        <Layout className="w-4 h-4 mr-1.5" />
                        {quote.productName}
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                        {quote.phone}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                        {formatDate(quote.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 lg:self-center bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                   <select
                    value={quote.status}
                    onChange={(e) => updateQuoteStatus(quote._id, e.target.value)}
                    className="bg-transparent text-xs font-bold uppercase tracking-wider text-gray-600 px-3 outline-none cursor-pointer h-8"
                  >
                    <option value="pending">Pending</option>
                    <option value="responded">Mark Responded</option>
                    <option value="closed">Close Request</option>
                  </select>
                  <div className="w-px h-4 bg-gray-200" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteQuote(quote._id)}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-2">
              <div className="flex items-start gap-3 bg-white border border-gray-100 rounded-2xl p-4 shadow-inner">
                <ChevronRight className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Inquiry Message</p>
                  <p className="text-gray-700 font-medium leading-relaxed italic">
                    "{quote.message || 'The buyer is requesting an official price quote for this item.'}"
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredQuotes.length === 0 && (
        <Card className="border-none shadow-none bg-transparent pt-10">
          <CardContent className="flex flex-col items-center justify-center h-80">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <FileText className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-400 mb-1">No requests match</h3>
            <p className="text-gray-400 font-medium">Try checking under a different status or clear your search.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Quotes;
