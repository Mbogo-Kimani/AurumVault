import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Search, Trash2, CheckCircle, Mail, Calendar } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';

interface Buyer {
  _id: string;
  name: string;
  email: string;
  role: string;
  gender?: string;
  isEmailVerified: boolean;
  createdAt: string;
}

const Buyers: React.FC = () => {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [filteredBuyers, setFilteredBuyers] = useState<Buyer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBuyers();
  }, []);

  useEffect(() => {
    filterBuyers();
  }, [buyers, searchTerm]);

  const fetchBuyers = async () => {
    try {
      const data = await api('/auth/buyers');
      setBuyers(data.buyers || []);
    } catch (error) {
      console.error('Error fetching buyers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch buyers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterBuyers = () => {
    const filtered = buyers.filter(buyer =>
      (buyer.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (buyer.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBuyers(filtered);
  };

  const deleteBuyer = async (buyerId: string) => {
    if (!confirm('Are you sure you want to delete this buyer account?')) return;

    try {
      await api(`/auth/buyers/${buyerId}`, {
        method: 'DELETE'
      });
      fetchBuyers();
      toast({
        title: "Success",
        description: "Buyer account deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete buyer account",
        variant: "destructive",
      });
    }
  };

  const verifyBuyer = async (buyerId: string) => {
    try {
      await api(`/auth/verify-user/${buyerId}`, {
        method: 'PUT'
      });
      fetchBuyers();
      toast({
        title: "Success",
        description: "Buyer email verified successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify buyer email",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 md:px-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Buyer Management</h1>
          <p className="text-gray-600">Manage registered customers and their accounts</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="text-sm font-semibold">
            Total Buyers: {buyers.length}
          </Badge>
          <Badge variant="default" className="text-sm bg-green-500 font-semibold shadow-sm">
            Verified: {buyers.filter(b => b.isEmailVerified).length}
          </Badge>
        </div>
      </div>

      {/* Search */}
      <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Search className="w-5 h-5 text-yellow-600" />
            <span>Search Buyers</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md bg-white border-gray-200"
          />
        </CardContent>
      </Card>

      {/* Buyers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBuyers.map((buyer) => (
          <Card key={buyer._id} className="hover:shadow-xl transition-all duration-300 border-none shadow-md group">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <span className="text-black font-bold text-lg">
                      {(buyer.name || '?').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold group-hover:text-yellow-600 transition-colors">{buyer.name}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      {buyer.isEmailVerified ? (
                        <Badge variant="default" className="bg-green-500 text-[10px] h-5 px-1.5 uppercase tracking-wider">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5 uppercase tracking-wider">
                          Unverified
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                    <Mail className="w-4 h-4 text-yellow-600" />
                    <span className="truncate font-medium">{buyer.email}</span>
                  </div>
                  
                  {buyer.gender && (
                    <div className="flex items-center justify-between text-sm px-2">
                      <span className="text-gray-500 font-medium">Gender:</span>
                      <Badge variant="outline" className="capitalize text-xs font-bold border-yellow-200 text-yellow-700 bg-yellow-50">
                        {buyer.gender}
                      </Badge>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-400 px-2 italic">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {formatDate(buyer.createdAt)}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  {!buyer.isEmailVerified && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => verifyBuyer(buyer._id)}
                      className="flex-1 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 font-bold"
                    >
                      <CheckCircle className="w-4 h-4 mr-1.5" />
                      Verify
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteBuyer(buyer._id)}
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 font-bold"
                  >
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBuyers.length === 0 && (
        <Card className="border-dashed border-2 border-gray-200 bg-transparent">
          <CardContent className="flex flex-col items-center justify-center h-64">
            <Users className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">No Buyers Found</h3>
            <p className="text-gray-400 text-center max-w-xs">
              {buyers.length === 0 
                ? "No buyers have registered yet. Once they do, they will appear here."
                : "We couldn't find any buyers matching your search criteria."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Buyers;
