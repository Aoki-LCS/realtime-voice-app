import { useState, useCallback, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

export function useGeminiLive() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiTranscript, setAiTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);

  const stop = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (audioWorkletNodeRef.current) {
      audioWorkletNodeRef.current.disconnect();
      audioWorkletNodeRef.current = null;
    }
    activeSourcesRef.current.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // Source might have already stopped
      }
    });
    activeSourcesRef.current = [];
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
    setIsSpeaking(false);
  }, []);

  const start = useCallback(async () => {
    if (isConnecting || isConnected) return;
    setIsConnecting(true);
    setError(null);
    setAiTranscript("");
    setTranscript("");

    try {
      // In AI Studio, process.env.GEMINI_API_KEY is securely handled by the platform's proxy.
      // For external production, you would typically proxy this through your own backend.
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEYが見つかりません。シークレットに追加してください。");
      }

      // Optional: Check backend health before starting
      try {
        const healthCheck = await fetch('/api/health');
        const healthData = await healthCheck.json();
        console.log("Backend status:", healthData.message);
      } catch (e) {
        console.warn("Backend health check failed, proceeding anyway...");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const audioContext = new AudioContext({ sampleRate: 24000 });
      audioContextRef.current = audioContext;
      nextStartTimeRef.current = audioContext.currentTime;

      // Resume AudioContext on user action
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      await audioContext.audioWorklet.addModule('/audio-processor.js');
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = audioContext.createMediaStreamSource(stream);
      const audioWorkletNode = new AudioWorkletNode(audioContext, 'audio-processor');
      audioWorkletNodeRef.current = audioWorkletNode;

      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } },
          },
          systemInstruction: "あなたは親切で有能なAIアシスタントです。ユーザーの質問に対して、簡潔で分かりやすい日本語でリアルタイムに回答してください。音声での会話に適した、自然な口調を心がけてください。",
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);
            source.connect(audioWorkletNode);
            audioWorkletNode.port.onmessage = (event) => {
              const pcmData = event.data;
              const bytes = new Uint8Array(pcmData);
              let binary = '';
              for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
              }
              const base64Data = btoa(binary);
              session.sendRealtimeInput({
                audio: { data: base64Data, mimeType: 'audio/pcm;rate=24000' }
              });
            };
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle audio output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              const binaryString = atob(base64Audio);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              const pcmData = new Int16Array(bytes.buffer);
              const floatData = new Float32Array(pcmData.length);
              for (let i = 0; i < pcmData.length; i++) {
                floatData[i] = pcmData[i] / 32768.0;
              }

              const buffer = audioContext.createBuffer(1, floatData.length, 24000);
              buffer.getChannelData(0).set(floatData);
              const source = audioContext.createBufferSource();
              source.buffer = buffer;
              source.connect(audioContext.destination);
              
              const startTime = Math.max(nextStartTimeRef.current, audioContext.currentTime);
              source.start(startTime);
              nextStartTimeRef.current = startTime + buffer.duration;

              // Track active sources to allow stopping them on interruption
              activeSourcesRef.current.push(source);
              setIsSpeaking(true);
              source.onended = () => {
                activeSourcesRef.current = activeSourcesRef.current.filter(s => s !== source);
                if (activeSourcesRef.current.length === 0) {
                  setIsSpeaking(false);
                }
              };
            }

            // Handle user transcription
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              if (text) setTranscript(text);
            }

            // Handle AI transcription
            const aiPart = message.serverContent?.modelTurn?.parts?.find(p => p.text);
            if (aiPart) {
              setAiTranscript(prev => prev + aiPart.text);
            }
            
            // Handle interruptions
            if (message.serverContent?.interrupted) {
              console.log("Interruption detected, stopping audio...");
              nextStartTimeRef.current = audioContext.currentTime;
              setIsSpeaking(false);
              activeSourcesRef.current.forEach(source => {
                try {
                  source.stop();
                } catch (e) {
                  // Already stopped
                }
              });
              activeSourcesRef.current = [];
            }
          },
          onclose: () => {
            stop();
          },
          onerror: (err) => {
            console.error("Gemini Live Error:", err);
            setError("接続エラーが発生しました。もう一度お試しください。");
            stop();
          }
        }
      });

      sessionRef.current = session;
    } catch (err) {
      console.error("Failed to start Gemini Live:", err);
      setError("マイクへのアクセスまたはAIへの接続に失敗しました。");
      setIsConnecting(false);
    }
  }, [isConnecting, isConnected, stop]);

  return {
    start,
    stop,
    isConnected,
    isConnecting,
    isSpeaking,
    transcript,
    aiTranscript,
    error
  };
}
