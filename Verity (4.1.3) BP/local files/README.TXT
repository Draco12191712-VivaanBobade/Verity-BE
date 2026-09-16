================================================================================
  VERITY 3.0 — PLAYER GUIDE
================================================================================

AI MODES
--------
Verity can use three different AI backends. You can switch anytime in chat.

1. WORKER (default)
   Say:  verity ai worker
   What: Uses the shared cloud relay. Zero setup.
   Limit: Shared across all players. If Verity stops responding, the limit
          was hit — switch to option 2 or 3.

2. YOUR OWN API KEY
   Say:  verity ai key <your-key>
   What: Uses your personal Groq/OpenRouter account. Bypasses the shared limit.
   How:  Get a free key at https://groq.com → copy the key → paste it in chat.
   Limit: Groq free tier (~20 requests/min). More than enough for one player.

3. LOCAL AI (unlimited)
   Say:  verity ai local
          verity ai local http://192.168.1.50:11434/api/chat  (if using another PC)
   What: Runs the AI on your own device. Zero limits, zero keys, works offline.
   
   PC (easy):
     1. Download Ollama from https://ollama.com
     2. Open terminal:  ollama pull llama3.2:1b
     3. Start server:    ollama serve
     4. In Minecraft:    verity ai local
   
   Android / Termux (advanced):
     1. Install Termux from F-Droid (NOT Play Store)
     2. Run the setup script in this same folder
     3. Start llama-server on port 11434
     4. In Minecraft:    verity ai local http://localhost:11434/api/chat