
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Play, Pause, Square, Type, Minimize2, Maximize2 } from "lucide-react";
import { TypewriterEngine } from "../utils/TypewriterEngine";
import { toast } from "sonner";

export const FloatingScribe = () => {
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const cardRef = useRef<HTMLDivElement>(null);
  const typewriterRef = useRef<TypewriterEngine | null>(null);

  useEffect(() => {
    typewriterRef.current = new TypewriterEngine();
    return () => {
      typewriterRef.current?.stop();
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const startTyping = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text to type");
      return;
    }

    setIsTyping(true);
    setIsPaused(false);
    toast.success("Started typing! Click on your target input field.");

    try {
      await typewriterRef.current?.startTyping(text, {
        onProgress: (progress) => {
          console.log(`Typing progress: ${progress}%`);
        },
        onComplete: () => {
          setIsTyping(false);
          toast.success("Typing completed!");
        },
        onPause: () => {
          setIsPaused(true);
        },
        onResume: () => {
          setIsPaused(false);
        }
      });
    } catch (error) {
      setIsTyping(false);
      toast.error("Typing was interrupted");
    }
  };

  const pauseTyping = () => {
    typewriterRef.current?.pause();
    setIsPaused(true);
    toast.info("Typing paused");
  };

  const resumeTyping = () => {
    typewriterRef.current?.resume();
    setIsPaused(false);
    toast.info("Typing resumed");
  };

  const stopTyping = () => {
    typewriterRef.current?.stop();
    setIsTyping(false);
    setIsPaused(false);
    toast.info("Typing stopped");
  };

  return (
    <Card
      ref={cardRef}
      className="fixed z-50 w-80 bg-black/20 backdrop-blur-xl border border-white/20 shadow-2xl"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? "grabbing" : "grab",
      }}
    >
      <div
        className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-b border-white/10"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Type className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-white">Text Scribe</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <div className="p-4 space-y-4">
          <Textarea
            placeholder="Paste or type your text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-24 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-purple-400/50 focus:ring-purple-400/50"
            rows={4}
          />

          <div className="flex gap-2">
            {!isTyping ? (
              <Button
                onClick={startTyping}
                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
                disabled={!text.trim()}
              >
                <Play className="w-4 h-4 mr-2" />
                Start
              </Button>
            ) : (
              <>
                {isPaused ? (
                  <Button
                    onClick={resumeTyping}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Resume
                  </Button>
                ) : (
                  <Button
                    onClick={pauseTyping}
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0"
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                )}
                <Button
                  onClick={stopTyping}
                  variant="destructive"
                  className="flex-1"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              </>
            )}
          </div>

          {isTyping && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-sm text-white/70">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                {isPaused ? "Paused" : "Typing in progress..."}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
