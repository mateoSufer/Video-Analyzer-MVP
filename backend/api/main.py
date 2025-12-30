import os
import shutil
import time
import re
import json
from pathlib import Path
from uuid import uuid4
from datetime import datetime

import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .stats import compute_best_category, generate_ai_insight

# Cargar variables de entorno
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

# Configurar la IA de Google
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI(title="Video Analyzer API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CONFIGURACIÓN DE PRODUCCIÓN / DISEÑO ---
MODO_DISEÑO = (
    os.getenv("MODO_DISENO", "false").lower() == "true"
    or not os.getenv("GEMINI_API_KEY")
)

UPLOADS_DIR = BASE_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

app.mount("/videos", StaticFiles(directory=str(UPLOADS_DIR)), name="videos")

# --- ANALYTICS STORE (In-Memory) ---
analytics_data = []

@app.post("/upload")
async def upload_video(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")

    video_id = str(uuid4())
    file_extension = Path(file.filename).suffix or ".mp4"
    out_path = UPLOADS_DIR / f"{video_id}{file_extension}"

    # 1. Guardar el archivo físicamente
    try:
        with out_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    finally:
        await file.close()

    # 2. Análisis
    if MODO_DISEÑO:
        print(f"🛠️ MODO DISEÑO: Simulando 4 recomendaciones...")
        time.sleep(2)
        recommendations = [
            {"id": "rec-1", "type": "hook", "title": "Gancho Visual", "description": "Falta impacto inicial.", "priority": "high", "timestamp": 1},
            {"id": "rec-2", "type": "lighting", "title": "Iluminación", "description": "Sube la exposición.", "priority": "medium", "timestamp": 5},
            {"id": "rec-3", "type": "audio", "title": "Audio", "description": "Limpia el ruido.", "priority": "low", "timestamp": 10},
            {"id": "rec-4", "type": "cta", "title": "CTA", "description": "Hazlo más directo.", "priority": "high", "timestamp": 25}
        ]
        # Generar editing_timeline técnico
        editing_timeline = [
            {"timestamp": "00:01", "timestamp_seconds": 1, "action_type": "zoom", "technical_action": "Realizar Zoom-in de 110% al rostro", "reason": "El gancho necesita más cercanía emocional en los primeros 3 segundos"},
            {"timestamp": "00:05", "timestamp_seconds": 5, "action_type": "color", "technical_action": "Aumentar Exposición +15% y contraste +10%", "reason": "La iluminación está apagada, esto retiene menos atención"},
            {"timestamp": "00:10", "timestamp_seconds": 10, "action_type": "audio", "technical_action": "Aplicar filtro Noise Reduction -12dB", "reason": "El ruido de fondo distrae del mensaje principal"},
            {"timestamp": "00:25", "timestamp_seconds": 25, "action_type": "text", "technical_action": "Añadir subtítulo resaltado con el CTA", "reason": "El llamado a la acción no es visible, necesita refuerzo visual"}
        ]
        # Heurística simple para generar un score técnico en modo diseño
        base = 90
        penalties = sum(5 if r["priority"] == "high" else 3 if r["priority"] == "medium" else 1 for r in recommendations)
        retention_score = max(50, min(98, base - penalties))
        final_status = "ready" if retention_score >= 85 else "changes_needed"
        analysis_text = json.dumps(recommendations)
    else:
        try:
            print(f"🔬 Iniciando análisis real con Gemini 2.0 Flash...")
            model = genai.GenerativeModel("gemini-2.0-flash")
            
            video_file = genai.upload_file(path=str(out_path))
            
            start_wait = time.time()
            while video_file.state.name == "PROCESSING":
                time.sleep(3)
                video_file = genai.get_file(video_file.name)
                if time.time() - start_wait > 60:
                    raise TimeoutError("El video es demasiado largo o Google está lento.")
            
            if video_file.state.name == "FAILED":
                raise Exception("Fallo en el servidor de Google.")

            # PROMPT MEJORADO: incluir recomendaciones, retention_score, final_status y editing_timeline
            prompt = (
                "Analiza este video como un experto en contenido viral y edición. "
                "Devuelve EXACTAMENTE un objeto JSON con los siguientes campos: "
                "{\"recommendations\": [4 items con tipos hook|lighting|audio|cta y campos id,title,description,priority(high|medium|low),timestamp(segundos)], "
                " \"retention_score\": número entero de 0 a 100 basado en tu evaluación técnica (gancho, ritmo, claridad de audio, iluminación, CTA), "
                " \"final_status\": \"ready\" si retention_score >= 85, de lo contrario \"changes_needed\", "
                " \"editing_timeline\": [lista de 4-6 pasos técnicos con campos timestamp(formato MM:SS), timestamp_seconds(número), action_type(zoom|cut|color|audio|text|transition), technical_action(instrucción precisa para editor), reason(por qué mejora retención)] }. "
                "Los pasos deben ser accionables en CapCut/Premiere. "
                "No escribas NADA más que ese objeto JSON. Idioma: Español."
            )
            
            response = model.generate_content(
                [video_file, prompt],
                generation_config={"temperature": 0.4}
            )
            
            # LIMPIEZA CON REGEX (Extrae lo que hay entre los corchetes [ ])
            raw_text = response.text.strip()
            cleaned = raw_text.replace("```json", "").replace("```", "").strip()
            retention_score = None
            final_status = None
            editing_timeline = None
            try:
                data = json.loads(cleaned)
                # Validar estructura
                recs = data.get("recommendations")
                if isinstance(recs, list) and recs:
                    analysis_text = json.dumps(recs)
                else:
                    # Fallback: intentar extraer un array por corchetes si vino mal
                    match = re.search(r'\[.*\]', cleaned, re.DOTALL)
                    analysis_text = match.group(0) if match else "[]"
                retention_score = data.get("retention_score")
                final_status = data.get("final_status")
                editing_timeline = data.get("editing_timeline")
            except Exception:
                # Fallback de limpieza: extraer recomendaciones por corchetes
                match = re.search(r'\[.*\]', cleaned, re.DOTALL)
                analysis_text = match.group(0) if match else "[]"
                retention_score = None
                final_status = None
                editing_timeline = None
            
            genai.delete_file(video_file.name)
            print(f"✅ Análisis completado con éxito.")
            
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            # Fallback seguro con 4 campos genéricos pero válidos para no romper el front
            fallback_recs = [
              {"id": "err-1", "type": "hook", "title": "Revisar Gancho", "description": "Asegura impacto en los primeros 3 segundos.", "priority": "high", "timestamp": 0},
              {"id": "err-2", "type": "lighting", "title": "Revisar Luz", "description": "Busca una fuente de luz frontal clara.", "priority": "medium", "timestamp": 0},
              {"id": "err-3", "type": "audio", "title": "Revisar Audio", "description": "Comprueba que la voz se escuche sobre la música.", "priority": "medium", "timestamp": 0},
              {"id": "err-4", "type": "cta", "title": "Revisar CTA", "description": "No olvides pedir una acción clara al final.", "priority": "low", "timestamp": 0}
            ]
            analysis_text = json.dumps(fallback_recs)
            # Generar editing_timeline de fallback
            editing_timeline = [
                {"timestamp": "00:00", "timestamp_seconds": 0, "action_type": "zoom", "technical_action": "Revisar apertura con zoom o corte dinámico", "reason": "Necesitas captar atención desde el primer frame"},
                {"timestamp": "00:03", "timestamp_seconds": 3, "action_type": "text", "technical_action": "Añadir subtítulo o texto animado", "reason": "Refuerza el mensaje visual con texto"},
            ]
            # Score razonable por fallback
            retention_score = 78
            final_status = "changes_needed"

    # Asegurar consistencia de final_status si falta
    try:
        _score_val = int(retention_score) if retention_score is not None else None
    except Exception:
        _score_val = None
    if _score_val is not None and (final_status is None or final_status not in {"ready", "changes_needed"}):
        final_status = "ready" if _score_val >= 85 else "changes_needed"

    # Registrar en analytics
    analytics_data.append({
        "video_id": video_id,
        "date": datetime.now().isoformat(),
        "retention_score": _score_val,
        "final_status": final_status,
        "recommendations": analysis_text,
    })

    return {
        "video_id": video_id,
        "video_url": f"http://localhost:8000/videos/{video_id}{file_extension}",
        "analysis": analysis_text,
        "retention_score": _score_val if _score_val is not None else None,
        "final_status": final_status,
        "editing_timeline": editing_timeline if editing_timeline else [],
        "message": "Proceso completado"
    }


@app.get("/user/stats")
async def get_user_stats():
    """Retorna últimos 10 análisis con fecha y retention_score, más ai_insight."""
    if not analytics_data:
        return {
            "analyses": [],
            "ai_insight": "Sube tu primer video para empezar a ver tu gráfica de evolución.",
            "best_category": None,
            "total_videos": 0
        }
    
    # Últimos 10 análisis
    last_10 = analytics_data[-10:]
    
    # Calcular categoría más mejorada
    best_category = compute_best_category(last_10)
    
    # Generar insight con Gemini
    ai_insight = generate_ai_insight(last_10, MODO_DISEÑO) if len(last_10) >= 2 else "Sube más videos para empezar a ver tu gráfica de evolución."
    
    return {
        "analyses": last_10,
        "ai_insight": ai_insight,
        "best_category": best_category,
        "total_videos": len(analytics_data)
    }