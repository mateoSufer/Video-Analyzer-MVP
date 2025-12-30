# stats.py - Analytics endpoints for creator evolution dashboard
import json
import os
from typing import Optional, List, Dict, Any

import google.generativeai as genai


def compute_best_category(analyses: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Calcula la categoría (hook, lighting, audio, cta) con mayor mejoría."""
    if len(analyses) < 2:
        return None
    
    categories = {"hook": [], "lighting": [], "audio": [], "cta": []}
    
    for analysis in analyses:
        if "recommendations" in analysis:
            try:
                recs = json.loads(analysis["recommendations"]) if isinstance(analysis["recommendations"], str) else analysis["recommendations"]
                for rec in recs:
                    cat = rec.get("type", "").lower()
                    if cat in categories:
                        # Prioridad a puntuación inversa (high=5, medium=3, low=1; menor es mejor)
                        score = 5 if rec.get("priority") == "high" else 3 if rec.get("priority") == "medium" else 1
                        categories[cat].append(score)
            except:
                pass
    
    # Calcular mejora como diferencia entre primero y último
    improvements = {}
    for cat, scores in categories.items():
        if len(scores) >= 2:
            # Menor diferencia = mejora (porque lower priority scores are better)
            improvements[cat] = scores[0] - scores[-1]  # Positivo si bajó (mejoró)
    
    if improvements:
        best_cat = max(improvements, key=improvements.get)
        delta = improvements[best_cat]
        labels = {
            "hook": "Master del Gancho",
            "lighting": "Master de la Iluminación",
            "audio": "Master del Audio",
            "cta": "Master de Conversión"
        }
        return {
            "category": best_cat,
            "label": labels.get(best_cat, "Master Creator"),
            "improvement": delta
        }
    
    return None


def generate_ai_insight(analyses: List[Dict[str, Any]], modo_diseno: bool) -> str:
    """Usa Gemini para generar un insight motivador basado en los análisis."""
    if modo_diseno or not os.getenv("GEMINI_API_KEY"):
        # Fallback en modo diseño
        scores = [a.get("retention_score", 0) for a in analyses if "retention_score" in a]
        if len(scores) >= 2:
            improvement = scores[-1] - scores[0]
            if improvement > 0:
                return f"¡Excelente! Has mejorado {improvement}% en tus últimos {len(scores)} videos. Sigue con ese ritmo."
            else:
                return f"Analiza tus últimos {len(scores)} videos y encontrarás patrones para seguir creciendo."
        return "Sigue subiendo videos para ver tu progreso."
    
    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        
        # Preparar datos para la IA
        summary = ""
        for i, analysis in enumerate(analyses, 1):
            summary += f"Video {i}: score={analysis.get('retention_score', 0)}, fecha={analysis.get('date', 'N/A')}\n"
        
        prompt = (
            "Basándote en estos datos de análisis de videos, genera UNA SOLA frase motivadora y específica "
            "sobre el progreso del creador. Sé breve (máx 15 palabras), positivo y accionable. "
            "Datos:\n" + summary
        )
        
        response = model.generate_content(prompt, generation_config={"temperature": 0.7})
        return response.text.strip()
    except Exception as e:
        print(f"Error generating AI insight: {e}")
        return "Sigue creando videos y verás tu evolución."
