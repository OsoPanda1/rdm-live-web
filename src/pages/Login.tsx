
import Layout from "@/modules/core/Layout";
import AuthForm from "@/modules/oraculoTecnologico/AuthForm";
import BackgroundEffects from "@/modules/interfazSensorial/BackgroundEffects";
import Logo from "@/components/Logo";
import { motion } from "framer-motion";

/**
 * Página de inicio de sesión
 * 
 * Implementa el Oráculo Tecnológico para la autenticación de usuarios
 */
const Login = () => {
  return (
    <Layout>
      {/* Efectos visuales de fondo */}
      <BackgroundEffects />
      
      <motion.main 
        className="flex-1 container max-w-md mx-auto px-4 py-8 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex justify-center mb-4">
          <Logo size="lg" />
        </div>
        
        <AuthForm 
          type="login"
          title="Iniciar Sesión"
          buttonText="Iniciar Sesión"
          footerText="¿No tienes una cuenta?"
          footerLinkText="Regístrate"
          footerLinkUrl="/register"
        />
      </motion.main>
    </Layout>
  );
};

export default Login;
