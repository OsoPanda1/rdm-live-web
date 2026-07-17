import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import Header from "@/components/Header";
import MatrixEffect from "@/components/TAMVTrixEffect";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Facebook, Github, Instagram, Twitter } from "lucide-react";
import { useRDMAuth } from "@/contexts/RDMAuthContext";

const formSchema = z.object({
  username: z.string().min(3, {
    message: "El usuario debe tener al menos 3 caracteres.",
  }),
  email: z.string().email({
    message: "Por favor ingresa un correo válido.",
  }),
  password: z.string().min(8, {
    message: "La contraseña debe tener al menos 8 caracteres.",
  }),
  confirmPassword: z.string().min(8, {
    message: "Por favor confirma tu contraseña.",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});

const Register = () => {
  const navigate = useNavigate();
  const { signUpEmail } = useRDMAuth();
  const [loading, setLoading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    const { error } = await signUpEmail(values.email, values.password, values.username);
    setLoading(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Registro exitoso! Revisa tu correo para confirmar.");
    setTimeout(() => navigate("/"), 2000);
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90 relative overflow-hidden">
      {/* TAMVtrix Effect Background */}
      <MatrixEffect
  className="matrix-canvas"
  baseColor="#3bf5ff"
  minFontSize={10}
  maxFontSize={40}
  speed={1}
  density={0.93}
  words={["TAMV", "ONLINE", "TAMVONLINE", "GENESIS", "DIGYTAMV"]}
/>


      <Header />

      <motion.main 
        className="flex-1 container max-w-md mx-auto px-4 py-8 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="bg-black/40 backdrop-blur-md border border-blue-500/20 rounded-lg p-6 shadow-xl">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          
          <h1 className="text-2xl font-bold text-center mb-6 text-gradient bg-gradient-crystal animate-text-shimmer">
            Registro de Usuario
          </h1>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-300">Usuario</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ingresa tu nombre de usuario" 
                        className="bg-black/30 border-blue-500/30 focus:border-blue-400"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-300">Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="tu@email.com" 
                        className="bg-black/30 border-blue-500/30 focus:border-blue-400"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-300">Contraseña</FormLabel>
                    <FormControl>
                      <Input 
                        type="password"
                        placeholder="********" 
                        className="bg-black/30 border-blue-500/30 focus:border-blue-400"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-300">Confirmar Contraseña</FormLabel>
                    <FormControl>
                      <Input 
                        type="password"
                        placeholder="********" 
                        className="bg-black/30 border-blue-500/30 focus:border-blue-400"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-crystal hover:bg-gradient-quantum transition-all duration-300"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Registrarse
              </Button>
            </form>
          </Form>
          
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-blue-500/30"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  O regístrate con
                </span>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-4 gap-2">
              <Button variant="outline" size="icon" className="border-blue-500/30 hover:bg-blue-500/10">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="border-blue-500/30 hover:bg-blue-500/10">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="border-blue-500/30 hover:bg-blue-500/10">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="border-blue-500/30 hover:bg-blue-500/10">
                <Github className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <p className="text-center text-sm text-muted-foreground mt-6">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 hover:underline">
              Inicia sesión
            </Link>
          </p>
          <p className="text-center text-[10px] text-muted-foreground/50 mt-4 px-4">
            Al registrarte aceptas nuestro{" "}
            <Link to="/reglamento" className="text-blue-400 hover:underline">Reglamento de la Comunidad</Link>
            {" y "}
            <a href="/PRIVACY.md" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">Política de Privacidad</a>.
          </p>
        </div>
      </motion.main>
    </div>
  );
};

export default Register;
