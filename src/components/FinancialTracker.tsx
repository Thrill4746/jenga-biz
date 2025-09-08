import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DollarSign, 
  TrendingDown, 
  Plus, 
  Calendar,
  Camera,
  Upload,
  Lightbulb
} from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: Date;
}

interface FinancialTrackerProps {
  language?: string;
  currency?: string;
  currencySymbol?: string;
  strategyId?: string;
}

const FinancialTracker = ({ 
  language = 'en', 
  currency = 'KES', 
  currencySymbol = 'KSh',
  strategyId
}: FinancialTrackerProps) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [newTransaction, setNewTransaction] = useState({
    type: 'income' as 'income' | 'expense',
    amount: '',
    description: '',
    category: ''
  });
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Load transactions from Supabase
  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user]);

  const loadTransactions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false });

      if (error) throw error;

      const formattedTransactions = data?.map(t => ({
        id: t.id,
        type: t.transaction_type as 'income' | 'expense',
        amount: Number(t.amount),
        description: t.description,
        category: t.category,
        date: new Date(t.transaction_date)
      })) || [];

      setTransactions(formattedTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpenses;

  const addTransaction = () => {
    if (!newTransaction.amount || !newTransaction.category) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const transaction: Transaction = {
      id: Date.now().toString(),
      type: newTransaction.type,
      amount: parseFloat(newTransaction.amount),
      description: newTransaction.description || `${newTransaction.type} - ${format(new Date(), 'MMM dd')}`,
      category: newTransaction.category,
      date: new Date()
    };

    setTransactions([transaction, ...transactions]);
    setNewTransaction({
      type: 'income',
      amount: '',
      description: '',
      category: ''
    });

    toast({
      title: "Transaction Added",
      description: "Your transaction has been recorded"
    });
  };

  // Process image with OCR
  const processReceiptImage = async (file: File) => {
    setIsProcessingImage(true);
    try {
      const worker = await createWorker('eng');
      
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();
      
      console.log('OCR Result:', text);
      
      // Extract amount using regex
      const amountRegex = /(?:total|amount|sum|cost|price|pay|$|KSh|USD|EUR|GBP)\s*:?\s*([0-9,]+\.?[0-9]*)/gi;
      const matches = text.match(amountRegex);
      
      if (matches && matches.length > 0) {
        const extractedAmount = matches[0].replace(/[^0-9.]/g, '');
        
        if (extractedAmount && !isNaN(parseFloat(extractedAmount))) {
          setNewTransaction({
            ...newTransaction,
            amount: extractedAmount,
            description: 'Receipt scan - ' + new Date().toLocaleDateString()
          });
          
          toast({
            title: "Amount detected!",
            description: `Found amount: ${currencySymbol}${extractedAmount}. Please verify and add category.`,
          });
        } else {
          throw new Error('Could not extract amount');
        }
      } else {
        toast({
          title: "No amount found",
          description: "Could not detect amount from image. Please enter manually.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('OCR Error:', error);
      toast({
        title: "Processing failed",
        description: "Failed to process image. Please try again or enter manually.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingImage(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processReceiptImage(file);
    } else {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive"
      });
    }
  };

  // Trigger camera capture
  const triggerCamera = () => {
    cameraInputRef.current?.click();
  };

  // Trigger file upload
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <DollarSign className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">Financial Tracker</h1>
          </div>
          <p className="text-lg text-gray-600">Track your daily revenue and expenses with ease</p>
          
          {/* Currency Selector */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-sm font-medium">Currency</span>
            <Select value={currency}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="KES">🇰🇪 KSh KES</SelectItem>
                <SelectItem value="USD">🇺🇸 $ USD</SelectItem>
                <SelectItem value="EUR">🇪🇺 € EUR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* How it works info */}
        <Alert className="mb-6 bg-blue-50 border-blue-200 max-w-2xl mx-auto">
          <Lightbulb className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>How it works:</strong> Record revenue and expenses. Take a photo of receipt or upload image/screenshot from your storage, or enter details manually.
          </AlertDescription>
        </Alert>

        {/* Date Display */}
        <div className="flex items-center justify-center gap-2 mb-8 p-3 bg-white rounded-lg border shadow-sm max-w-md mx-auto">
          <Calendar className="w-4 h-4 text-gray-600" />
          <span className="font-medium">{format(new Date(), 'MMMM do, yyyy')}</span>
        </div>

        <div className="space-y-6">
          {/* Revenue Section */}
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Plus className="w-5 h-5" />
                Revenue
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Amount</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newTransaction.type === 'income' ? newTransaction.amount : ''}
                  onChange={(e) => setNewTransaction({
                    ...newTransaction,
                    type: 'income',
                    amount: e.target.value
                  })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <Select
                  value={newTransaction.type === 'income' ? newTransaction.category : 'Cash'}
                  onValueChange={(value) => setNewTransaction({
                    ...newTransaction,
                    type: 'income',
                    category: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Cash" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                    <SelectItem value="Card Payment">Card Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setNewTransaction({ ...newTransaction, type: 'income' });
                    addTransaction();
                  }}
                >
                  Record New Payment
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={triggerCamera}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <Camera className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={triggerFileUpload}
                  className="border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Expenses Section */}
          <Card className="bg-red-50 border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <TrendingDown className="w-5 h-5" />
                Expenses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Amount</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newTransaction.type === 'expense' ? newTransaction.amount : ''}
                  onChange={(e) => setNewTransaction({
                    ...newTransaction,
                    type: 'expense',
                    amount: e.target.value
                  })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <Select
                  value={newTransaction.type === 'expense' ? newTransaction.category : 'Operational'}
                  onValueChange={(value) => setNewTransaction({
                    ...newTransaction,
                    type: 'expense',
                    category: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Operational" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Operational">Operational</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Equipment">Equipment</SelectItem>
                    <SelectItem value="Supplies">Supplies</SelectItem>
                    <SelectItem value="Transportation">Transportation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={() => {
                    setNewTransaction({ ...newTransaction, type: 'expense' });
                    addTransaction();
                  }}
                >
                  Record New Expense
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={triggerCamera}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <Camera className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={triggerFileUpload}
                  className="border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-medium text-green-700 mb-2">Total Revenue</h3>
                <p className="text-3xl font-bold text-green-800">{currencySymbol} {totalIncome.toFixed(2)}</p>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-medium text-red-700 mb-2">Total Expenses</h3>
                <p className="text-3xl font-bold text-red-800">{currencySymbol} {totalExpenses.toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Financial Health */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-medium text-blue-700 mb-2">Financial Health</h3>
              <p className="text-3xl font-bold text-blue-800">
                {netProfit >= 0 ? 'Profitable' : 'Loss'}
              </p>
              <p className="text-sm text-blue-600 mt-2">
                Net: {currencySymbol} {netProfit.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Hidden file inputs */}
        <input
          type="file"
          ref={cameraInputRef}
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileUpload}
        />
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Processing overlay */}
        {isProcessingImage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Processing image...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialTracker;