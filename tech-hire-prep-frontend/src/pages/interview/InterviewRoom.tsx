import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { VscPlay, VscClose, VscRecordKeys } from 'react-icons/vsc';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { api } from '../../utils/api';
import { io, Socket } from 'socket.io-client';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/notifications';
import { sessionApi, webrtcApi } from '../../services/backendApi';

export const InterviewRoom: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { pushToast } = useToast();

  const [code, setCode] = useState('// Write your code here\n');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [roomReady, setRoomReady] = useState(false);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    let mounted = true;

    const initializeRoom = async () => {
      if (!sessionId) return;

      try {
        await sessionApi.join(sessionId);
        await webrtcApi.createToken({ sessionId });
        await webrtcApi.createRoom({ sessionId });
        if (mounted) {
          setRoomReady(true);
        }
      } catch (err) {
        pushToast({ title: 'Room access failed', description: getErrorMessage(err, 'Unable to join this interview room'), variant: 'error' });
        navigate(`/sessions/${sessionId}`);
        return;
      }

      try {
        const res = await api.get<{ code?: string; language?: string }>(`/api/v1/editor/session/${sessionId}`);
        if (res.code) setCode(res.code);
        if (res.language) setLanguage(res.language);
      } catch (err) {
        pushToast({ title: 'Failed to load session', description: getErrorMessage(err, 'Failed to load session code'), variant: 'error' });
      }

      const token = localStorage.getItem('token');
      const socketUrl = import.meta.env.VITE_WS_URL || 'http://localhost:4400';

      socketRef.current = io(socketUrl, { auth: { token }, query: { sessionId } });

      socketRef.current.on('connect', () => {
        setIsConnected(true);
        socketRef.current?.emit('join-room', { roomId: sessionId });
      });
      socketRef.current.on('disconnect', () => setIsConnected(false));
      socketRef.current.on('code-update', (newCode: string) => setCode(newCode));
    };

    initializeRoom();

    return () => {
      mounted = false;
      socketRef.current?.emit('leave-room', { roomId: sessionId });
      socketRef.current?.disconnect();
    };
  }, [navigate, pushToast, sessionId]);

  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || '';
    setCode(newCode);
    socketRef.current?.emit('code-change', { sessionId, code: newCode });
    api.post(`/api/v1/editor/session/${sessionId}/save`, { code: newCode, language }).catch((err) => {
      pushToast({ title: 'Save failed', description: getErrorMessage(err, 'Failed to save code'), variant: 'error' });
    });
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('Running...');
    try {
      const res = await api.post<{ output?: string }>(`/api/v1/editor/session/${sessionId}/run`, { code, language });
      setOutput(res.output || 'Execution successful but no output returned.');
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Execution failed.');
      pushToast({ title: 'Execution failed', description: errorMessage, variant: 'error' });
      setOutput(errorMessage);
    } finally {
      setIsRunning(false);
    }
  };

  const handleLeave = () => {
    api.post(`/api/v1/session/${sessionId}/leave`)
      .then(() => pushToast({ title: 'Success', description: 'Left session', variant: 'success' }))
      .catch((err) => pushToast({ title: 'Leave failed', description: getErrorMessage(err, 'Failed to leave session'), variant: 'error' }));
    navigate(`/sessions/${sessionId}`);
  };

  return (
    <div className="h-screen w-full flex flex-col bg-bg">
      <header className="h-14 border-b border-border bg-surface flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-success' : 'bg-danger'}`} />
            <h1 className="font-semibold text-text text-sm sm:text-base">Interview Room</h1>
          </div>
          <Badge variant={roomReady ? 'green' : 'yellow'}>{roomReady ? 'Room ready' : 'Joining...'}</Badge>
          <Badge variant="gray">{sessionId}</Badge>
        </div>

        <div className="flex items-center gap-3">
          <Select label='type' options={[{ label: 'JavaScript', value: 'javascript' }, { label: 'TypeScript', value: 'typescript' }, { label: 'Python', value: 'python' }, { label: 'Java', value: 'java' }, { label: 'C++', value: 'cpp' }]} value={language} onChange={setLanguage} className="w-36" />
          <Button size="sm" onClick={handleRun} isLoading={isRunning} className="bg-green-600 hover:bg-green-700 text-white">
            <VscPlay size={16} className="mr-1.5" /> Run Code
          </Button>
          <Button size="sm" variant="danger" onClick={handleLeave}>
            <VscClose size={16} className="mr-1.5" /> Leave
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 lg:w-96 border-r border-border bg-surface-muted hidden md:flex flex-col">
          <div className="p-4 border-b border-border font-medium text-sm flex items-center gap-2 text-text">
            <VscRecordKeys size={16} className="text-accent" /> Video Call
          </div>
          <div className="flex-1 p-4 flex flex-col gap-4">
            <div className="flex-1 bg-surface-strong rounded-xl border border-border overflow-hidden relative shadow-sm">
              <div className="absolute inset-0 flex items-center justify-center text-muted text-sm">Waiting for peer...</div>
            </div>
            <div className="h-48 bg-surface-strong rounded-xl border border-border overflow-hidden relative shadow-sm">
              <div className="absolute inset-0 flex items-center justify-center text-muted text-sm">Camera off</div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="flex-1 relative">
            <Editor height="100%" language={language} theme="vs-dark" value={code} onChange={handleCodeChange} options={{ minimap: { enabled: false }, fontSize: 14, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.6, padding: { top: 16 }, scrollBeyondLastLine: false, smoothScrolling: true, cursorBlinking: 'smooth', cursorSmoothCaretAnimation: 'on', formatOnPaste: true }} />
          </div>

          {output && (
            <div className="h-64 border-t border-border bg-[#1e1e1e] text-gray-300 font-mono text-sm flex flex-col shrink-0">
              <div className="h-9 px-4 flex items-center justify-between border-b border-[#333] bg-[#252526]">
                <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Output</span>
                <button onClick={() => setOutput('')} className="text-gray-400 hover:text-white"><VscClose size={16} /></button>
              </div>
              <div className="flex-1 p-4 overflow-auto whitespace-pre-wrap">{output}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
