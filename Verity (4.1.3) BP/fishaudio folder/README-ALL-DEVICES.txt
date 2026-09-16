═══════════════════════════════════════════════════════════════════════════════
                    VERITY + FISH.AUDIO TTS
                    Setup Guide for All Devices
═══════════════════════════════════════════════════════════════════════════════

WHAT THIS ACTUALLY DOES
───────────────────────
When Verity speaks in Minecraft, her text is sent to Fish.audio's AI TTS API.
The resulting audio plays through YOUR DEVICE'S SPEAKERS (not inside Minecraft).

  [Verity speaks] → [HivemindAPI POST] → [Your Server]
                                              ↓
                                    [Fish.audio API]
                                              ↓
                                    [Your Device's Speakers]

IMPORTANT: The audio comes from your OS (Windows, Linux, macOS, Android),
NOT from Minecraft's sound engine. This is a limitation of Bedrock Edition.

WHAT YOU NEED
─────────────
• Fish.audio API key (free): https://fish.audio/app/api-keys/
• Script debugger connected (same as api.js)
• A device that can run Python in the background while playing

═══════════════════════════════════════════════════════════════════════════════
  WINDOWS — FULLY SUPPORTED
═══════════════════════════════════════════════════════════════════════════════

1. INSTALL PYTHON
   → https://www.python.org/downloads/
   → Check "Add Python to PATH" during install

2. INSTALL DEPENDENCIES
   Open Command Prompt or PowerShell:
     pip install requests flask pygame

3. CONFIGURE THE SERVER
   Open verity-tts-server.py in Notepad:
     CONFIG = {
       "fish_api_key": "YOUR_KEY_HERE",
       "fish_voice_id": "",  # optional
     }

4. START THE SERVER
   python verity-tts-server.py
   Leave this window open while playing.

5. CONNECT SCRIPT DEBUGGER
   In Minecraft:
     /script debugger connect traye.ddns.net 19144
   Or set in Settings > Creator > Attach Debugger on Load

6. CONFIGURE THE PACK
   Open: Verity (3.0) BP/scripts/verity/config.js
   Set:
     CONFIG.ai.workerUrl = "http://YOUR_PC_IP:5000"
   Or:
     CONFIG.fishAudio.workerUrl = "http://YOUR_PC_IP:5000"

7. ENABLE IN-GAME
   /verity:tts_provider fish

═══════════════════════════════════════════════════════════════════════════════
  LINUX — FULLY SUPPORTED
═══════════════════════════════════════════════════════════════════════════════

1. INSTALL PYTHON & DEPS
   sudo apt update
   sudo apt install python3 python3-pip
   pip3 install requests flask pygame

   (Optional: install ffmpeg for better audio)
   sudo apt install ffmpeg

2. CONFIGURE
   Edit verity-tts-server.py:
     CONFIG["fish_api_key"] = "YOUR_KEY_HERE"

3. START
   python3 verity-tts-server.py

4. CONNECT DEBUGGER & SET URL (same as Windows steps 5-7)

═══════════════════════════════════════════════════════════════════════════════
  macOS — FULLY SUPPORTED
═══════════════════════════════════════════════════════════════════════════════

1. INSTALL PYTHON
   → https://www.python.org/downloads/macos/
   Or use Homebrew: brew install python3

2. INSTALL DEPS
   pip3 install requests flask pygame

3. CONFIGURE & START (same as Linux)
   python3 verity-tts-server.py

4. CONNECT DEBUGGER & SET URL (same as Windows steps 5-7)

═══════════════════════════════════════════════════════════════════════════════
  ANDROID — FULLY SUPPORTED (via Termux)
═══════════════════════════════════════════════════════════════════════════════

✅ YES, this works on Android through Termux.

1. INSTALL TERMUX
   → F-Droid: https://f-droid.org/packages/com.termux/
   ⚠️ Do NOT use the Google Play Store version — it is outdated and broken.

2. SETUP TERMUX
   pkg update
   pkg install python
   pip install requests flask pygame

3. TRANSFER THE SERVER FILE
   Move verity-tts-server.py to your Android device (via Files app, USB, etc.)
   In Termux, navigate to the file:
     cd /sdcard/Download   # or wherever you put it

4. CONFIGURE
   Edit the file:
     nano verity-tts-server.py
   Paste your Fish.audio API key in CONFIG.

5. START THE SERVER
   python verity-tts-server.py
   Leave Termux running in the background.

6. CONNECT DEBUGGER & SET URL (same as Windows steps 5-7)
   Use your Android device's local IP (e.g., http://192.168.1.50:5000)

PREVENT TERMUX FROM BEING KILLED:
  • In Termux, swipe from left → Acquire Wakelock
  • Android Settings → Apps → Termux → Battery → Unrestricted

═══════════════════════════════════════════════════════════════════════════════
  iOS — NOT SUPPORTED
═══════════════════════════════════════════════════════════════════════════════

❌ Fish.audio TTS is NOT possible on iOS.

WHY:
• iOS cannot run Python servers reliably in the background
• Bedrock on iOS cannot play external audio through its sound engine
• Apple's sandbox prevents both requirements
• Even jailbroken iOS has no reliable way to inject audio into Bedrock

WHAT TO DO ON iOS:
Use local phoneme TTS instead:
  /verity:tts_provider local

This uses Verity's built-in speech engine and works natively on ALL platforms
including iOS, Xbox, PlayStation, and Switch. No server needed.

═══════════════════════════════════════════════════════════════════════════════
  CONSOLES (Xbox / PlayStation / Switch) — NOT SUPPORTED
═══════════════════════════════════════════════════════════════════════════════

❌ Fish.audio TTS is NOT possible on consoles.

WHY:
• Consoles cannot run Python or any background server
• Consoles have no way to play external audio
• The Bedrock sandbox is locked down with no workaround

WHAT TO DO ON CONSOLES:
Use local phoneme TTS:
  /verity:tts_provider local

═══════════════════════════════════════════════════════════════════════════════
  IN-GAME COMMANDS
═══════════════════════════════════════════════════════════════════════════════

  /verity:tts on              — enable TTS
  /verity:tts off             — disable TTS
  /verity:tts_provider local  — built-in phoneme TTS (works everywhere)
  /verity:tts_provider fish   — Fish.audio AI TTS (PC/Android only)
  /verity:tts_provider both   — both simultaneously

═══════════════════════════════════════════════════════════════════════════════
  TROUBLESHOOTING
═══════════════════════════════════════════════════════════════════════════════

"Request failed" or no audio
  → Make sure script debugger is connected
  → Check that your server is running
  → Verify workerUrl in config.js matches your server IP

"Fish API key not configured"
  → Edit verity-tts-server.py and paste your key

No sound plays
  → Install pygame: pip install pygame
  → Or install ffmpeg for better compatibility

"Cannot find module 'flask'"
  → pip install requests flask

Audio is delayed
  → Normal — network + generation takes 1-3 seconds

Termux gets killed (Android)
  → Termux menu → Acquire Wakelock
  → Android Settings → Battery → Termux → Unrestricted

═══════════════════════════════════════════════════════════════════════════════
  HONEST PLATFORM SUMMARY
═══════════════════════════════════════════════════════════════════════════════

  Platform          | Fish.audio | Phoneme TTS | Why?
  ──────────────────┼────────────┼─────────────┼─────────────────────────────
  Windows           |     ✅     |     ✅      | Can run Python + play audio
  Linux             |     ✅     |     ✅      | Can run Python + play audio
  macOS             |     ✅     |     ✅      | Can run Python + play audio
  Android (Termux)  |     ✅     |     ✅      | Can run Python + play audio
  iOS               |     ❌     |     ✅      | Cannot run Python server
  Xbox              |     ❌     |     ✅      | Cannot run Python server
  PlayStation       |     ❌     |     ✅      | Cannot run Python server
  Switch            |     ❌     |     ✅      | Cannot run Python server

═══════════════════════════════════════════════════════════════════════════════
