import './DebugPanel.css';

interface DebugPanelProps {
  data: unknown;
}

export default function DebugPanel({ data }: DebugPanelProps) {
  return (
    <div className="debug-section">
      <h2 className="text-xl font-bold mb-4">Game Debug</h2>
      <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-64">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

