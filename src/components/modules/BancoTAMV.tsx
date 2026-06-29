/**
 * Banco TAMV - Sistema Financiero
 * Triple Federado: Conceptual | Legal | Técnico
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft,
  TrendingUp,
  Shield,
  Coins,
  History,
  PiggyBank,
  Percent,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Transaction {
  id: string;
  type: 'credit' | 'debit' | 'transfer';
  amount: number;
  description: string;
  timestamp: string;
  status: 'completed' | 'pending';
  federationHash: string;
}

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    type: 'credit',
    amount: 500,
    description: 'Venta en Marketplace',
    timestamp: new Date().toISOString(),
    status: 'completed',
    federationHash: 'TF-ABC123'
  },
  {
    id: '2',
    type: 'debit',
    amount: 100,
    description: 'Compra de curso',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    status: 'completed',
    federationHash: 'TF-DEF456'
  },
  {
    id: '3',
    type: 'transfer',
    amount: 250,
    description: 'Transferencia a @creator123',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    status: 'completed',
    federationHash: 'TF-GHI789'
  }
];

const BancoTAMV = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [balance] = useState(15750.50);
  const [accountNumber] = useState(() => 'TAMV-2024-' + crypto.randomUUID().slice(0, 8).toUpperCase());

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit': return <ArrowDownLeft className="w-4 h-4 text-green-500" />;
      case 'debit': return <ArrowUpRight className="w-4 h-4 text-red-500" />;
      case 'transfer': return <ChevronRight className="w-4 h-4 text-blue-500" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
            <PiggyBank className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Banco TAMV</h1>
            <p className="text-muted-foreground">Sistema financiero del metaverso · Triple Federado</p>
          </div>
        </div>
      </motion.div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Balance Total</p>
                <motion.p 
                  className="text-4xl font-bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })} TAU
                </motion.p>
                <p className="text-sm text-muted-foreground mt-1">
                  ≈ ${(balance * 0.85).toLocaleString('es-MX', { minimumFractionDigits: 2 })} USD
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <span className="font-mono">{accountNumber}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-500">
                  <Shield className="w-4 h-4" />
                  <span>Triple Federado Activo</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Enviar
                </Button>
                <Button variant="outline" className="border-emerald-500/30">
                  <ArrowDownLeft className="w-4 h-4 mr-2" />
                  Recibir
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: TrendingUp, label: 'Ingresos del mes', value: '+2,450 TAU', color: 'text-green-500' },
          { icon: ArrowUpRight, label: 'Gastos del mes', value: '-890 TAU', color: 'text-red-500' },
          { icon: Percent, label: 'Interés ganado', value: '+45.5 TAU', color: 'text-blue-500' },
          { icon: Coins, label: 'Recompensas', value: '+120 TAU', color: 'text-yellow-500' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
          >
            <Card className="bg-card/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  <div>
                    <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="transactions">Transacciones</TabsTrigger>
          <TabsTrigger value="send">Enviar</TabsTrigger>
          <TabsTrigger value="savings">Ahorro</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Acciones rápidas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Acciones rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: ArrowUpRight, label: 'Enviar TAU', color: 'bg-blue-500/10 text-blue-500' },
                  { icon: ArrowDownLeft, label: 'Recibir TAU', color: 'bg-green-500/10 text-green-500' },
                  { icon: Coins, label: 'Intercambiar', color: 'bg-purple-500/10 text-purple-500' },
                  { icon: PiggyBank, label: 'Ahorrar', color: 'bg-yellow-500/10 text-yellow-500' }
                ].map((action) => (
                  <Button
                    key={action.label}
                    variant="outline"
                    className={`h-auto py-4 flex flex-col gap-2 ${action.color}`}
                  >
                    <action.icon className="w-6 h-6" />
                    <span>{action.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Transacciones recientes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Transacciones recientes</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('transactions')}>
                Ver todas
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_TRANSACTIONS.slice(0, 3).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
                        {getTransactionIcon(tx.type)}
                      </div>
                      <div>
                        <p className="font-medium">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${tx.type === 'credit' ? 'text-green-500' : tx.type === 'debit' ? 'text-red-500' : ''}`}>
                        {tx.type === 'credit' ? '+' : '-'}{tx.amount} TAU
                      </p>
                      <Badge variant="outline" className="text-[10px]">
                        {tx.federationHash}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de transacciones</CardTitle>
              <CardDescription>Todas tus transacciones con Triple Federado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_TRANSACTIONS.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        {getTransactionIcon(tx.type)}
                      </div>
                      <div>
                        <p className="font-medium">{tx.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{new Date(tx.timestamp).toLocaleString()}</span>
                          <Badge variant={tx.status === 'completed' ? 'default' : 'secondary'}>
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${tx.type === 'credit' ? 'text-green-500' : tx.type === 'debit' ? 'text-red-500' : ''}`}>
                        {tx.type === 'credit' ? '+' : '-'}{tx.amount.toLocaleString()} TAU
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Shield className="w-3 h-3" />
                        <span className="font-mono">{tx.federationHash}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="send" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enviar TAU</CardTitle>
              <CardDescription>Transferencia instantánea con Triple Federado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Destinatario</Label>
                <Input placeholder="@username o dirección TAMV" />
              </div>
              <div className="space-y-2">
                <Label>Cantidad</Label>
                <div className="relative">
                  <Input type="number" placeholder="0.00" className="pr-16" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">TAU</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Concepto (opcional)</Label>
                <Input placeholder="Descripción de la transferencia" />
              </div>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Enviar TAU
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="savings" className="space-y-4">
          <Card className="p-12 text-center">
            <PiggyBank className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-bold mb-2">Programa de Ahorro TAMV</h3>
            <p className="text-muted-foreground mb-4">
              Gana hasta 12% APY en tus TAU con nuestro programa de ahorro
            </p>
            <Button>Activar Ahorro</Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BancoTAMV;
