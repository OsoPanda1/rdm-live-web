import { RDMLayout } from "@/components/rdm/RDMLayout";
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { paymentsApi } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';
import { Heart, Star, Zap, Loader2, CheckCircle } from 'lucide-react';

const Apoya = () => {
  const [searchParams] = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [donationAmount, setDonationAmount] = useState('100');
  const [customAmount, setCustomAmount] = useState('');
  const [donationType, setDonationType] = useState<'app' | 'business'>('app');

  const success = searchParams.get('success') === 'true';
  const canceled = searchParams.get('canceled') === 'true';

  const predefinedAmounts = ['50', '100', '250', '500', '1000'];

  useEffect(() => {
    const token = localStorage.getItem('rdm_token') || sessionStorage.getItem('rdm_token');
    setIsAuthenticated(!!token);
    
    if (success) {
      toast({ title: '¡Gracias por tu apoyo! 🙏', description: 'Tu donación ha sido procesada correctamente.' });
    }
    if (canceled) {
      toast({ title: 'Donación cancelada', description: 'Puedes intentarlo de nuevo cuando quieras.', variant: 'destructive' });
    }
  }, [success, canceled, toast]);

  const handleDonate = async () => {
    const amount = customAmount || donationAmount;
    if (!amount || parseFloat(amount) < 10) {
      toast({ title: 'Monto mínimo', description: 'El monto mínimo de donación es de 10 MXN.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const response = await paymentsApi.createPayment({
        amount: parseFloat(amount),
        currency: 'MXN',
        message: 'Donación desde RDM Digital',
      }) as { data: { url: string } };
      window.location.href = response.data.url;
    } catch (error: unknown) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Error al procesar la donación.', variant: 'destructive' });
      setLoading(false);
    }
  };

  const businessUpgrade = searchParams.get('upgraded') === 'true';

  if (businessUpgrade) {
    return (
      <RDMLayout>
        <div className="min-h-screen bg-background">
          <div className="pt-28 pb-16 container mx-auto px-4">
            <Card className="max-w-md mx-auto text-center border-0 shadow-2xl">
              <CardHeader>
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-green-700">¡Felicidades!</CardTitle>
                <CardDescription>Tu negocio ahora es destacado en RDM Digital</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </RDMLayout>
    );
  }

  return (
    <RDMLayout>
      <div className="min-h-screen bg-background">
        <div className="pt-28 pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Apoya RDM Digital 🏔️</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Ayúdanos a seguir construyendo la mejor plataforma turística para Real del Monte.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
              {[
                { icon: Heart, title: 'Impacto Social', desc: 'Apoyas el turismo local y la economía de Real del Monte', color: 'text-primary' },
                { icon: Star, title: 'Plataforma Mejor', desc: 'Tu apoyo nos permite mejorar funcionalidades y contenido', color: 'text-primary' },
                { icon: Zap, title: 'Reconocimiento', desc: 'Aparece en nuestro muro de agradecimientos', color: 'text-primary' },
              ].map((item) => (
                <Card key={item.title} className="border-0 shadow-lg bg-card/80 backdrop-blur">
                  <CardContent className="pt-6 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <item.icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="max-w-lg mx-auto border-0 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Haz tu donación</CardTitle>
                <CardDescription className="text-center">Elige el monto que deseas donar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Tipo de apoyo</Label>
                  <RadioGroup value={donationType} onValueChange={(v) => setDonationType(v as 'app' | 'business')} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="app" id="app" />
                      <Label htmlFor="app" className="cursor-pointer">Para la app</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="business" id="business" />
                      <Label htmlFor="business" className="cursor-pointer">Para un negocio</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label>Monto (MXN)</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {predefinedAmounts.map((amt) => (
                      <Button
                        key={amt}
                        variant={donationAmount === amt && !customAmount ? 'default' : 'outline'}
                        onClick={() => { setDonationAmount(amt); setCustomAmount(''); }}
                      >
                        ${amt}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom-amount">O ingresa un monto personalizado</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="custom-amount" type="number" min="10" placeholder="Otro monto" className="pl-8"
                      value={customAmount}
                      onChange={(e) => { setCustomAmount(e.target.value); if (e.target.value) setDonationAmount(''); }}
                    />
                  </div>
                </div>

                {!isAuthenticated && (
                  <div className="bg-muted border border-border rounded-lg p-4 text-sm text-muted-foreground">
                    <strong>Nota:</strong> Para hacer una donación necesitas{' '}
                    <a href="/auth" className="underline font-semibold text-primary">iniciar sesión</a>
                  </div>
                )}

                <Button className="w-full h-12 text-lg" onClick={handleDonate} disabled={loading || !isAuthenticated}>
                  {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Heart className="mr-2 h-5 w-5" />}
                  Donar ${customAmount || donationAmount} MXN
                </Button>

                <p className="text-center text-sm text-muted-foreground">Pago seguro con Stripe.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RDMLayout>
  );
};

export default Apoya;
