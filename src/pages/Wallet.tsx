
import React, { useState, useEffect } from 'react';
import { ArrowDown, ArrowUp, CircleDollarSign, CreditCard, History, Plus, TrendingUp, Wallet as WalletIcon, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useToast } from '@/hooks/use-toast';
import { useKarma } from '@/hooks/useKarma';

const Wallet = () => {
  const { userStats, convertKarmaToCash } = useKarma();
  const [balance, setBalance] = useState(5.00);
  const [karmaPoints, setKarmaPoints] = useState(120);
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [karmaAmount, setKarmaAmount] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (userStats) {
      setBalance(userStats.cash_points / 100);
      setKarmaPoints(userStats.karma_points);
    }
  }, [userStats]);

  // Mock transaction data
  const transactions = [
    { id: 1, type: 'earned', amount: 25.00, description: 'Job: Garten aufräumen', date: '2024-01-15', status: 'completed' },
    { id: 2, type: 'spent', amount: -15.00, description: 'Job: Computer reparieren', date: '2024-01-14', status: 'completed' },
    { id: 3, type: 'earned', amount: 30.00, description: 'Job: Möbel aufbauen', date: '2024-01-13', status: 'completed' },
    { id: 4, type: 'earned', amount: 20.00, description: 'Job: Einkaufen', date: '2024-01-12', status: 'completed' },
    { id: 5, type: 'withdrawal', amount: -35.00, description: 'Auszahlung auf Bankkonto', date: '2024-01-11', status: 'pending' }
  ];

  const handleAddMoney = async () => {
    if (amount && parseFloat(amount) > 0) {
      try {
        const response = await fetch('http://localhost:4242/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: Math.round(parseFloat(amount) * 100) }),
        });
        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        }
      } catch {
        toast({
          title: "Fehler",
          description: "Zahlung fehlgeschlagen.",
          variant: "destructive",
        });
      }
      setAmount('');
      setIsAddMoneyOpen(false);
    }
  };

  const handleWithdraw = () => {
    if (amount && parseFloat(amount) > 0 && parseFloat(amount) <= balance) {
      setBalance(prev => prev - parseFloat(amount));
      toast({
        title: "Auszahlung beantragt",
        description: `${amount}€ werden in 1-3 Werktagen auf Ihr Konto überwiesen.`,
      });
      setAmount('');
      setIsWithdrawOpen(false);
    } else {
      toast({
        title: "Fehler",
        description: "Ungültiger Betrag oder unzureichendes Guthaben.",
        variant: "destructive"
      });
    }
  };

  const handleConvertKarma = async () => {
    if (karmaAmount && parseInt(karmaAmount) > 0) {
      const success = await convertKarmaToCash(parseInt(karmaAmount));
      if (success) {
        setKarmaAmount('');
        setIsConvertOpen(false);
      }
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned':
        return <ArrowDown className="w-4 h-4 text-green-500" />;
      case 'spent':
        return <ArrowUp className="w-4 h-4 text-blue-500" />;
      case 'withdrawal':
        return <ArrowUp className="w-4 h-4 text-red-500" />;
      default:
        return <CircleDollarSign className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earned':
        return 'text-green-500';
      case 'spent':
        return 'text-blue-500';
      case 'withdrawal':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Wallet</h1>
          <p className="text-gray-400">Verwalten Sie Ihr Guthaben und Ihre Transaktionen</p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-600 to-green-700 border-green-500 text-white animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Verfügbares Guthaben</p>
                  <p className="text-3xl font-bold">{balance.toFixed(2)}€</p>
                </div>
                <div className="bg-green-500 p-3 rounded-full">
                  <WalletIcon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-600 to-orange-700 border-orange-500 text-white animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Karma Punkte</p>
                  <p className="text-3xl font-bold">{karmaPoints}</p>
                </div>
                <div className="bg-orange-500 p-3 rounded-full">
                  <span className="text-xl">🔥</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500 text-white animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Diesen Monat verdient</p>
                  <p className="text-3xl font-bold">75.00€</p>
                </div>
                <div className="bg-blue-500 p-3 rounded-full">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Dialog open={isAddMoneyOpen} onOpenChange={setIsAddMoneyOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 transition-all duration-200 hover:scale-105">
                <Plus className="w-4 h-4 mr-2" />
                Geld hinzufügen
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Geld hinzufügen</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount" className="text-gray-300">Betrag (€)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setAmount('10')} variant="outline" size="sm" className="bg-gray-700 border-gray-600 text-white">10€</Button>
                  <Button onClick={() => setAmount('25')} variant="outline" size="sm" className="bg-gray-700 border-gray-600 text-white">25€</Button>
                  <Button onClick={() => setAmount('50')} variant="outline" size="sm" className="bg-gray-700 border-gray-600 text-white">50€</Button>
                  <Button onClick={() => setAmount('100')} variant="outline" size="sm" className="bg-gray-700 border-gray-600 text-white">100€</Button>
                </div>
                <Button onClick={handleAddMoney} className="w-full bg-green-600 hover:bg-green-700">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Mit PayPal bezahlen
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 transition-all duration-200 hover:scale-105">
                <ArrowUp className="w-4 h-4 mr-2" />
                Auszahlen
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Geld auszahlen</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="withdraw-amount" className="text-gray-300">Betrag (€)</Label>
                  <Input
                    id="withdraw-amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <p className="text-sm text-gray-400 mt-1">Verfügbar: {balance.toFixed(2)}€</p>
                </div>
                <Button onClick={handleWithdraw} className="w-full bg-blue-600 hover:bg-blue-700">
                  Auszahlung beantragen
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isConvertOpen} onOpenChange={setIsConvertOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 transition-all duration-200 hover:scale-105">
                <Coins className="w-4 h-4 mr-2" />
                Karma umwandeln
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Karma in Cash-Punkte</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="karma-amount" className="text-gray-300">Karma Punkte</Label>
                  <Input
                    id="karma-amount"
                    type="number"
                    placeholder="100"
                    value={karmaAmount}
                    onChange={(e) => setKarmaAmount(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <p className="text-sm text-gray-400 mt-1">Verfügbar: {karmaPoints}</p>
                </div>
                <Button onClick={handleConvertKarma} className="w-full bg-orange-600 hover:bg-orange-700">
                  Umwandeln
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Transaction History */}
        <Card className="bg-gray-800 border-gray-700 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <History className="w-5 h-5 mr-2" />
              Transaktionsverlauf
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.map((transaction, index) => (
                <div 
                  key={transaction.id} 
                  className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all duration-200 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center space-x-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <p className="text-white font-medium">{transaction.description}</p>
                      <p className="text-gray-400 text-sm">{transaction.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${getTransactionColor(transaction.type)}`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)}€
                    </p>
                    <Badge 
                      variant={transaction.status === 'completed' ? 'default' : 'outline'}
                      className={transaction.status === 'completed' ? 'bg-green-600' : 'border-yellow-600 text-yellow-400'}
                    >
                      {transaction.status === 'completed' ? 'Abgeschlossen' : 'Ausstehend'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Wallet;
