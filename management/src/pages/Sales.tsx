
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  Smartphone, 
  Calendar,
  Download,
  Filter,
  Plus,
  User,
  Package
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Sale {
  _id: string;
  productName: string;
  amount: number;
  paymentMethod: 'cash' | 'mpesa';
  buyerName: string;
  sellerName: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  createdAt: string;
  mpesaTransactionId?: string;
}

const Sales: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [showAddSale, setShowAddSale] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSales();
  }, []);

  useEffect(() => {
    filterSales();
  }, [sales, searchTerm, selectedPaymentMethod, dateRange]);

  const fetchSales = async () => {
    try {
      const data = await api('/payments/all');
      setSales(data.data || []);
    } catch (error) {
      console.error('Error fetching sales:', error);
      toast({
        title: "Error",
        description: "Failed to fetch sales data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSale = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const saleData = {
      productName: formData.get('productName'),
      amount: Number(formData.get('amount')),
      buyerName: formData.get('buyerName'),
      paymentMethod: 'cash'
    };

    try {
      await api('/payments/cash-sale', {
        method: 'POST',
        body: JSON.stringify(saleData)
      });
      toast({
        title: "Success",
        description: "Cash sale recorded successfully",
      });
      setShowAddSale(false);
      fetchSales();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filterSales = () => {
    let filtered = sales.filter(sale => {
      const matchesSearch = 
        sale.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.sellerName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPaymentMethod = 
        selectedPaymentMethod === 'all' || sale.paymentMethod === selectedPaymentMethod;
      
      const saleDate = new Date(sale.createdAt);
      const matchesDateRange = 
        (!dateRange.start || saleDate >= new Date(dateRange.start)) &&
        (!dateRange.end || saleDate <= new Date(dateRange.end));
      
      return matchesSearch && matchesPaymentMethod && matchesDateRange;
    });
    
    setFilteredSales(filtered);
  };

  const exportData = () => {
    const csvContent = [
      ['Date', 'Product', 'Amount', 'Payment Method', 'Buyer', 'Seller', 'Transaction ID'],
      ...filteredSales.map(sale => [
        new Date(sale.createdAt).toLocaleDateString(),
        sale.productName,
        sale.amount,
        sale.paymentMethod,
        sale.buyerName,
        sale.sellerName,
        sale.mpesaTransactionId || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const calculateStats = () => {
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.amount, 0);
    const cashSales = filteredSales.filter(sale => sale.paymentMethod === 'cash');
    const mpesaSales = filteredSales.filter(sale => sale.paymentMethod === 'mpesa');
    const avgSaleAmount = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;

    return {
      totalRevenue,
      totalSales: filteredSales.length,
      cashSales: cashSales.length,
      mpesaSales: mpesaSales.length,
      avgSaleAmount
    };
  };

  const stats = calculateStats();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sales Tracking</h1>
          <p className="text-gray-600">Monitor sales performance and revenue</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <Button
            onClick={exportData}
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Dialog open={showAddSale} onOpenChange={setShowAddSale}>
            <DialogTrigger asChild>
              <Button className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold">
                <Plus className="w-4 h-4 mr-2" />
                Record Cash Sale
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record New Cash Sale</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateSale} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Product Name</Label>
                  <Input name="productName" placeholder="e.g. Gold Necklace" required />
                </div>
                <div className="space-y-2">
                  <Label>Amount (USD)</Label>
                  <Input name="amount" type="number" placeholder="Enter sale amount" required />
                </div>
                <div className="space-y-2">
                  <Label>Buyer Name</Label>
                  <Input name="buyerName" placeholder="Customer name" required />
                </div>
                <Button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-700" disabled={isSubmitting}>
                  {isSubmitting ? 'Recording...' : 'Complete Sale'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              KES {stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              From {stats.totalSales} sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Sale</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              KES {stats.avgSaleAmount.toFixed(0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Per transaction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Sales</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.cashSales}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Cash transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">M-Pesa Sales</CardTitle>
            <Smartphone className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.mpesaSales}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Mobile transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filter Sales</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Product, buyer, or seller..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <select
                id="paymentMethod"
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Methods</option>
                <option value="cash">Cash</option>
                <option value="mpesa">M-Pesa</option>
              </select>
            </div>
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({...prev, start: e.target.value}))}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({...prev, end: e.target.value}))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales List */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Transactions</CardTitle>
          <CardDescription>
            Showing {filteredSales.length} of {sales.length} transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSales.map((sale) => (
              <div
                key={sale._id}
                className="flex flex-col md:flex-row md:items-center md:justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold">{sale.productName}</h3>
                    <Badge
                      variant={sale.paymentMethod === 'cash' ? 'default' : 'secondary'}
                      className={sale.paymentMethod === 'mpesa' ? 'bg-orange-100 text-orange-800' : ''}
                    >
                      {sale.paymentMethod === 'cash' ? (
                        <CreditCard className="w-3 h-3 mr-1" />
                      ) : (
                        <Smartphone className="w-3 h-3 mr-1" />
                      )}
                      {sale.paymentMethod.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Buyer:</span> {sale.buyerName}
                    </div>
                    <div>
                      <span className="font-medium">Seller:</span> {sale.sellerName}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(sale.createdAt)}</span>
                    </div>
                  </div>
                  {sale.mpesaTransactionId && (
                    <div className="text-xs text-gray-500 mt-1">
                      Transaction ID: {sale.mpesaTransactionId}
                    </div>
                  )}
                </div>
                <div className="text-right mt-3 md:mt-0">
                  <div className="text-2xl font-bold text-green-600">
                    KES {sale.amount.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredSales.length === 0 && (
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Sales Found</h3>
              <p className="text-gray-500">
                {sales.length === 0 
                  ? "No sales have been recorded yet"
                  : "Try adjusting your search or filter criteria"
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Sales;
