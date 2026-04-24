# Gemini Live 音声対話アプリ 設計書 (Full-Stack & Secure Edition)

https://realtime-voice-app-lilac.vercel.app/

## 1. 概要

Gemini 3.1 Flash Live Preview API を活用し、低遅延でリアルタイムな音声対話を実現するフルスタック・シングルページアプリケーション（SPA）です。バックエンドを導入することで、APIキーの安全な管理と本番環境へのデプロイを想定した堅牢な設計になっています。

## 2. システムアーキテクチャ

フロントエンド（Vite）とバックエンド（Express）を統合したハイブリッド構成です。

### 構成図

codeText

```
[User Browser]
      |
      |-- (HTTPS/JSON) --> [Express Server (Backend)]
      |                         |-- APIキーの管理 (.env)
      |                         |-- ヘルスチェック (/api/health)
      |                         |-- 静的ファイルの配信 (dist/)
      |
      |-- (WebSocket) ----> [Gemini Live API Server]
                                |-- 音声解析・生成
```

## 3. 技術スタック

- **Frontend**: React 18, TypeScript, Vite
    
- **Backend**: Node.js, Express, tsx (Runtime)
    
- **Styling**: Tailwind CSS
    
- **Animation**: Framer Motion (motion/react)
    
- **AI SDK**: @google/genai (Multimodal Live API)
    
- **Audio API**: Web Audio API (AudioContext, AudioWorklet)
    

## 4. 主要コンポーネント構成

### 4.1 server.ts (Backend Entry Point)

アプリケーションの基盤となるサーバーです。

- **環境変数の保護**: GEMINI_API_KEY をサーバーサイドで保持し、クライアントへの露出を最小限に抑えます。
    
- **統合配信**: 開発時は Vite 開発サーバーをミドルウェアとして動かし、本番時はビルド済みの静的ファイルを配信します。
    
- **ヘルスチェック**: /api/health を通じて、サーバーの状態やAI設定の有無を確認可能です。
    

### 4.2 useGeminiLive.ts (Custom Hook)

AIとの通信と音声ロジックをカプセル化しています。

- **セキュリティ**: APIキーを環境変数から安全に取得します。
    
- **音声処理**: 24kHz PCM 形式での双方向ストリーミング。
    
- **割り込み制御**: ユーザーの発話を検知した際の即時ミュート・再生停止処理。
    

### 4.3 CharacterAvatar.tsx & Visualizer.tsx

- **視覚的フィードバック**: AIの発話状態（isSpeaking）に同期したアバターアニメーションと、リアルタイムな音声波形表示。
    

## 5. セキュリティ設計

- **APIキーの隠蔽**: コード内にAPIキーをハードコードせず、.env ファイルおよびホスティング先の環境変数設定から読み込みます。
    
- **HTTPS強制**: マイク入力（getUserMedia）に必要なセキュアコンテキストを確保するため、本番環境ではHTTPS通信を前提としています。
    
- **プロキシ準備**: 将来的な拡張として、AI通信自体をバックエンドでプロキシし、クライアントからAPIキーを完全に排除する構成への移行が容易な設計になっています。
    

## 6. デプロイ・運用設計

- **ビルドプロセス**: npm run build により、フロントエンド資産を dist/ フォルダに最適化。
    
- **ランタイム**: npm start で Express サーバーを起動し、APIとフロントエンドを単一のポート（3000）で提供。
    
- **拡張性**: Vercel, Cloud Run, Heroku などの主要なクラウドプラットフォームにそのままデプロイ可能な構成です。
    

## 7. 特徴的なUX判断

- **没入型デザイン**: テキストログを排除し、アバターとの「対面」を重視。
    
- **スクロールバー排除**: UIのノイズを減らし、フルスクリーン体験に近い操作感を提供。

## 8. Vercel デプロイメント

本アプリを Vercel で公開する際の手順と設定は以下の通りです。

### 8.1 デプロイ手順
1. GitHub リポジトリを作成し、プロジェクトをプッシュします。
2. Vercel ダッシュボードから「Add New Project」を選択し、リポジトリをインポートします。
3. **重要: 環境設定**
   - Vercel のプロジェクト設定画面の「Environment Variables」にて、`GEMINI_API_KEY` を追加し、[Google AI Studio](https://aistudio.google.com/) で取得した API キーを設定してください。
4. 設定後、「Deploy」をクリックします。

### 8.2 フレームワーク設定
Vercel は自動的に Vite を認識しますが、以下の設定になっていることを確認してください。
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 8.3 注意点
- **HTTPS**: ブラウザのマイク機能（`getUserMedia`）を使用するため、HTTPS での通信が必須となります（Vercel では標準で提供されます）。
- **WebSocket**: Gemini Live API への WebSocket 接続をクライアントサイドで行うため、ブラウザから Google のドメインへの接続が許可されている必要があります。
