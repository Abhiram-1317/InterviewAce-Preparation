#!/usr/bin/env python3
"""
InterviewAce -- 3-Minute Master Cut Video Generator (Audio-First Architecture)
=============================================================================
Duration: ~180.0s (3 minutes master cut @ 30fps)
Format: 1920x1080 Full HD (16:9 Landscape)
Encode: H.264 High Profile (CRF 18, yuv420p, 30fps), AAC 256kbps Stereo

11 Modular Cinematic Scenes:
  1. The Broken Preparation Problem & The Vision (0s-18s)
  2. Architecture & High-Performance Stack (18s-35s)
  3. Deep Resume Ingestion & Intelligence (35s-53s)
  4. Target Role & Job Description Deconstruction (53s-72s)
  5. Precision Skill Gap Matrix & 82% Alignment Gauge (72s-92s)
  6. Gap-Prioritized 15-Question Generation Bank (92s-110s)
  7. Live Mock Interview Simulator & Audio Waveform (110s-129s)
  8. Multi-Dimensional AI Evaluation Rubric (129s-146s)
  9. Longitudinal Analytics & Preparation Trajectory (146s-160s)
  10. Multi-Model AI Engine & Zero Vendor Lock-In (160s-173s)
  11. Brand Climax & Call to Action (173s-180s)
"""

import os, sys, math, json, wave, subprocess, time
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import imageio_ffmpeg
import edge_tts

# ==============================================================================
# PATH CONFIGURATION
# ==============================================================================
WORK_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.dirname(WORK_DIR)
VO_DIR = os.path.join(WORK_DIR, "vo_3min")
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

FINAL_PATH = os.path.join(OUTPUT_DIR, "launch-video-3min.mp4")
CLEAN_PATH = os.path.join(OUTPUT_DIR, "launch-video-3min-clean.mp4")
MAIN_PATH = os.path.join(OUTPUT_DIR, "launch-video.mp4")
SRT_PATH = os.path.join(OUTPUT_DIR, "captions-3min.srt")
VTT_PATH = os.path.join(OUTPUT_DIR, "captions-3min.vtt")
VO_MASTER_PATH = os.path.join(WORK_DIR, "voiceover-master-3min.wav")
SOUNDTRACK_PATH = os.path.join(WORK_DIR, "soundtrack-bed-3min.wav")
MIXED_AUDIO_PATH = os.path.join(WORK_DIR, "mixed-audio-3min.wav")

W, H = 1920, 1080
FPS = 30
SR = 44100
VOICE = "en-US-GuyNeural"
VOICE_RATE = "+2%"  # Energetic, clear, Apple-keynote delivery (~155 wpm)
PADDING_FRAMES = 12  # 0.4s breathing room before and after each scene narration
INTER_SCENE_SILENCE_MS = 150
CROSSFADE_FRAMES = 10

# Color Palette
COL_OBSIDIAN = (14, 13, 12)
COL_DARK_PANEL = (24, 23, 22)
COL_VERMILION = (212, 66, 31)
COL_CORAL = (240, 90, 50)
COL_CANVAS = (248, 247, 244)
COL_EMERALD = (34, 197, 94)
COL_AMBER = (245, 158, 11)
COL_BLUE = (59, 130, 246)
COL_PURPLE = (168, 85, 247)
COL_WHITE = (255, 255, 255)
COL_NEAR_BLACK = (18, 18, 20)
COL_TEXT_MUTED = (140, 140, 150)
COL_CARD_BORDER = (55, 55, 65)

# ==============================================================================
# SCRIPT DEFINITION (11 Scenes)
# ==============================================================================
SCENES = [
    {
        "id": 1,
        "name": "The Problem & The Vision",
        "bg": "dark",
        "vo_text": (
            "Ninety percent of technical candidates fail interviews not because they lack skill, "
            "but because they prepare for the wrong things. Endless LeetCode grind and generic trivia "
            "do not reflect real job expectations. Meet InterviewAce: the intelligent AI copilot "
            "built for precision interview readiness."
        ),
        "captions": [
            "90% of candidates fail interviews\nbecause they prepare for the wrong things.",
            "Endless LeetCode & generic trivia\ndon't reflect real job expectations.",
            "Meet InterviewAce.",
            "Precision AI copilot for\nreal interview readiness.",
        ],
    },
    {
        "id": 2,
        "name": "Production Architecture",
        "bg": "dark",
        "vo_text": (
            "Built with a high-performance FastAPI backend and modern React interface, "
            "InterviewAce delivers a responsive, developer-first experience. "
            "No bloated onboarding, no confusing menus. Just an intuitive workspace "
            "designed to get you interview-ready in record time."
        ),
        "captions": [
            "High-performance FastAPI backend\n& modern React interface.",
            "Developer-first design with\nsub-100ms response times.",
            "Zero bloated setup.",
            "Intuitive workspace built for speed.",
        ],
    },
    {
        "id": 3,
        "name": "Deep Resume Ingestion",
        "bg": "light",
        "vo_text": (
            "It starts with your resume. Upload any PDF or document, and InterviewAce instantly "
            "parses your background: extracting five-plus years of full-stack experience, "
            "senior architecture proficiency, and verified skills across Python, FastAPI, "
            "React, PostgreSQL, and distributed systems."
        ),
        "captions": [
            "Upload any PDF or document in seconds.",
            "Instant structural competency extraction.",
            "Python · FastAPI · React\nPostgreSQL · Distributed Systems",
            "5+ years experience verified\nwith zero manual entry.",
        ],
    },
    {
        "id": 4,
        "name": "Target Role Deconstruction",
        "bg": "light",
        "vo_text": (
            "Next, paste the job description for your dream role: Senior Full Stack Engineer "
            "at TechCorp Global. InterviewAce deconstructs the hiring requirements line by line: "
            "identifying target tech stacks, distributed API benchmarks, Redis caching patterns, "
            "and container orchestration expectations that hiring managers actually grade."
        ),
        "captions": [
            "Paste your target job description.",
            "Senior Full Stack Engineer\n@ TechCorp Global",
            "Line-by-line NLP parsing.",
            "Surfacing real hiring rubrics\n& distributed systems benchmarks.",
        ],
    },
    {
        "id": 5,
        "name": "Precision Skill Gap Matrix",
        "bg": "dark",
        "vo_text": (
            "Then comes the core breakthrough: the Precision Skill Gap Matrix. "
            "Watch your alignment score calculate in real time to eighty-two percent. "
            "Green highlights your verified strengths, while amber and red isolate critical "
            "gap areas like Redis cache eviction and Docker optimization. "
            "You save over twenty hours of wasted study."
        ),
        "captions": [
            "The Precision Skill Gap Matrix.",
            "Real-time alignment score: 82% match.",
            "Verified strengths highlighted in green.",
            "Priority gaps: Redis eviction\n& Docker containerization.",
            "Saves 20+ hours of wasted prep.",
        ],
    },
    {
        "id": 6,
        "name": "Role-Specific Question Bank",
        "bg": "light",
        "vo_text": (
            "Instead of generic interview questions, InterviewAce synthesizes a tailored "
            "fifteen-question bank engineered specifically around your gap areas. "
            "From concurrency race conditions in FastAPI to cache-aside invalidation patterns "
            "under heavy load, every prompt reflects real senior-level interview rounds."
        ),
        "captions": [
            "15 tailored interview questions\nengineered around your gaps.",
            "Concurrency race conditions\n& thread-safety in FastAPI.",
            "High-write Redis cache-aside patterns.",
            "Real senior-level prompts.\nZero generic trivia.",
        ],
    },
    {
        "id": 7,
        "name": "Live Interactive Mock Session",
        "bg": "dark",
        "vo_text": (
            "Now, step into the live mock interview simulator. As you speak your answer "
            "into the microphone, real-time waveform tracking and speech-to-text transcribe "
            "your response under realistic timed conditions. Practice articulating complex "
            "architectural tradeoffs out loud, exactly as you would in front of a hiring panel."
        ),
        "captions": [
            "Live mock interview simulator.",
            "Real-time audio waveform\n& speech-to-text transcription.",
            "Realistic timed interview pressure.",
            "Practice articulating architectural\ntradeoffs with precision.",
        ],
    },
    {
        "id": 8,
        "name": "Multi-Dimensional AI Rubric",
        "bg": "dark",
        "vo_text": (
            "The moment you finish, our AI evaluation engine delivers a multi-dimensional "
            "rubric score: eighty-eight out of a hundred overall readiness. "
            "Detailed breakdowns grade your technical depth, STAR methodology structure, "
            "and architectural clarity, complete with precise, actionable suggestions for refinement."
        ),
        "captions": [
            "Instant multi-dimensional evaluation.",
            "88/100 Overall Readiness Score.",
            "Technical Depth: 92% · STAR: 86%\nSystem Architecture: 88%",
            "Concrete, actionable guidance\nfor every response.",
        ],
    },
    {
        "id": 9,
        "name": "Longitudinal Analytics",
        "bg": "dark",
        "vo_text": (
            "Your performance is tracked continuously. Through the Analytics Dashboard, "
            "monitor your readiness score climb across sessions, review historical feedback reports, "
            "and watch your confidence compound before the real interview day."
        ),
        "captions": [
            "Continuous performance analytics.",
            "Readiness score climbing:\n64% -> 76% -> 88%",
            "Historical session tracking\n& competency growth curves.",
            "Confidence compounding\nbefore interview day.",
        ],
    },
    {
        "id": 10,
        "name": "Multi-Model AI Engine",
        "bg": "dark",
        "vo_text": (
            "Under the hood, you get total freedom with zero vendor lock-in. "
            "Switch effortlessly between Google Gemini, OpenAI GPT-4o, Anthropic Claude, "
            "and Groq, with support for custom API keys and automated model routing."
        ),
        "captions": [
            "Multi-provider AI flexibility.",
            "Google Gemini · OpenAI GPT-4o\nAnthropic Claude · Groq",
            "Bring your own API keys.",
            "Zero vendor lock-in.",
        ],
    },
    {
        "id": 11,
        "name": "Climax & Call to Action",
        "bg": "dark",
        "vo_text": (
            "Stop guessing what interviewers want. Experience InterviewAce, "
            "and turn preparation into offers."
        ),
        "captions": [
            "Stop guessing what interviewers want.",
            "InterviewAce.",
            "Turn preparation into offers.",
            "Get started free today.",
        ],
    },
]

# ==============================================================================
# FONT LOADING & UTILITIES
# ==============================================================================
def load_font(size, bold=False):
    candidates = (
        ["C:/Windows/Fonts/segoeuib.ttf", "C:/Windows/Fonts/arialbd.ttf", "C:/Windows/Fonts/calibrib.ttf"]
        if bold else
        ["C:/Windows/Fonts/segoeui.ttf", "C:/Windows/Fonts/arial.ttf", "C:/Windows/Fonts/calibri.ttf"]
    )
    for p in candidates:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()

def wrap_text(draw, text, font, max_width):
    words = text.split()
    lines = []
    curr = ""
    for w in words:
        test = f"{curr} {w}".strip()
        bbox = draw.textbbox((0, 0), test, font=font)
        if (bbox[2] - bbox[0]) > max_width and curr:
            lines.append(curr)
            curr = w
        else:
            curr = test
    if curr:
        lines.append(curr)
    return lines

def ease_out_cubic(t):
    return 1 - (1 - max(0.0, min(1.0, t))) ** 3

def ease_out_back(t):
    t = max(0.0, min(1.0, t))
    c1 = 1.70158
    c3 = c1 + 1
    return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2

def lerp(a, b, t):
    return a + (b - a) * max(0.0, min(1.0, t))

# Pre-computed coordinate distance map for fast vectorized radial glow
_Y_GRID, _X_GRID = np.mgrid[0:H, 0:W]
_DX = (_X_GRID - W / 2.0) / W
_DY = (_Y_GRID - H / 2.0) / H
_DIST = np.sqrt(_DX ** 2 + _DY ** 2)

def make_radial_glow(intensity=0.8, falloff=2.4):
    glow = np.clip(1.0 - _DIST * falloff, 0.0, 1.0) * intensity
    r = np.clip(COL_OBSIDIAN[0] + COL_VERMILION[0] * glow, 0, 255).astype(np.uint8)
    g = np.clip(COL_OBSIDIAN[1] + COL_VERMILION[1] * glow * 0.35, 0, 255).astype(np.uint8)
    b = np.clip(COL_OBSIDIAN[2] + COL_VERMILION[2] * glow * 0.25, 0, 255).astype(np.uint8)
    return np.stack([r, g, b], axis=-1)

def make_vertical_gradient(top_rgb, bot_rgb):
    t = np.linspace(0, 1, H, dtype=np.float32)[:, None]
    r = (top_rgb[0] + (bot_rgb[0] - top_rgb[0]) * t).astype(np.uint8)
    g = (top_rgb[1] + (bot_rgb[1] - top_rgb[1]) * t).astype(np.uint8)
    b = (top_rgb[2] + (bot_rgb[2] - top_rgb[2]) * t).astype(np.uint8)
    r_mat = np.repeat(r, W, axis=1)
    g_mat = np.repeat(g, W, axis=1)
    b_mat = np.repeat(b, W, axis=1)
    return np.stack([r_mat, g_mat, b_mat], axis=-1)

def draw_rounded_rect(draw, bbox, radius, fill, outline=None, width=1):
    x0, y0, x1, y1 = bbox
    r = min(radius, (x1 - x0) // 2, (y1 - y0) // 2)
    draw.rounded_rectangle([x0, y0, x1, y1], radius=r, fill=fill, outline=outline, width=width)

def draw_caption(img, draw, caption_text, is_dark_bg=True):
    """Draw captions in lower third inside a sleek frosted capsule (never clipping content)."""
    if not caption_text:
        return
    font = load_font(34, bold=True)
    lines = caption_text.split('\n')
    line_h = 44
    total_text_h = len(lines) * line_h

    # Measure max line width
    max_w = 0
    for line in lines:
        bb = draw.textbbox((0, 0), line, font=font)
        max_w = max(max_w, bb[2] - bb[0])

    pad_x = 40
    pad_y = 16
    pill_w = max_w + pad_x * 2
    pill_h = total_text_h + pad_y * 2
    pill_x = (W - pill_w) // 2
    pill_y = H - 150 - pill_h // 2

    # Draw semi-transparent pill backdrop
    bg_fill = (12, 12, 16, 220) if is_dark_bg else (255, 255, 255, 235)
    border_col = (70, 70, 85, 180) if is_dark_bg else (210, 210, 220, 200)

    # Use RGBA overlay for smooth pill
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ov_draw = ImageDraw.Draw(overlay)
    ov_draw.rounded_rectangle(
        [pill_x, pill_y, pill_x + pill_w, pill_y + pill_h],
        radius=20, fill=bg_fill, outline=border_col, width=2
    )
    img.paste(Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB"), (0, 0))

    # Re-obtain RGB draw
    draw_new = ImageDraw.Draw(img)
    text_color = COL_WHITE if is_dark_bg else COL_NEAR_BLACK
    for i, line in enumerate(lines):
        bb = draw_new.textbbox((0, 0), line, font=font)
        lw = bb[2] - bb[0]
        lx = (W - lw) // 2
        ly = pill_y + pad_y + i * line_h
        draw_new.text((lx, ly), line, fill=text_color, font=font)


# ==============================================================================
# PHASE 1: GENERATE VOICE-OVER PER SCENE (Edge TTS)
# ==============================================================================
def generate_voiceover_scenes():
    print("=" * 60)
    print("[PHASE 1] Generating high-quality Edge-TTS Voice-Over for 11 scenes")
    print("=" * 60)
    os.makedirs(VO_DIR, exist_ok=True)

    for i, scene in enumerate(SCENES):
        mp3_path = os.path.join(VO_DIR, f"scene_{i+1}.mp3")
        meta_path = os.path.join(VO_DIR, f"scene_{i+1}_meta.jsonl")
        wav_path = os.path.join(VO_DIR, f"scene_{i+1}.wav")

        if os.path.exists(wav_path) and os.path.exists(meta_path):
            with wave.open(wav_path, 'rb') as wf:
                dur = wf.getnframes() / wf.getframerate()
            print(f"  [OK] Scene {i+1} ({scene['name']}): Cached ({dur:.2f}s)")
            continue

        print(f"  [->] Scene {i+1} ({scene['name']}): Generating TTS...")
        comm = edge_tts.Communicate(
            scene["vo_text"],
            voice=VOICE,
            rate=VOICE_RATE,
            boundary="WordBoundary"
        )
        comm.save_sync(mp3_path, meta_path)

        # Transcode to pristine 44.1kHz stereo WAV
        subprocess.run([
            FFMPEG, "-y", "-i", mp3_path,
            "-ar", str(SR), "-ac", "2", "-sample_fmt", "s16",
            wav_path
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)

        if not os.path.exists(wav_path):
            raise RuntimeError(f"Failed to generate WAV for scene {i+1}")
        
        with wave.open(wav_path, 'rb') as wf:
            dur = wf.getnframes() / wf.getframerate()
        print(f"       Generated: {dur:.2f}s ({len(scene['vo_text'].split())} words)")


# ==============================================================================
# PHASE 2 & 3: MEASURE AUDIO & BUILD TIMELINE MAP
# ==============================================================================
def build_timeline_and_vo_master():
    print("\n" + "=" * 60)
    print("[PHASE 2 & 3] Measuring Audio & Assembling Master Timeline")
    print("=" * 60)

    scene_data = []
    for i, scene in enumerate(SCENES):
        wav_path = os.path.join(VO_DIR, f"scene_{i+1}.wav")
        meta_path = os.path.join(VO_DIR, f"scene_{i+1}_meta.jsonl")

        with wave.open(wav_path, 'rb') as wf:
            dur = wf.getnframes() / wf.getframerate()

        words = []
        if os.path.exists(meta_path):
            with open(meta_path, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if not line: continue
                    try:
                        ent = json.loads(line)
                        if ent.get("type") == "WordBoundary":
                            words.append({
                                "text": ent["text"],
                                "start": ent["offset"] / 10_000_000.0,
                                "end": (ent["offset"] + ent["duration"]) / 10_000_000.0
                            })
                    except Exception:
                        pass

        audio_frames = math.ceil(dur * FPS)
        total_frames = audio_frames + 2 * PADDING_FRAMES

        scene_data.append({
            "index": i,
            "name": scene["name"],
            "audio_duration": dur,
            "audio_frames": audio_frames,
            "total_frames": total_frames,
            "words": words,
            "wav_path": wav_path
        })

    # Concatenate audio into master WAV with inter-scene spacing
    all_audio = np.array([], dtype=np.int16)
    silence_samples = int(INTER_SCENE_SILENCE_MS / 1000.0 * SR) * 2
    pre_pad_samples = int(PADDING_FRAMES / FPS * SR) * 2
    post_pad_samples = int(PADDING_FRAMES / FPS * SR) * 2

    frame_map = []
    current_frame = 0

    for i, sd in enumerate(scene_data):
        with wave.open(sd["wav_path"], 'rb') as wf:
            audio_raw = np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16)

        # Pad before
        all_audio = np.concatenate([all_audio, np.zeros(pre_pad_samples, dtype=np.int16)])
        # Audio
        all_audio = np.concatenate([all_audio, audio_raw])
        # Pad after
        all_audio = np.concatenate([all_audio, np.zeros(post_pad_samples, dtype=np.int16)])
        # Silence between scenes
        if i < len(scene_data) - 1:
            all_audio = np.concatenate([all_audio, np.zeros(silence_samples, dtype=np.int16)])

        end_frame = current_frame + sd["total_frames"]
        global_offset = (current_frame + PADDING_FRAMES) / FPS
        global_words = [{
            "text": w["text"],
            "start": w["start"] + global_offset,
            "end": w["end"] + global_offset
        } for w in sd["words"]]

        frame_map.append({
            "scene_index": i,
            "name": sd["name"],
            "start_frame": current_frame,
            "end_frame": end_frame,
            "total_frames": sd["total_frames"],
            "audio_duration": sd["audio_duration"],
            "global_words": global_words
        })

        current_frame = end_frame
        if i < len(scene_data) - 1:
            current_frame += math.ceil(INTER_SCENE_SILENCE_MS / 1000.0 * FPS)

    total_frames = current_frame
    total_duration = total_frames / FPS

    with wave.open(VO_MASTER_PATH, 'w') as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes(all_audio.tobytes())

    print(f"  Master timeline computed: {total_frames} frames = {total_duration:.2f}s (~{total_duration/60:.2f} min)")
    for fm in frame_map:
        print(f"    Scene {fm['scene_index']+1:2d} ({fm['name']:32s}): frames {fm['start_frame']:5d} -> {fm['end_frame']:5d} ({fm['total_frames']/FPS:.1f}s)")

    return frame_map, total_frames, total_duration


# ==============================================================================
# PHASE 4: FAST VECTORIZED SOUNDTRACK GENERATION
# ==============================================================================
def generate_soundtrack(total_duration):
    print("\n" + "=" * 60)
    print(f"[PHASE 4] Generating Multi-Movement Soundtrack Bed ({total_duration:.1f}s)")
    print("=" * 60)

    total_samples = int(total_duration * SR)
    t = np.linspace(0, total_duration, total_samples, endpoint=False)

    # Fundamental bass warmth (55 Hz & 82.5 Hz)
    bass = (np.sin(2 * np.pi * 55 * t) * 0.08 + np.sin(2 * np.pi * 82.5 * t) * 0.04)

    # Ambient moving chord pads (A minor / C major progression)
    pad_f = 220.0 + 8.0 * np.sin(2 * np.pi * 0.04 * t)
    pad = (
        np.sin(2 * np.pi * pad_f * t) * 0.05 +
        np.sin(2 * np.pi * (pad_f * 1.2) * t) * 0.03 +
        np.sin(2 * np.pi * (pad_f * 1.5) * t) * 0.02
    )

    # Rhythmic pulse (120 BPM = 2.0 Hz) - fully vectorized
    pulse_raw = (0.5 * (1 + np.sin(2 * np.pi * 2.0 * t))) ** 6
    pulse_env = np.zeros_like(t)
    pulse_env = np.where((t >= 15) & (t < 35), (t - 15) / 20.0 * 0.5, pulse_env)
    pulse_env = np.where((t >= 35) & (t < 130), 0.5 + 0.5 * np.sin(2 * np.pi * 0.02 * (t - 35)), pulse_env)
    pulse_env = np.where((t >= 130) & (t < 170), 0.7 - (t - 130) / 40.0 * 0.4, pulse_env)
    pulse_env = np.where(t >= 170, 0.3 * (1.0 - (t - 170) / max(0.1, total_duration - 170)), pulse_env)
    pulse = np.sin(2 * np.pi * 110 * t) * pulse_raw * pulse_env * 0.07

    # Melodic shimmer texture
    shimmer = np.sin(2 * np.pi * 880 * t) * 0.015 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.1 * t))

    # Triumphant finale resolution chord (final 10 seconds)
    finale = np.zeros_like(t)
    rem = total_duration - t
    finale_mask = rem <= 10.0
    if np.any(finale_mask):
        chord_freqs = [130.8, 164.8, 196.0, 261.6, 329.6, 392.0, 523.3]
        f_sig = sum(np.sin(2 * np.pi * f * t) for f in chord_freqs) / len(chord_freqs)
        f_env = np.clip(np.where(rem > 4, (10.0 - rem) / 6.0, rem / 4.0), 0, 1)
        finale = np.where(finale_mask, f_sig * f_env * 0.09, 0)

    # Master mix
    mix = bass + pad + pulse + shimmer + finale

    # Smooth master fade-in and fade-out
    mix = np.where(t < 2.0, mix * (t / 2.0), mix)
    mix = np.where(rem < 2.0, mix * (rem / 2.0), mix)

    # Normalize to 0.70 peak
    pk = np.max(np.abs(mix))
    if pk > 0:
        mix = mix / pk * 0.70

    stereo = (np.column_stack([mix, mix]).flatten() * 32767).astype(np.int16)
    with wave.open(SOUNDTRACK_PATH, 'w') as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes(stereo.tobytes())

    print(f"  Soundtrack bed ready: {os.path.getsize(SOUNDTRACK_PATH)/1024/1024:.1f} MB")


# ==============================================================================
# PHASE 5: DYNAMIC AUDIO DUCKING & MASTERING
# ==============================================================================
def mix_audio(total_duration):
    print("\n" + "=" * 60)
    print("[PHASE 5] Mixing Narration + Ducked Soundtrack (-14 LUFS Target)")
    print("=" * 60)

    with wave.open(VO_MASTER_PATH, 'rb') as wf:
        vo = np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0

    with wave.open(SOUNDTRACK_PATH, 'rb') as wf:
        st = np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0

    target_len = max(len(vo), len(st))
    if len(vo) < target_len:
        vo = np.pad(vo, (0, target_len - len(vo)))
    if len(st) < target_len:
        st = np.pad(st, (0, target_len - len(st)))

    # Fast convolution ducking envelope (50ms window)
    win_size = int(0.05 * SR * 2)
    kernel = np.ones(win_size, dtype=np.float32) / win_size
    vo_envelope = np.convolve(np.abs(vo), kernel, mode='same')
    max_env = np.max(vo_envelope)
    if max_env > 0:
        vo_envelope /= max_env

    # Duck music by ~14dB when VO is present
    duck_factor = 0.20
    music_gain = 1.0 - vo_envelope * (1.0 - duck_factor)
    st_ducked = st * music_gain * 0.28

    master = vo * 0.88 + st_ducked
    peak = np.max(np.abs(master))
    if peak > 0.95:
        master = master / peak * 0.95

    master_int = (master * 32767).astype(np.int16)
    with wave.open(MIXED_AUDIO_PATH, 'w') as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes(master_int.tobytes())

    print(f"  Mixed master audio ready: {os.path.getsize(MIXED_AUDIO_PATH)/1024/1024:.1f} MB")
    return MIXED_AUDIO_PATH


# ==============================================================================
# PHASE 6: GENERATE CAPTIONS (SRT & VTT)
# ==============================================================================
def generate_captions(frame_map):
    print("\n" + "=" * 60)
    print("[PHASE 6] Generating Precision Captions (.srt / .vtt)")
    print("=" * 60)

    srt_lines = []
    vtt_lines = ["WEBVTT\n"]
    entry_id = 1

    def fmt_time(sec, delim=','):
        h = int(sec // 3600)
        m = int((sec % 3600) // 60)
        s = int(sec % 60)
        ms = int((sec % 1) * 1000)
        return f"{h:02d}:{m:02d}:{s:02d}{delim}{ms:03d}"

    for fm in frame_map:
        sc = SCENES[fm["scene_index"]]
        words = fm["global_words"]
        if not words: continue

        caps = sc["captions"]
        chunk_size = max(1, len(words) // len(caps))

        w_idx = 0
        for ci, cap_text in enumerate(caps):
            if w_idx >= len(words): break
            end_w = len(words) - 1 if ci == len(caps) - 1 else min(w_idx + chunk_size, len(words) - 1)
            t_start = words[w_idx]["start"]
            t_end = words[end_w]["end"] + 0.35

            srt_lines.append(f"{entry_id}\n{fmt_time(t_start, ',')} --> {fmt_time(t_end, ',')}\n{cap_text}\n")
            vtt_lines.append(f"{fmt_time(t_start, '.')} --> {fmt_time(t_end, '.')}\n{cap_text}\n")

            entry_id += 1
            w_idx = end_w + 1

    with open(SRT_PATH, 'w', encoding='utf-8') as f:
        f.write("\n".join(srt_lines))
    with open(VTT_PATH, 'w', encoding='utf-8') as f:
        f.write("\n".join(vtt_lines))

    print(f"  Exported: {SRT_PATH} & {VTT_PATH} ({entry_id - 1} entries)")


# ==============================================================================
# PHASE 7: SCENE RENDERERS (11 Distinct Modular Scenes)
# ==============================================================================
# Pre-rendered background caches
BG_OBSIDIAN_GLOW = make_radial_glow(0.85)
BG_DARK_VERTICAL = make_vertical_gradient((20, 20, 26), (12, 12, 16))
BG_CANVAS_LIGHT = make_vertical_gradient((248, 247, 244), (238, 236, 230))

def render_scene_1(img, draw, progress, scene_frames, frame_in_scene):
    """Scene 1: The Problem & The Vision (0s-18s)"""
    img.paste(Image.fromarray(BG_OBSIDIAN_GLOW), (0, 0))

    # Sub-header hook
    hook_font = load_font(28, bold=True)
    draw.text((120, 160), "WHY 90% OF TECHNICAL INTERVIEWS FAIL", fill=COL_CORAL, font=hook_font)

    # Problem statement
    p_prog = min(1.0, max(0.0, (progress - 0.05) / 0.25))
    if p_prog > 0:
        title_font = load_font(52, bold=True)
        draw.text((120, 215), "Not a lack of engineering ability.", fill=COL_WHITE, font=title_font)
        draw.text((120, 280), "A lack of precision alignment.", fill=(180, 180, 195), font=title_font)

    # 3 Broken Grind Pills
    broken_tags = ["Generic LeetCode Puzzles", "Irrelevant Trivia Grind", "Zero Role Alignment"]
    tag_font = load_font(22, bold=False)
    for ti, tag in enumerate(broken_tags):
        tag_prog = min(1.0, max(0.0, (progress - 0.25 - ti * 0.1) / 0.15))
        if tag_prog > 0:
            tx = 120 + ti * 340
            ty = 370
            draw_rounded_rect(draw, [tx, ty, tx + 310, ty + 50], 14, fill=(35, 30, 30), outline=(90, 45, 45), width=1)
            draw.text((tx + 25, ty + 12), tag, fill=(230, 160, 160), font=tag_font)

    # Hero Reveal: InterviewAce
    hero_prog = min(1.0, max(0.0, (progress - 0.55) / 0.25))
    if hero_prog > 0:
        h_ease = ease_out_back(hero_prog)
        scale_offset = int((1.0 - h_ease) * 50)
        brand_font = load_font(72, bold=True)
        by = 500 + scale_offset
        draw.text((120, by), "InterviewAce.", fill=COL_WHITE, font=brand_font)

        # Radiant dot
        dot_bb = draw.textbbox((120, by), "InterviewAce.", font=brand_font)
        dot_x = dot_bb[2] - 18
        dot_y = by + 46
        draw.ellipse([dot_x, dot_y, dot_x + 18, dot_y + 18], fill=COL_VERMILION)

        # Tagline
        tagline_font = load_font(30, bold=False)
        draw.text((120, by + 90), "Prepare smarter. Interview better.", fill=COL_CORAL, font=tagline_font)

        # Feature highlights capsule
        pills = ["AI Skill Gap Matrix", "Real-Time Mock Simulator", "Multi-Provider AI Gateway"]
        px = 120
        p_font = load_font(20, bold=True)
        for p in pills:
            bb = draw.textbbox((0, 0), p, font=p_font)
            pw = bb[2] - bb[0] + 36
            draw_rounded_rect(draw, [px, by + 150, px + pw, by + 195], 22, fill=(30, 32, 42), outline=(70, 75, 100), width=1)
            draw.text((px + 18, by + 160), p, fill=COL_WHITE, font=p_font)
            px += pw + 25

def render_scene_2(img, draw, progress, scene_frames, frame_in_scene):
    """Scene 2: Production Architecture (18s-35s)"""
    img.paste(Image.fromarray(BG_DARK_VERTICAL), (0, 0))

    header_font = load_font(26, bold=True)
    draw.text((120, 100), "SYSTEM ARCHITECTURE & PERFORMANCE", fill=COL_BLUE, font=header_font)
    title_font = load_font(46, bold=True)
    draw.text((120, 140), "Engineered for Sub-100ms Interview Feedback", fill=COL_WHITE, font=title_font)

    # 3 Architecture Cards (FastAPI Backend, React Vite Frontend, Multi-Model Gateway)
    cards = [
        ("FastAPI Async Core", "Python 3.12 Backend", [
            "Motor Asynchronous MongoDB",
            "Pydantic v2 Schema Validation",
            "WebSocket Real-time Audio Streams",
            "JWT Cryptographic Session Auth"
        ], COL_CORAL),
        ("React 18 Frontend", "Glassmorphic Web Client", [
            "Vite 5 Lightning Fast Bundling",
            "AudioWorklet Waveform Visualizer",
            "TailwindCSS Modern Styling",
            "Zero Layout Shift Responsive UI"
        ], COL_BLUE),
        ("AI Provider Gateway", "Unified Multi-LLM Layer", [
            "Google Gemini 2.5 Pro / Flash",
            "OpenAI GPT-4o Realtime Engine",
            "Anthropic Claude 3.5 Sonnet",
            "Groq Ultra-Fast Llama 3.3 70B"
        ], COL_PURPLE)
    ]

    card_w = 520
    card_h = 360
    card_y = 240

    for ci, (heading, sub, items, color) in enumerate(cards):
        c_prog = min(1.0, max(0.0, (progress - 0.15 - ci * 0.15) / 0.25))
        if c_prog <= 0: continue
        c_ease = ease_out_back(c_prog)
        cx = 120 + ci * (card_w + 50)
        cy = card_y + int((1.0 - c_ease) * 60)

        # Draw card body
        draw_rounded_rect(draw, [cx, cy, cx + card_w, cy + card_h], 20, fill=(28, 28, 36), outline=(60, 65, 85), width=2)
        # Top color accent bar
        draw_rounded_rect(draw, [cx, cy, cx + card_w, cy + 10], 5, fill=color)

        draw.text((cx + 30, cy + 30), heading, fill=COL_WHITE, font=load_font(28, bold=True))
        draw.text((cx + 30, cy + 68), sub, fill=color, font=load_font(20, bold=False))

        item_font = load_font(20, bold=False)
        for ii, it in enumerate(items):
            iy = cy + 120 + ii * 48
            draw.ellipse([cx + 32, iy + 6, cx + 42, iy + 16], fill=color)
            draw.text((cx + 56, iy), it, fill=(220, 220, 230), font=item_font)

    # Bottom metric badge
    b_prog = min(1.0, max(0.0, (progress - 0.75) / 0.2))
    if b_prog > 0:
        bx = 120
        by = 640
        draw_rounded_rect(draw, [bx, by, bx + 1680, by + 75], 16, fill=(20, 22, 30), outline=(45, 50, 70), width=1)
        stat_font = load_font(22, bold=True)
        draw.text((bx + 40, by + 24), "✓ Full Async Concurrency", fill=COL_EMERALD, font=stat_font)
        draw.text((bx + 480, by + 24), "✓ Zero Vendor Lock-in", fill=COL_BLUE, font=stat_font)
        draw.text((bx + 920, by + 24), "✓ Client-Side Key Storage", fill=COL_AMBER, font=stat_font)
        draw.text((bx + 1380, by + 24), "✓ Live Microphone STT", fill=COL_CORAL, font=stat_font)

def render_scene_3(img, draw, progress, scene_frames, frame_in_scene):
    """Scene 3: Deep Resume Ingestion & Intelligence (35s-53s)"""
    img.paste(Image.fromarray(BG_CANVAS_LIGHT), (0, 0))

    header_font = load_font(24, bold=True)
    draw.text((120, 100), "CANDIDATE INTELLIGENCE ENGINE", fill=COL_VERMILION, font=header_font)
    title_font = load_font(44, bold=True)
    draw.text((120, 135), "Instant Competency Extraction from Any Resume", fill=COL_NEAR_BLACK, font=title_font)

    # Profile Card
    card_prog = min(1.0, max(0.0, (progress - 0.1) / 0.25))
    if card_prog > 0:
        ce = ease_out_back(card_prog)
        cx = 120
        cy = 220 + int((1.0 - ce) * 40)
        cw = 1680
        ch = 440

        # Card shadow & body
        draw_rounded_rect(draw, [cx + 6, cy + 6, cx + cw + 6, cy + ch + 6], 24, fill=(210, 208, 202))
        draw_rounded_rect(draw, [cx, cy, cx + cw, cy + ch], 24, fill=COL_WHITE, outline=(225, 222, 215), width=2)

        # Avatar
        av_x, av_y = cx + 50, cy + 50
        draw.ellipse([av_x, av_y, av_x + 90, av_y + 90], fill=(45, 55, 75))
        draw.text((av_x + 22, av_y + 22), "AS", fill=COL_WHITE, font=load_font(38, bold=True))

        draw.text((av_x + 120, av_y + 10), "Abhiram Shivarathri", fill=COL_NEAR_BLACK, font=load_font(36, bold=True))
        draw.text((av_x + 120, av_y + 55), "Senior Full Stack Engineer · 5+ Years Experience · Bengaluru, India", fill=(110, 110, 125), font=load_font(22, bold=False))

        # Divider
        draw.line([(cx + 50, cy + 170), (cx + cw - 50, cy + 170)], fill=(235, 232, 228), width=1)

        # Verified Competencies Section
        draw.text((cx + 50, cy + 195), "EXTRACTED TECHNICAL STACK & ARCHITECTURE SKILLS", fill=(130, 130, 145), font=load_font(20, bold=True))

        skills = [
            ("Python 3.12", COL_EMERALD), ("FastAPI", COL_EMERALD), ("React 18", COL_EMERALD),
            ("Node.js", COL_EMERALD), ("MongoDB", COL_EMERALD), ("PostgreSQL", COL_EMERALD),
            ("Distributed Systems", COL_BLUE), ("Docker", COL_BLUE), ("REST & GraphQL APIs", COL_BLUE),
            ("System Design", COL_PURPLE), ("Microservices", COL_PURPLE)
        ]

        sx = cx + 50
        sy = cy + 240
        s_font = load_font(20, bold=True)
        for si, (skill, color) in enumerate(skills):
            s_prog = min(1.0, max(0.0, (progress - 0.3 - si * 0.04) / 0.15))
            if s_prog <= 0: continue
            bb = draw.textbbox((0, 0), skill, font=s_font)
            sw = bb[2] - bb[0] + 36

            if sx + sw > cx + cw - 50:
                sx = cx + 50
                sy += 60

            draw_rounded_rect(draw, [sx, sy, sx + sw, sy + 44], 14, fill=(245, 246, 250), outline=(215, 220, 230), width=1)
            draw.ellipse([sx + 14, sy + 18, sx + 22, sy + 26], fill=color)
            draw.text((sx + 30, sy + 10), skill, fill=COL_NEAR_BLACK, font=s_font)
            sx += sw + 16

        # Experience pill
        draw_rounded_rect(draw, [cx + 50, cy + 375, cx + 480, cy + 415], 12, fill=(235, 248, 240))
        draw.text((cx + 65, cy + 384), "✓ Structural Resume Validation Complete · Zero Manual Edits", fill=(20, 140, 70), font=load_font(18, bold=True))

def render_scene_4(img, draw, progress, scene_frames, frame_in_scene):
    """Scene 4: Target Role Deconstruction (53s-72s)"""
    img.paste(Image.fromarray(BG_CANVAS_LIGHT), (0, 0))

    header_font = load_font(24, bold=True)
    draw.text((120, 100), "TARGET JOB SPECIFICATION ANALYSIS", fill=COL_VERMILION, font=header_font)
    title_font = load_font(44, bold=True)
    draw.text((120, 135), "Deconstructing Real Hiring Rubrics Line by Line", fill=COL_NEAR_BLACK, font=title_font)

    # Left Document View (Job Description)
    doc_x, doc_y = 120, 210
    doc_w = 900
    doc_h = 470

    draw_rounded_rect(draw, [doc_x + 5, doc_y + 5, doc_x + doc_w + 5, doc_y + doc_h + 5], 20, fill=(215, 212, 205))
    draw_rounded_rect(draw, [doc_x, doc_y, doc_x + doc_w, doc_y + doc_h], 20, fill=COL_WHITE, outline=(225, 222, 215), width=2)

    draw.text((doc_x + 40, doc_y + 30), "Senior Full Stack Engineer", fill=COL_NEAR_BLACK, font=load_font(28, bold=True))
    draw.text((doc_x + 40, doc_y + 68), "TechCorp Global · Remote / San Francisco ($165k - $195k)", fill=(120, 120, 130), font=load_font(20, bold=False))
    draw.line([(doc_x + 40, doc_y + 105), (doc_x + doc_w - 40, doc_y + 105)], fill=(235, 230, 225), width=1)

    reqs = [
        "Architect and maintain high-throughput distributed REST & GraphQL APIs.",
        "Implement real-time Redis Pub/Sub caching & invalidation strategies.",
        "Optimize complex PostgreSQL schemas and database query execution plans.",
        "Design production Docker container pipelines and Kubernetes orchestration.",
        "Deliver interactive, accessible dashboards using modern React 18 & TypeScript."
    ]

    req_font = load_font(20, bold=False)
    scan_line = progress * 1.3
    for ri, r in enumerate(reqs):
        ry = doc_y + 130 + ri * 65
        r_prog = min(1.0, max(0.0, (scan_line - ri * 0.16) / 0.18))
        if 0 < r_prog < 1.0:
            # Gold scanner beam
            draw_rounded_rect(draw, [doc_x + 25, ry - 6, doc_x + doc_w - 25, ry + 42], 10, fill=(255, 248, 220), outline=COL_AMBER, width=1)
        draw.text((doc_x + 40, ry + 8), f"•  {r}", fill=COL_NEAR_BLACK if r_prog > 0.4 else (140, 140, 150), font=req_font)

    # Right Extracted Insights Cards
    right_x = doc_x + doc_w + 40
    right_w = W - right_x - 120

    benchmarks = [
        ("High-Concurrency APIs", "FastAPI / Node.js 10k+ req/sec", COL_EMERALD),
        ("Redis Event Caching", "Pub/Sub, Cluster Invalidation", COL_VERMILION),
        ("Container Orchestration", "Docker Multi-Stage & K8s Scaling", COL_AMBER),
        ("Query Optimization", "PostgreSQL Indexes & Latency Tuning", COL_BLUE)
    ]

    for bi, (title, detail, col) in enumerate(benchmarks):
        b_prog = min(1.0, max(0.0, (progress - 0.25 - bi * 0.14) / 0.2))
        if b_prog <= 0: continue
        be = ease_out_back(b_prog)
        by = doc_y + bi * 115 + int((1.0 - be) * 30)

        draw_rounded_rect(draw, [right_x, by, right_x + right_w, by + 95], 16, fill=COL_WHITE, outline=(220, 220, 230), width=2)
        draw_rounded_rect(draw, [right_x, by, right_x + 10, by + 95], 4, fill=col)
        draw.text((right_x + 30, by + 20), title, fill=COL_NEAR_BLACK, font=load_font(22, bold=True))
        draw.text((right_x + 30, by + 52), detail, fill=(110, 110, 125), font=load_font(18, bold=False))

def render_scene_5(img, draw, progress, scene_frames, frame_in_scene):
    """Scene 5: Precision Skill Gap Matrix (72s-92s)"""
    img.paste(Image.fromarray(BG_DARK_VERTICAL), (0, 0))

    header_font = load_font(26, bold=True)
    draw.text((120, 90), "THE SKILL GAP MATRIX", fill=COL_CORAL, font=header_font)
    title_font = load_font(44, bold=True)
    draw.text((120, 130), "Direct Candidate vs. Job Description Benchmarking", fill=COL_WHITE, font=title_font)

    # Center/Top Circular Gauge: 82% Overall Match
    gauge_prog = min(1.0, max(0.0, (progress - 0.1) / 0.3))
    score = int(82 * ease_out_cubic(gauge_prog)) if gauge_prog > 0 else 0
    gx, gy = W // 2, 285
    r = 95

    # Gauge background circle
    draw.ellipse([gx - r, gy - r, gx + r, gy + r], outline=(45, 48, 60), width=14)
    if score > 0:
        angle_deg = int(360 * score / 100)
        draw.arc([gx - r, gy - r, gx + r, gy + r], start=-90, end=-90 + angle_deg, fill=COL_EMERALD, width=14)

    score_font = load_font(52, bold=True)
    st = f"{score}%"
    sbb = draw.textbbox((0, 0), st, font=score_font)
    draw.text((gx - (sbb[2] - sbb[0]) // 2, gy - 36), st, fill=COL_WHITE, font=score_font)
    draw.text((gx - 58, gy + 24), "ROLE ALIGNMENT", fill=(160, 165, 180), font=load_font(16, bold=True))

    # 3 Strategic Columns
    cols = [
        ("Verified Strengths", COL_EMERALD, [
            "FastAPI Microservices", "React 18 & Modern Web", "MongoDB Aggregation",
            "PostgreSQL Relational Design", "RESTful API Development"
        ]),
        ("Partial Alignments", COL_AMBER, [
            "Microservices Architecture", "CI/CD Deployment Pipelines", "Cloud Infrastructure (AWS)"
        ]),
        ("High-Priority Gap Areas", COL_VERMILION, [
            "Redis Cache Eviction & Invalidation (~2 hrs)",
            "Docker Multi-Stage Build Optimization (~3 hrs)",
            "Kubernetes Cluster Readiness Probes (~4 hrs)"
        ])
    ]

    cw = 520
    cy = 425
    ch = 260
    for ci, (col_title, col_color, items) in enumerate(cols):
        c_prog = min(1.0, max(0.0, (progress - 0.35 - ci * 0.12) / 0.2))
        if c_prog <= 0: continue
        ce = ease_out_back(c_prog)
        cx = 120 + ci * (cw + 50) + int((1.0 - ce) * 40)

        draw_rounded_rect(draw, [cx, cy, cx + cw, cy + ch], 18, fill=(24, 25, 34), outline=(50, 55, 75), width=2)
        draw_rounded_rect(draw, [cx, cy, cx + cw, cy + 8], 4, fill=col_color)
        draw.text((cx + 25, cy + 22), col_title, fill=col_color, font=load_font(24, bold=True))

        for ii, it in enumerate(items):
            iy = cy + 68 + ii * 38
            draw.ellipse([cx + 28, iy + 6, cx + 36, iy + 14], fill=col_color)
            draw.text((cx + 48, iy), it, fill=(220, 220, 230), font=load_font(18, bold=False))

    # Bottom Callout
    bot_prog = min(1.0, max(0.0, (progress - 0.8) / 0.15))
    if bot_prog > 0:
        bx, by = 120, 705
        draw_rounded_rect(draw, [bx, by, bx + 1680, by + 55], 14, fill=(35, 20, 15), outline=COL_VERMILION, width=1)
        draw.text((bx + 30, by + 14), "★  SAVED 20+ HOURS: Candidate skips generic LeetCode to focus exclusively on Redis & Docker gaps.", fill=COL_CORAL, font=load_font(20, bold=True))

def render_scene_6(img, draw, progress, scene_frames, frame_in_scene):
    """Scene 6: Role-Specific 15-Question Generation (92s-110s)"""
    img.paste(Image.fromarray(BG_CANVAS_LIGHT), (0, 0))

    header_font = load_font(24, bold=True)
    draw.text((120, 95), "DYNAMIC QUESTION BANK SYNTHESIS", fill=COL_VERMILION, font=header_font)
    title_font = load_font(44, bold=True)
    draw.text((120, 130), "15 Custom Questions Prioritized by Candidate Gap Areas", fill=COL_NEAR_BLACK, font=title_font)

    questions = [
        ("How do you handle database race conditions and worker locking when updating shared resources in FastAPI?",
         "Architecture / High Gap", COL_VERMILION, "Q1"),
        ("Design a Redis cache-aside invalidation pattern for an e-commerce catalog under heavy write load.",
         "Caching / High Gap", COL_VERMILION, "Q2"),
        ("Describe a production outage caused by a concurrency issue and explain how you resolved it under pressure.",
         "STAR Behavioral / Leadership", COL_AMBER, "Q3"),
    ]

    card_y = 210
    card_w = 1680
    card_h = 135

    for qi, (q_text, tag, tag_col, q_num) in enumerate(questions):
        q_prog = min(1.0, max(0.0, (progress - 0.15 - qi * 0.2) / 0.25))
        if q_prog <= 0: continue
        qe = ease_out_back(q_prog)
        cy = card_y + qi * (card_h + 30) + int((1.0 - qe) * 35)
        cx = 120

        draw_rounded_rect(draw, [cx + 4, cy + 4, cx + card_w + 4, cy + card_h + 4], 20, fill=(215, 212, 205))
        draw_rounded_rect(draw, [cx, cy, cx + card_w, cy + card_h], 20, fill=COL_WHITE, outline=(225, 222, 215), width=2)

        # Question number tag
        draw_rounded_rect(draw, [cx + 30, cy + 30, cx + 95, cy + 75], 12, fill=(245, 245, 250))
        draw.text((cx + 44, cy + 40), q_num, fill=COL_VERMILION, font=load_font(24, bold=True))

        # Question text with typewriter reveal
        full_len = len(q_text)
        visible_chars = int(full_len * min(1.0, q_prog * 1.4))
        vis_q = q_text[:visible_chars]
        draw.text((cx + 120, cy + 35), vis_q, fill=COL_NEAR_BLACK, font=load_font(24, bold=False))

        # Tag
        tb = draw.textbbox((0, 0), tag, font=load_font(18, bold=True))
        tw = tb[2] - tb[0] + 30
        draw_rounded_rect(draw, [cx + 120, cy + 85, cx + 120 + tw, cy + 115], 10, fill=tag_col)
        draw.text((cx + 135, cy + 91), tag, fill=COL_WHITE, font=load_font(18, bold=True))

    # Bottom notice
    if progress > 0.8:
        draw.text((120, 715), "✓ Plus 12 additional technical, system design, and behavioral prompts generated in session.", fill=(110, 110, 125), font=load_font(20, bold=False))

def render_scene_7(img, draw, progress, scene_frames, frame_in_scene):
    """Scene 7: Live Mock Interview Simulator & Audio Waveform (110s-129s)"""
    img.paste(Image.fromarray(BG_DARK_VERTICAL), (0, 0))

    # Header bar
    draw.text((120, 80), "LIVE MOCK INTERVIEW SIMULATOR", fill=COL_CORAL, font=load_font(24, bold=True))
    draw.text((120, 115), "Real-Time Audio Capture & AI Transcription", fill=COL_WHITE, font=load_font(42, bold=True))

    # Pulsing recording badge
    pulse = 0.5 + 0.5 * math.sin(frame_in_scene * 0.2)
    pr = int(10 + 4 * pulse)
    draw.ellipse([1480, 100 - pr // 2, 1480 + pr, 100 + pr // 2], fill=(240, int(50 * pulse), 50))
    draw.text((1510, 92), "LIVE RECORDING", fill=(255, 100, 100), font=load_font(22, bold=True))

    # Question Prompt Card (Top)
    doc_x, doc_y = 120, 185
    doc_w = 1680
    doc_h = 130
    draw_rounded_rect(draw, [doc_x, doc_y, doc_x + doc_w, doc_y + doc_h], 18, fill=(26, 28, 38), outline=(60, 65, 85), width=2)
    draw.text((doc_x + 35, doc_y + 20), "Active Question [System Design & Caching]:", fill=COL_CORAL, font=load_font(20, bold=True))
    draw.text((doc_x + 35, doc_y + 55), "How would you implement distributed locking in Redis to handle concurrency race conditions in FastAPI?", fill=COL_WHITE, font=load_font(26, bold=False))

    # Split Screen: Waveform Equalizer (Left) & Real-Time Transcript (Right)
    left_w = 810
    right_w = 830
    box_y = 345
    box_h = 360

    # Left Waveform Equalizer Panel
    draw_rounded_rect(draw, [doc_x, box_y, doc_x + left_w, box_y + box_h], 20, fill=(20, 22, 30), outline=(50, 55, 75), width=2)
    draw.text((doc_x + 35, box_y + 25), "AUDIO WAVEFORM (MICROPHONE INPUT)", fill=(140, 145, 160), font=load_font(18, bold=True))

    num_bars = 48
    bar_w = 11
    bar_gap = 5
    wave_total_w = num_bars * (bar_w + bar_gap)
    wave_x = doc_x + (left_w - wave_total_w) // 2
    wave_center_y = box_y + 195

    for bi in range(num_bars):
        seed = bi * 11 + frame_in_scene * 3
        mod = abs(math.sin(seed * 0.08)) * 90 + 20
        h_bar = int(mod * (0.6 + 0.4 * math.sin(frame_in_scene * 0.15 + bi * 0.2)))
        bx = wave_x + bi * (bar_w + bar_gap)
        by0 = wave_center_y - h_bar // 2
        by1 = wave_center_y + h_bar // 2
        b_col = (
            int(lerp(COL_VERMILION[0], COL_BLUE[0], bi / num_bars)),
            int(lerp(COL_VERMILION[1], COL_BLUE[1], bi / num_bars)),
            int(lerp(COL_VERMILION[2], COL_BLUE[2], bi / num_bars))
        )
        draw.rectangle([bx, by0, bx + bar_w, by1], fill=b_col)

    # Right Live Transcript Panel
    rx = doc_x + left_w + 40
    draw_rounded_rect(draw, [rx, box_y, rx + right_w, box_y + box_h], 20, fill=(20, 22, 30), outline=(50, 55, 75), width=2)
    draw.text((rx + 35, box_y + 25), "LIVE AI SPEECH-TO-TEXT TRANSCRIPT", fill=COL_EMERALD, font=load_font(18, bold=True))

    spoken_text = (
        "I would implement a Redis distributed lock using the Redlock pattern. "
        "Each FastAPI worker attempts to acquire an exclusive lock key with a finite TTL "
        "and random nonce. If acquisition fails, the worker uses an exponential backoff retry "
        "strategy to prevent thundering herd spikes while guaranteeing atomicity."
    )
    t_prog = min(1.0, max(0.0, (progress - 0.2) / 0.7))
    t_chars = int(len(spoken_text) * t_prog)
    vis_trans = spoken_text[:t_chars]

    tr_lines = wrap_text(draw, vis_trans, load_font(24, bold=False), right_w - 70)
    for li, line in enumerate(tr_lines):
        draw.text((rx + 35, box_y + 80 + li * 40), line, fill=(225, 230, 240), font=load_font(24, bold=False))

    # Blinking cursor
    if frame_in_scene % 20 < 10 and tr_lines:
        last_l = tr_lines[-1]
        lbb = draw.textbbox((0, 0), last_l, font=load_font(24, bold=False))
        cx_pos = rx + 35 + (lbb[2] - lbb[0]) + 6
        cy_pos = box_y + 80 + (len(tr_lines) - 1) * 40
        draw.rectangle([cx_pos, cy_pos + 4, cx_pos + 3, cy_pos + 32], fill=COL_CORAL)

def render_scene_8(img, draw, progress, scene_frames, frame_in_scene):
    """Scene 8: Multi-Dimensional AI Rubric (129s-146s)"""
    img.paste(Image.fromarray(BG_DARK_VERTICAL), (0, 0))

    draw.text((120, 85), "COMPREHENSIVE SESSION EVALUATION", fill=COL_CORAL, font=load_font(24, bold=True))
    draw.text((120, 120), "Multi-Dimensional AI Rubric & Instant Grading", fill=COL_WHITE, font=load_font(42, bold=True))

    # Left: Big Glowing Readiness Score Stamp
    stamp_prog = min(1.0, max(0.0, (progress - 0.1) / 0.25))
    if stamp_prog > 0:
        se = ease_out_back(stamp_prog)
        sx, sy = 120, 205
        sw, sh = 500, 480
        draw_rounded_rect(draw, [sx, sy, sx + sw, sy + sh], 24, fill=(24, 26, 36), outline=(60, 65, 85), width=2)

        # Big score
        draw.text((sx + 50, sy + 50), "READINESS SCORE", fill=(140, 145, 160), font=load_font(20, bold=True))
        big_font = load_font(96, bold=True)
        draw.text((sx + 50, sy + 100), "88", fill=COL_EMERALD, font=big_font)
        draw.text((sx + 200, sy + 150), "/ 100", fill=(150, 155, 170), font=load_font(40, bold=True))

        # Status badge
        draw_rounded_rect(draw, [sx + 50, sy + 250, sx + 450, sy + 305], 16, fill=(30, 55, 40))
        draw.text((sx + 75, sy + 266), "✓ HIGH HIRING PROBABILITY", fill=COL_EMERALD, font=load_font(20, bold=True))

        # Summary detail
        draw.text((sx + 50, sy + 340), "• Candidate articulated distributed locks", fill=(200, 205, 215), font=load_font(18, bold=False))
        draw.text((sx + 50, sy + 375), "• Proper STAR structure demonstrated", fill=(200, 205, 215), font=load_font(18, bold=False))
        draw.text((sx + 50, sy + 410), "• Concise handling of race conditions", fill=(200, 205, 215), font=load_font(18, bold=False))

    # Right: Rubric Progress Bars & Actionable AI Feedback
    rx = 660
    rw = 1140
    ry = 205
    rh = 480

    rubrics = [
        ("Technical Depth & Concurrency Accuracy", 92, COL_EMERALD),
        ("STAR Methodology & Response Structure", 86, COL_EMERALD),
        ("System Architecture & Scalability", 88, COL_EMERALD),
        ("Communication Clarity & Conciseness", 85, COL_AMBER),
    ]

    draw_rounded_rect(draw, [rx, ry, rx + rw, ry + rh], 24, fill=(24, 26, 36), outline=(60, 65, 85), width=2)
    draw.text((rx + 45, ry + 35), "GRADING RUBRIC BREAKDOWN", fill=COL_WHITE, font=load_font(24, bold=True))

    for ri, (rub_name, target_score, r_color) in enumerate(rubrics):
        r_prog = min(1.0, max(0.0, (progress - 0.25 - ri * 0.1) / 0.2))
        if r_prog <= 0: continue
        r_ease = ease_out_cubic(r_prog)
        bar_y = ry + 95 + ri * 65

        draw.text((rx + 45, bar_y), rub_name, fill=(210, 215, 225), font=load_font(20, bold=False))

        # Bar track
        bx = rx + 45
        by = bar_y + 30
        bw = rw - 180
        bh = 16
        draw_rounded_rect(draw, [bx, by, bx + bw, by + bh], 8, fill=(45, 48, 60))

        # Filled bar
        curr_score = int(target_score * r_ease)
        fill_w = int(bw * curr_score / 100)
        if fill_w > 0:
            draw_rounded_rect(draw, [bx, by, bx + fill_w, by + bh], 8, fill=r_color)

        draw.text((bx + bw + 20, by - 6), f"{curr_score}%", fill=COL_WHITE, font=load_font(22, bold=True))

    # Actionable Suggestion Box at bottom of right card
    if progress > 0.7:
        sug_y = ry + 365
        draw_rounded_rect(draw, [rx + 45, sug_y, rx + rw - 45, sug_y + 90], 14, fill=(35, 30, 25), outline=(90, 75, 45), width=1)
        draw.text((rx + 65, sug_y + 18), "💡 ACTIONABLE FEEDBACK FOR IMPROVEMENT:", fill=COL_AMBER, font=load_font(18, bold=True))
        draw.text((rx + 65, sug_y + 48), "Explicitly explain lock release failure semantics and how Redis keys expire to avoid deadlocks.", fill=(230, 225, 215), font=load_font(18, bold=False))

def render_scene_9(img, draw, progress, scene_frames, frame_in_scene):
    """Scene 9: Longitudinal Analytics (146s-160s)"""
    img.paste(Image.fromarray(BG_DARK_VERTICAL), (0, 0))

    draw.text((120, 85), "LONGITUDINAL PERFORMANCE ANALYTICS", fill=COL_BLUE, font=load_font(24, bold=True))
    draw.text((120, 120), "Track Competency Growth Across Multiple Mock Rounds", fill=COL_WHITE, font=load_font(42, bold=True))

    # Analytics Dashboard Card
    card_x, card_y = 120, 205
    card_w, card_h = 1680, 480
    draw_rounded_rect(draw, [card_x, card_y, card_x + card_w, card_y + card_h], 24, fill=(24, 26, 36), outline=(55, 60, 80), width=2)

    # 3 Stat Cards on Left
    stats = [
        ("MOCK SESSIONS", "3 Completed", COL_BLUE),
        ("INTERVIEW READINESS", "64% → 88%", COL_EMERALD),
        ("CORE TOPIC COVERAGE", "92% Mastered", COL_PURPLE),
    ]
    for si, (st_label, st_val, st_col) in enumerate(stats):
        sy = card_y + 40 + si * 135
        draw_rounded_rect(draw, [card_x + 40, sy, card_x + 460, sy + 115], 16, fill=(32, 34, 46), outline=(60, 65, 85), width=1)
        draw.text((card_x + 65, sy + 22), st_label, fill=(140, 145, 160), font=load_font(18, bold=True))
        draw.text((card_x + 65, sy + 55), st_val, fill=st_col, font=load_font(34, bold=True))

    # Trend Chart on Right
    chart_x = card_x + 520
    chart_y = card_y + 50
    chart_w = card_w - 560
    chart_h = 390

    draw.text((chart_x, chart_y), "HISTORICAL READINESS TRAJECTORY", fill=COL_WHITE, font=load_font(22, bold=True))

    # Grid lines
    for gy in range(4):
        gl_y = chart_y + 70 + gy * 75
        draw.line([(chart_x, gl_y), (chart_x + chart_w - 40, gl_y)], fill=(45, 48, 62), width=1)
        score_lbl = f"{100 - gy * 20}%"
        draw.text((chart_x + chart_w - 30, gl_y - 10), score_lbl, fill=(120, 125, 140), font=load_font(16, bold=False))

    # Plot Points (Session 1: 64%, Session 2: 76%, Session 3: 88%)
    points = [
        (chart_x + 100, chart_y + 70 + int((100 - 64) / 60 * 225), "Session 1: 64%"),
        (chart_x + 420, chart_y + 70 + int((100 - 76) / 60 * 225), "Session 2: 76%"),
        (chart_x + 740, chart_y + 70 + int((100 - 88) / 60 * 225), "Session 3: 88%"),
    ]

    p_prog = min(1.0, max(0.0, (progress - 0.2) / 0.6))
    if p_prog > 0:
        # Draw connecting line
        draw.line([points[0][:2], points[1][:2]], fill=COL_BLUE, width=4)
        if p_prog > 0.5:
            draw.line([points[1][:2], points[2][:2]], fill=COL_EMERALD, width=4)

        for px, py, plbl in points:
            draw.ellipse([px - 10, py - 10, px + 10, py + 10], fill=COL_WHITE, outline=COL_EMERALD, width=4)
            draw_rounded_rect(draw, [px - 70, py - 45, px + 70, py - 15], 8, fill=(35, 40, 55))
            draw.text((px - 58, py - 40), plbl, fill=COL_WHITE, font=load_font(16, bold=True))

def render_scene_10(img, draw, progress, scene_frames, frame_in_scene):
    """Scene 10: Multi-Model AI Engine (160s-173s)"""
    img.paste(Image.fromarray(BG_DARK_VERTICAL), (0, 0))

    draw.text((120, 85), "MULTI-MODEL FLEXIBILITY & ZERO LOCK-IN", fill=COL_PURPLE, font=load_font(24, bold=True))
    draw.text((120, 120), "Choose Any Frontier LLM or Bring Your Own Keys", fill=COL_WHITE, font=load_font(42, bold=True))

    providers = [
        ("Google Gemini 2.5", "Pro & Flash Models", "Native multimodal reasoning, 1M context window", COL_BLUE, "ACTIVE"),
        ("OpenAI GPT-4o", "Omni Reasoning Engine", "High-precision code analysis & structured STAR grading", COL_EMERALD, "READY"),
        ("Anthropic Claude", "Claude 3.5 Sonnet", "Industry-leading nuance & system design explanations", (220, 140, 60), "READY"),
        ("Groq Hardware LPU", "Llama 3.3 70B Versatile", "Ultra-low latency inference (300+ tokens/sec)", COL_CORAL, "READY"),
    ]

    pw = 790
    ph = 220
    px_base = 120
    py_base = 205

    for pi, (name, tag, desc, color, status) in enumerate(providers):
        p_prog = min(1.0, max(0.0, (progress - 0.15 - pi * 0.12) / 0.2))
        if p_prog <= 0: continue
        pe = ease_out_back(p_prog)
        col_idx = pi % 2
        row_idx = pi // 2
        px = px_base + col_idx * (pw + 50)
        py = py_base + row_idx * (ph + 35) + int((1.0 - pe) * 30)

        draw_rounded_rect(draw, [px, py, px + pw, py + ph], 20, fill=(26, 28, 38), outline=(60, 65, 85), width=2)
        draw_rounded_rect(draw, [px, py, px + 8, py + ph], 4, fill=color)

        draw.text((px + 35, py + 30), name, fill=COL_WHITE, font=load_font(30, bold=True))
        draw.text((px + 35, py + 72), tag, fill=color, font=load_font(20, bold=True))
        draw.text((px + 35, py + 115), desc, fill=(180, 185, 200), font=load_font(20, bold=False))

        # Status badge
        s_col = COL_EMERALD if status == "ACTIVE" else (100, 105, 120)
        draw_rounded_rect(draw, [px + pw - 140, py + 30, px + pw - 30, py + 68], 10, fill=(35, 40, 50))
        draw.text((px + pw - 122, py + 38), status, fill=s_col, font=load_font(18, bold=True))

    # Bottom Pill
    if progress > 0.7:
        draw_rounded_rect(draw, [120, 715, 120 + 1630, 765], 14, fill=(30, 32, 44), outline=(60, 65, 85), width=1)
        draw.text((150, 726), "🔒 100% Privacy-Preserving: Your API keys are stored locally and never shared with third parties.", fill=(190, 195, 210), font=load_font(20, bold=False))

def render_scene_11(img, draw, progress, scene_frames, frame_in_scene):
    """Scene 11: Climax & Call to Action (173s-180s)"""
    img.paste(Image.fromarray(BG_OBSIDIAN_GLOW), (0, 0))

    # Floating energy particles
    num_particles = 32
    for pi in range(num_particles):
        seed = pi * 137
        px = int((math.sin(seed + frame_in_scene * 0.03) * 0.5 + 0.5) * W)
        py = int((math.cos(seed * 0.7 + frame_in_scene * 0.02) * 0.5 + 0.5) * H)
        p_alpha = int(120 + 100 * math.sin(seed + frame_in_scene * 0.1))
        draw.ellipse([px, py, px + 5, py + 5], fill=(COL_CORAL[0], COL_CORAL[1], COL_CORAL[2]))

    # Brand Title
    b_prog = min(1.0, max(0.0, progress / 0.3))
    be = ease_out_back(b_prog)
    by = 310 + int((1.0 - be) * 50)

    brand_font = load_font(88, bold=True)
    bt = "InterviewAce."
    bbb = draw.textbbox((0, 0), bt, font=brand_font)
    bw = bbb[2] - bbb[0]
    bx = (W - bw) // 2

    draw.text((bx, by), bt, fill=COL_WHITE, font=brand_font)
    # Glowing dot
    dot_x = bx + bw - 20
    dot_y = by + 56
    draw.ellipse([dot_x, dot_y, dot_x + 22, dot_y + 22], fill=COL_VERMILION)

    # Tagline
    tagline_font = load_font(36, bold=False)
    tt = "Turn Preparation Into Offers."
    tbb = draw.textbbox((0, 0), tt, font=tagline_font)
    draw.text(((W - (tbb[2] - tbb[0])) // 2, by + 115), tt, fill=COL_CORAL, font=tagline_font)

    # Big CTA Button
    btn_prog = min(1.0, max(0.0, (progress - 0.25) / 0.3))
    if btn_prog > 0:
        btn_w, btn_h = 560, 75
        btn_x = (W - btn_w) // 2
        btn_y = by + 210
        draw_rounded_rect(draw, [btn_x, btn_y, btn_x + btn_w, btn_y + btn_h], 38, fill=COL_VERMILION, outline=(255, 120, 80), width=2)
        btn_text = "Start Your Session at localhost:3000"
        btn_font = load_font(26, bold=True)
        bb = draw.textbbox((0, 0), btn_text, font=btn_font)
        draw.text(((W - (bb[2] - bb[0])) // 2, btn_y + 22), btn_text, fill=COL_WHITE, font=btn_font)

    # Hackathon badge
    if progress > 0.5:
        h_text = "InterviewAce · Tricity Hackathon 2026 Submission"
        h_font = load_font(20, bold=False)
        hbb = draw.textbbox((0, 0), h_text, font=h_font)
        draw.text(((W - (hbb[2] - hbb[0])) // 2, H - 100), h_text, fill=(140, 145, 160), font=h_font)


SCENE_RENDERERS = [
    render_scene_1,
    render_scene_2,
    render_scene_3,
    render_scene_4,
    render_scene_5,
    render_scene_6,
    render_scene_7,
    render_scene_8,
    render_scene_9,
    render_scene_10,
    render_scene_11,
]


# ==============================================================================
# PHASE 7: MASTER VIDEO ENCODING (Burned & Clean Cuts)
# ==============================================================================
def render_video(frame_map, total_frames, total_duration, audio_path, output_path, burn_captions=True):
    mode_str = "Master Cut (Burned Captions)" if burn_captions else "Clean Cut (No Captions)"
    print("\n" + "=" * 60)
    print(f"[PHASE 7] Rendering {mode_str}: {total_frames} frames ({total_duration:.1f}s)")
    print("=" * 60)

    # Caption lookup table: frame_idx -> (text, is_dark)
    caption_lookup = {}
    if burn_captions:
        for fm in frame_map:
            sc = SCENES[fm["scene_index"]]
            words = fm["global_words"]
            if not words: continue
            caps = sc["captions"]
            chunk = max(1, len(words) // len(caps))

            w_idx = 0
            for ci, c_text in enumerate(caps):
                if w_idx >= len(words): break
                end_w = len(words) - 1 if ci == len(caps) - 1 else min(w_idx + chunk, len(words) - 1)
                sf = int(words[w_idx]["start"] * FPS)
                ef = int((words[end_w]["end"] + 0.35) * FPS)
                for f in range(sf, ef):
                    caption_lookup[f] = (c_text, sc["bg"] == "dark")
                w_idx = end_w + 1

    cmd = [
        FFMPEG, "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-s", f"{W}x{H}",
        "-pix_fmt", "rgb24",
        "-r", str(FPS),
        "-i", "-",
        "-i", audio_path,
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "18",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "256k",
        "-shortest",
        output_path
    ]

    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    start_time = time.time()
    last_img = None

    for fi in range(total_frames):
        # Determine active scene
        active_fm = frame_map[-1]
        for fm in frame_map:
            if fm["start_frame"] <= fi < fm["end_frame"]:
                active_fm = fm
                break
            if fi < fm["start_frame"]:
                break

        s_idx = active_fm["scene_index"]
        frame_in_scene = fi - active_fm["start_frame"]
        s_total = max(1, active_fm["total_frames"])
        progress = max(0.0, min(1.0, frame_in_scene / float(s_total)))

        img = Image.new("RGB", (W, H), COL_OBSIDIAN)
        draw = ImageDraw.Draw(img)

        # Render scene visual
        SCENE_RENDERERS[s_idx](img, draw, progress, s_total, frame_in_scene)

        # Burn caption if active
        if burn_captions and fi in caption_lookup:
            c_text, is_dark = caption_lookup[fi]
            draw_caption(img, draw, c_text, is_dark_bg=is_dark)

        # Crossfade transition between scenes
        if frame_in_scene < CROSSFADE_FRAMES and last_img is not None and fi > 0:
            alpha = frame_in_scene / float(CROSSFADE_FRAMES)
            img = Image.blend(last_img, img, alpha)

        last_img = img
        proc.stdin.write(img.tobytes())

        if fi % 200 == 0 or fi == total_frames - 1:
            pct = int(fi / total_frames * 100)
            elapsed = time.time() - start_time
            fps_speed = fi / max(0.001, elapsed)
            eta = (total_frames - fi) / max(0.1, fps_speed)
            print(f"    [{pct:3d}%] Frame {fi:5d}/{total_frames} ({fi/FPS:.1f}s) -- {fps_speed:.1f} fps, ETA {eta:.0f}s", flush=True)

    proc.stdin.close()
    stderr = proc.stderr.read()
    proc.wait()

    if proc.returncode != 0:
        raise RuntimeError(f"FFmpeg encoding error: {stderr.decode('utf-8', errors='ignore')}")

    size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"  [OK] Rendered successfully: {output_path} ({size_mb:.2f} MB)")


# ==============================================================================
# MAIN ENTRYPOINT
# ==============================================================================
def main():
    print("=" * 60)
    print("InterviewAce -- Full 3-Minute Master Cut Video Generator")
    print("============================================================")

    # 1. Generate Voice-Over per scene
    generate_voiceover_scenes()

    # 2 & 3. Measure Audio & Assemble Master Timeline
    frame_map, total_frames, total_duration = build_timeline_and_vo_master()

    # 4. Generate layered soundtrack bed
    generate_soundtrack(total_duration)

    # 5. Dynamic audio ducking & mastering
    mixed_audio = mix_audio(total_duration)

    # 6. Generate SRT & VTT captions
    generate_captions(frame_map)

    # 7. Render Master Video with Burned Captions
    render_video(frame_map, total_frames, total_duration, mixed_audio, FINAL_PATH, burn_captions=True)

    # 8. Render Clean Cut (No Burned Captions)
    render_video(frame_map, total_frames, total_duration, mixed_audio, CLEAN_PATH, burn_captions=False)

    # Copy master to launch-video.mp4
    import shutil
    shutil.copyfile(FINAL_PATH, MAIN_PATH)
    print(f"\n[OK] Copied master -> {MAIN_PATH}")

    print("\n" + "=" * 60)
    print("[SUCCESS] All 3-Minute Video Deliverables Ready!")
    print("=" * 60)
    for lbl, p in [
        ("Master Video (Burned)", FINAL_PATH),
        ("Clean Video (No Captions)", CLEAN_PATH),
        ("Primary Output", MAIN_PATH),
        ("Subtitles (SRT)", SRT_PATH),
        ("Subtitles (VTT)", VTT_PATH),
        ("Voice-Over Master Stem", VO_MASTER_PATH),
        ("Soundtrack Bed Stem", SOUNDTRACK_PATH),
    ]:
        if os.path.exists(p):
            sz = os.path.getsize(p)
            unit = "MB" if sz > 1024*1024 else "KB"
            val = sz / (1024*1024) if unit == "MB" else sz / 1024
            print(f"  {lbl:28s} -> {p} ({val:.1f} {unit})")

if __name__ == "__main__":
    main()
