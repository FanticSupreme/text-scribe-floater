
import { FloatingScribe } from "../components/FloatingScribe";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="flex items-center justify-center min-h-screen p-8">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Text Scribe Floater
          </h1>
          <p className="text-xl text-slate-300 mb-8 leading-relaxed">
            Your intelligent floating companion that types like a human, bypassing copy-paste restrictions with natural keystroke simulation.
          </p>
          <div className="flex items-center justify-center gap-2 text-slate-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Floating scribe is active and ready</span>
          </div>
        </div>
      </div>
      <FloatingScribe />
    </div>
  );
};

export default Index;
