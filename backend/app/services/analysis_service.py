def compare_skills(user_skills, requirements):
    # Normalize names to avoid case-only mismatches.
    user_map = {s.name.strip().lower(): s.level for s in user_skills}
    total = sum(max(1, r.required_level) for r in requirements)
    earned = 0
    matched, gaps = [], []
    for req in requirements:
        key = req.skill_name.strip().lower()
        level = user_map.get(key, 0)
        needed = req.required_level
        earned += min(level, needed)
        if level >= needed:
            matched.append(req.skill_name)
        else:
            gaps.append({
                "skill": req.skill_name,
                "current_level": level,
                "required_level": needed,
                "gap": needed - level,
                "importance": req.importance
            })
    score = round((earned / total) * 100, 1) if total else 0
    return score, matched, gaps
