import { WikiPage } from "@/components/WikiPage";
import { Section, InfoBox } from "@/components/WikiElements";
import { Atom, Cpu, Shield, FlaskConical } from "lucide-react";

const QuantumComputing = () => (
  <WikiPage
    title="Tecnología Quantum-Clásica"
      subtitle="Computación Híbrida — IBM Qiskit, Google Cirq, Microsoft Q#"
    >
      {/* Hero Banner */}
      <div className="relative h-48 w-full overflow-hidden">
        <img src="/images/misty-mountains.jpg" alt="Montañas neblinosas de Real del Monte" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>
      <InfoBox type="info" title="Arquitectura Cuántica Híbrida">
      TAMV implementa un procesador hybrid quantum-classical que combina optimización cuántica 
      (QAOA, VQE) con procesamiento clásico para máximo rendimiento con 1000+ qubits simulados.
    </InfoBox>

    <Section title="Stack Cuántico" icon={Atom}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {["IBM Qiskit", "Google Cirq", "Microsoft Q#", "TensorFlow Quantum"].map((tech) => (
          <div key={tech} className="rounded-md border border-border/50 bg-primary/5 px-3 py-3 text-sm text-center font-medium text-foreground">
            {tech}
          </div>
        ))}
      </div>
    </Section>

    <Section title="Pipeline Híbrido" icon={Cpu}>
      <div className="rounded-lg border border-border/50 bg-card/30 p-4 font-mono text-xs space-y-2">
        <div className="text-muted-foreground"># QuantumClassicalHybrid Pipeline</div>
        <div>1. <span className="text-primary">quantum_optimize</span>(problem.quantum_part)</div>
        <div className="pl-4 text-muted-foreground">→ QuantumCircuit(qubits) → H gates → superposición</div>
        <div className="pl-4 text-muted-foreground">→ execute(backend, shots=1024) → counts</div>
        <div>2. <span className="text-primary">classical_process</span>(problem.classical_part)</div>
        <div>3. <span className="text-primary">combine_results</span>(quantum, classical)</div>
      </div>
    </Section>

    <Section title="Aplicaciones" icon={FlaskConical}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { title: "Criptografía Post-Cuántica", desc: "Seguridad a prueba de computadoras cuánticas con Kyber/Dilithium" },
          { title: "Optimización de Consenso", desc: "Algoritmos cuánticos QAOA para gobernanza federada" },
          { title: "Simulación Molecular", desc: "Modelado de materiales avanzados con VQE" },
          { title: "Machine Learning Cuántico", desc: "IA con ventaja cuántica para predicción y clasificación" },
        ].map((app) => (
          <div key={app.title} className="rounded-md border border-border/50 bg-muted/20 p-4">
            <div className="font-semibold text-foreground text-sm mb-1">{app.title}</div>
            <div className="text-xs text-muted-foreground">{app.desc}</div>
          </div>
        ))}
      </div>
    </Section>

    <Section title="Métricas Cuánticas">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Qubits Simulados", value: "1000+" },
          { label: "Backend", value: "Hybrid" },
          { label: "Throughput", value: "Alto" },
          { label: "Latencia", value: "< 100ms" },
        ].map((m) => (
          <div key={m.label} className="rounded-lg border border-border/50 bg-card/30 p-4 text-center">
            <div className="text-xl font-bold text-primary">{m.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{m.label}</div>
          </div>
        ))}
      </div>
    </Section>

    <Section title="Seguridad Cuántica" icon={Shield}>
      <InfoBox type="warning">
        Todos los sistemas criptográficos de TAMV están diseñados para resistir ataques de computadoras 
        cuánticas. Los algoritmos post-cuánticos (Kyber-1024, Dilithium-5) protegen la infraestructura 
        ante la amenaza Q-Day.
      </InfoBox>
    </Section>
  </WikiPage>
);

export default QuantumComputing;
