
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface UploadVisualizerProps {
  progress: number;
  fileName: string;
  fileSize: string;
  status: "idle" | "uploading" | "complete" | "error";
  className?: string;
}

const UploadVisualizer = ({
  progress,
  fileName,
  fileSize,
  status,
  className,
}: UploadVisualizerProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [paths, setPaths] = useState<{ id: number; d: string }[]>([]);
  
  // Create neural network visualization
  useEffect(() => {
    if (status === "idle" || !svgRef.current) return;
    
    const createRandomPaths = () => {
      const width = svgRef.current?.clientWidth || 300;
      const height = svgRef.current?.clientHeight || 150;
      
      // Create nodes
      const nodes: { x: number; y: number }[] = [];
      for (let i = 0; i < 12; i++) {
        nodes.push({
          x: Math.random() * width * 0.8 + width * 0.1,
          y: Math.random() * height * 0.8 + height * 0.1
        });
      }
      
      // Create paths between nodes
      const newPaths = [];
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          if (Math.random() > 0.7) {
            const controlX = (nodes[i].x + nodes[j].x) / 2 + (Math.random() - 0.5) * 50;
            const controlY = (nodes[i].y + nodes[j].y) / 2 + (Math.random() - 0.5) * 50;
            
            const path = `M ${nodes[i].x},${nodes[i].y} Q ${controlX},${controlY} ${nodes[j].x},${nodes[j].y}`;
            newPaths.push({ id: i * nodes.length + j, d: path });
          }
        }
      }
      
      setPaths(newPaths);
    };
    
    createRandomPaths();
  }, [status]);
  
  const getStatusColor = () => {
    switch (status) {
      case "idle": return "text-muted-foreground";
      case "uploading": return "text-quantum-300";
      case "complete": return "text-crystal-300";
      case "error": return "text-nebula-300";
    }
  };
  
  return (
    <div className={cn("relative h-40 w-full rounded-lg overflow-hidden", className)}>
      {/* Neural visualization */}
      <svg 
        ref={svgRef}
        className="absolute inset-0 w-full h-full z-0" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <g className="neural-network">
          {paths.map((path) => (
            <path
              key={path.id}
              d={path.d}
              className="neural-path"
              strokeLinecap="round"
              fill="none"
              style={{ 
                animationDelay: `${path.id * 100}ms`,
                opacity: status === "complete" ? 0.8 : 0.4
              }}
            />
          ))}
        </g>
      </svg>
      
      {/* File info overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-background via-background/90 to-transparent">
        <div className="flex justify-between items-end">
          <div className="max-w-[70%]">
            <p className="text-sm font-medium truncate">{fileName}</p>
            <p className="text-xs text-muted-foreground">{fileSize}</p>
          </div>
          <div className="flex flex-col items-end">
            <span className={cn("text-xs font-medium", getStatusColor())}>
              {status === "idle" ? "Ready" : 
               status === "uploading" ? "Processing" : 
               status === "complete" ? "Complete" : "Error"}
            </span>
            {status === "uploading" && (
              <span className="text-xs text-muted-foreground">{progress}%</span>
            )}
          </div>
        </div>
        
        {/* Progress bar */}
        {status === "uploading" && (
          <div className="mt-1 h-1 w-full bg-muted/50 rounded overflow-hidden">
            <div 
              className="h-full bg-quantum-300 rounded transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadVisualizer;
