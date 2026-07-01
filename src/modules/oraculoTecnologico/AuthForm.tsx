
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import SocialLinks from "@/modules/constelacionInteractiva/SocialLinks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { logger } from "@/lib/logger";

/**
 * Oráculo Tecnológico: Panel de Control - Centro de Administración
 * 
 * Componente para la autenticación de usuarios en TAMV Online Network.
 * Permite el inicio de sesión con email y contraseña o mediante redes sociales.
 */
const loginSchema = z.object({
  email: z.string().email({
    message: "Por favor ingresa un correo válido.",
  }),
  password: z.string().min(1, {
    message: "Por favor ingresa tu contraseña.",
  }),
});

type AuthFormProps = {
  type: "login" | "register";
  title: string;
  buttonText: string;
  footerText: string;
  footerLinkText: string;
  footerLinkUrl: string;
};

const AuthForm: React.FC<AuthFormProps> = ({ 
  type, 
  title, 
  buttonText, 
  footerText, 
  footerLinkText, 
  footerLinkUrl 
}) => {
  const navigate = useNavigate();
  
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof loginSchema>) {
    logger.info("auth form submit", { email: values.email });
    toast.success(`${type === "login" ? "Inicio de sesión" : "Registro"} exitoso! Redirigiendo...`);
    
    // Simulate successful authentication
    setTimeout(() => {
      navigate("/");
    }, 2000);
  }

  return (
    <motion.div 
      className="bg-black/40 backdrop-blur-md border border-blue-500/20 rounded-lg p-6 shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h1 className="text-2xl font-bold text-center mb-6 text-gradient bg-gradient-crystal animate-text-shimmer">
        {title}
      </h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-blue-500/30 bg-black/30 focus:ring-blue-400"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-muted-foreground">
                Recordarme
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="text-blue-400 hover:text-blue-300 hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-gradient-crystal hover:bg-gradient-quantum transition-all duration-300"
          >
            {buttonText}
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
              O {type === "login" ? "inicia sesión" : "regístrate"} con
            </span>
          </div>
        </div>
        
        <div className="mt-6">
          <SocialLinks variant="buttons" iconSize={4} className="w-full" />
        </div>
      </div>
      
      <p className="text-center text-sm text-muted-foreground mt-6">
        {footerText}{" "}
        <Link to={footerLinkUrl} className="text-blue-400 hover:text-blue-300 hover:underline">
          {footerLinkText}
        </Link>
      </p>
    </motion.div>
  );
};

export default AuthForm;
