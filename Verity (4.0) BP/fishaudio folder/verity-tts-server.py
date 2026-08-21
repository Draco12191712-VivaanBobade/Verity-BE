#!/usr/bin/env python3
# ═════════════════════════════════════════════════════════════════════════════
# verity-tts-server.py — Fish.audio TTS server for Verity
#
# Receives POST /tts from the behavior pack, calls Fish.audio,
# and plays the audio through your OS speakers.
#
# No resource pack modifications. No sound slots. Just audio.
#
# RUN:
#   pip install requests
#   python verity-tts-server.py
# ═════════════════════════════════════════════════════════════════════════════

from flask import Flask, request, jsonify
import requests
import os
import sys
import tempfile
import time
import subprocess
import threading

app = Flask(__name__)

CONFIG = {
    "fish_api_key": "",           # ← PASTE YOUR FISH.AUDIO API KEY
    "fish_voice_id": "",          # ← PASTE CLONED VOICE REF ID (optional)
    "fish_model": "s2.1-pro-free",
    "fish_format": "mp3",
}

def play_audio(filepath):
    """Play audio file through OS speakers."""
    import platform
    system = platform.system()

    # Try pygame first (best)
    try:
        import pygame
        pygame.mixer.init()
        pygame.mixer.music.load(filepath)
        pygame.mixer.music.play()
        while pygame.mixer.music.get_busy():
            time.sleep(0.1)
        pygame.mixer.quit()
        return
    except:
        pass

    # Try playsound
    try:
        from playsound import playsound as ps
        ps(filepath)
        return
    except:
        pass

    # System commands
    try:
        if system == "Darwin":
            os.system(f'afplay "{filepath}"')
            return
        elif system == "Windows":
            os.system(f'start "" /min "{filepath}"')
            return
        elif system == "Linux":
            for cmd in ["ffplay", "mpv", "cvlc"]:
                if os.system(f"which {cmd} > /dev/null 2>&1") == 0:
                    if cmd == "ffplay":
                        os.system(f'ffplay -nodisp -autoexit "{filepath}" > /dev/null 2>&1')
                    elif cmd == "mpv":
                        os.system(f'mpv --no-video "{filepath}" > /dev/null 2>&1')
                    elif cmd == "cvlc":
                        os.system(f'cvlc --play-and-exit "{filepath}" > /dev/null 2>&1')
                    return
    except:
        pass

    print("[TTS] Could not play audio. Install pygame: pip install pygame")

def call_fish_audio(text, voice_id=""):
    url = "https://api.fish.audio/v1/tts"
    headers = {
        "Authorization": f"Bearer {CONFIG['fish_api_key']}",
        "Content-Type": "application/json",
        "model": CONFIG["fish_model"],
    }
    body = {
        "text": text,
        "format": CONFIG["fish_format"],
        "model": CONFIG["fish_model"],
    }
    if voice_id:
        body["reference_id"] = voice_id

    resp = requests.post(url, headers=headers, json=body, timeout=60)
    resp.raise_for_status()
    return resp.content

@app.route("/tts", methods=["POST"])
def tts():
    data = request.get_json(force=True)
    text = data.get("text", "").strip()
    voice_id = data.get("voiceId", CONFIG["fish_voice_id"])
    player_name = data.get("playerName", "Player")

    if not text:
        return jsonify({"error": "Missing text"}), 400
    if not CONFIG["fish_api_key"]:
        return jsonify({"error": "Fish API key not configured"}), 500

    print(f'[TTS] {player_name}: "{text[:60]}{"..." if len(text) > 60 else ""}"')

    try:
        audio = call_fish_audio(text, voice_id)

        suffix = f".{CONFIG['fish_format']}"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as f:
            f.write(audio)
            tmp_path = f.name

        # Play in background so HTTP response returns immediately
        threading.Thread(target=lambda: (play_audio(tmp_path), os.remove(tmp_path)), daemon=True).start()

        return jsonify({"status": "playing"})

    except Exception as e:
        print(f"[TTS] Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    if not CONFIG["fish_api_key"]:
        print("ERROR: Set your Fish.audio API key in CONFIG['fish_api_key']")
        print("Get one at: https://fish.audio/app/api-keys/")
        sys.exit(1)

    print("=" * 50)
    print("  Verity TTS Server")
    print("  Audio plays through your OS speakers")
    print("  Listening on http://0.0.0.0:5000")
    print("=" * 50)
    app.run(host="0.0.0.0", port=5000)
