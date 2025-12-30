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
