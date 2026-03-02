# Garment metrics — spec formulas reference

All eight metrics are normalized to **0–1**. Formulas use the **fixed normalization bounds** and variable norms below. Clamp all final metric values to `[0, 1]`.

---

## Fixed normalization bounds

| Variable | Fixed value | Notes |
|----------|-------------|--------|
| **Tmin** | −10 °C | Cold end of temperature range |
| **Tmax** | 40 °C | Hot end of temperature range |
| **max_wind_speed** | 20 m/s | wind_norm = wind_speed / 20, cap at 1 |
| **max_humidity** | 100 % | humidity_norm = humidity_pct / 100 |
| **max_exposure** | 8 h | Outdoor exposure; exposure_norm = outdoor_hours / 8, cap at 1 |
| **max_activity_intensity** | 1.0 | When activity is 0–1 from LLM, use as-is |

---

## 1. Fit

**Orientation:** 0 = close/tight, 1 = loose/relaxed

**Formula:**
```
Fit = 1 - [0.30 * temp_norm - 0.25 * activity_norm + 0.15 * (1 - comfort_pref_norm) + 0.20 * containment_norm + 0.10 * spatial_norm]
```

| Type | Factor | Example source | Weight | Influence |
|------|--------|----------------|--------|-----------|
| Environmental/Temp | Ambient temperature (°C/°F) | weather API | 0.30 | Colder → closer (↓ fit) |
| Activity | Activity intensity | text analysis / movement sensor | 0.25 | Higher intensity → looser (↑ fit) |
| Personal | Comfort preference (loose ↔ tight) | user profile / LLM | 0.15 | Prefers tight → closer (↓ fit) |
| Psychological | Need for containment / security | sentiment analysis / LLM | 0.20 | Higher need → closer (↓ fit) |
| Spatial | Indoor / outdoor context | route classification | 0.10 | Outdoor → closer (↓ fit) |

**Variable normalization:**
- `temp_norm` = (Tmax − Tcurrent) / (Tmax − Tmin) → colder = higher
- `activity_norm` = activity_intensity / max_activity_intensity
- `comfort_pref_norm` = 0 (tight) → 1 (loose)
- `containment_norm` = 0 (low need) → 1 (high need)
- `spatial_norm` = 0 (indoor) → 1 (outdoor)

---

## 2. Mesh

**Orientation:** 0 = open/coarse, 1 = fine/tight

**Formula:**
```
Mesh = 0.35 * temp_norm + 0.25 * (1 - activity_norm) + 0.20 * formality_norm + 0.20 * aesthetic_norm
```

| Type | Factor | Example source | Weight | Influence |
|------|--------|----------------|--------|-----------|
| Environmental/Temp | Ambient temperature (°C/°F) | weather API | 0.35 | Colder → finer mesh (↑ mesh) |
| Activity | Activity intensity | text analysis | 0.25 | Higher intensity → coarser (↓ mesh) |
| Social | Formality of situation | text keywords / LLM | 0.20 | More formal → finer (↑ mesh) |
| Aesthetic | Desired visual style (sleek ↔ airy) | text sentiment / LLM | 0.20 | Sleek → finer (↑), airy → coarser (↓) |

**Variable normalization:**
- `temp_norm` = (Tmax − Tcurrent) / (Tmax − Tmin) → colder = closer to 1
- `activity_norm` = activity_intensity / max_activity_intensity
- `formality_norm` = 0 (casual) → 1 (formal)
- `aesthetic_norm` = 0 (airy) → 1 (sleek)

---

## 3. Thickness

**Orientation:** 0 = thin, 1 = thick

**Formula:**
```
Thickness = 0.50 * temp_norm + 0.25 * wind_norm + 0.25 * exposure_norm
```

| Type | Factor | Example source | Weight | Influence |
|------|--------|----------------|--------|-----------|
| Environmental | Ambient temperature (°C/°F) | weather API | 0.50 | Colder → thicker (↑ thickness) |
| Environmental | Wind speed (m/s) | weather API | 0.25 | Stronger wind → thicker (↑ thickness) |
| Temporal | Duration of outdoor exposure | text / time per segment | 0.25 | Longer duration → thicker (↑ thickness) |

**Variable normalization:**
- `temp_norm` = (Tmax − Tcurrent) / (Tmax − Tmin) → colder = closer to 1
- `wind_norm` = wind_speed / max_wind_speed
- `exposure_norm` = exposure_time / max_exposure

---

## 4. Airflow

**Orientation:** 0 = most breathable, 1 = least breathable

**Formula:**
```
Airflow = 1 - [0.35 * temp_norm + 0.25 * humidity_norm + 0.25 * activity_norm - 0.15 * outdoor_norm]
```

| Type | Factor | Example source | Weight | Influence |
|------|--------|----------------|--------|-----------|
| Environmental | Ambient temperature (°C/°F) | weather API | 0.35 | Hotter → more breathable (↓ airflow) |
| Environmental | Humidity level (%) | weather API | 0.25 | Higher humidity → more breathable (↓ airflow) |
| Behavioral | Activity intensity | text analysis | 0.25 | Higher intensity → more breathable (↓ airflow) |
| Spatial | Indoor / outdoor context | text / route classification | 0.15 | Outdoor → less breathable (↑ airflow) |

**Variable normalization:**
- `temp_norm` = (Tcurrent − Tmin) / (Tmax − Tmin) → hotter = closer to 1
- `humidity_norm` = humidity / max_humidity
- `activity_norm` = activity_intensity / max_activity_intensity
- `outdoor_norm` = 0 (indoor) → 1 (outdoor)

---

## 5. Support

**Orientation:** 0 = soft/flexible, 1 = rigid/structured

**Formula:**
```
Support = 0.35 * demand_norm + 0.25 * stability_norm + 0.25 * formality_norm + 0.15 * wind_norm
```

| Type | Factor | Example source | Weight | Influence |
|------|--------|----------------|--------|-----------|
| Behavioral | Physical demand (standing, walking, carrying) | text / LLM | 0.35 | More demand → ↑ support |
| Psychological | Emotional stability need (fatigue, anxiety) | text sentiment / LLM | 0.25 | More need → ↑ support |
| Social | Formality / presence | text keywords / LLM | 0.25 | More formal → ↑ support |
| Environmental | Wind / instability | weather API | 0.15 | Harsher conditions → ↑ support |

**Variable normalization:**
- `demand_norm` = 0 (rest / sitting) → 1 (active / long standing)
- `stability_norm` = 0 (calm / confident) → 1 (needs support)
- `formality_norm` = 0 (casual) → 1 (formal)
- `wind_norm` = wind_speed / max_wind_speed

---

## 6. Comfort (Option A)

**Orientation:** 0 = utilitarian / minimal comfort focus, 1 = indulgent / strong comfort or aesthetic preference

**Formula:**
```
Comfort = 0.30 * occasion_norm + 0.25 * self_care_norm + 0.25 * sensory_norm + 0.20 * aesthetic_norm
```

| Type | Factor | Example source | Weight | Influence |
|------|--------|----------------|--------|-----------|
| Social | Occasion (casual → special) | text / LLM | 0.30 | More special → higher comfort |
| Personal | Self-care intent (low → high) | text / LLM | 0.25 | Higher intent → higher comfort |
| Sensory | Softness / coziness (functional → cozy) | text / LLM | 0.25 | Cozy/soft → higher comfort |
| Aesthetic | Plain → expressive | text / LLM | 0.20 | More expressive → higher comfort |

**Variable normalization:**
- `occasion_norm` = 0 (casual) → 1 (special)
- `self_care_norm` = 0 (low) → 1 (high)
- `sensory_norm` = 0 (functional) → 1 (cozy/soft)
- `aesthetic_norm` = 0 (plain) → 1 (expressive)

---

## 7. DressLength (Option A)

**Orientation:** 0 = short (mini, above knee), 1 = long (midi, maxi, floor)

**Formula:**
```
DressLength = 0.30 * formality_norm + 0.25 * occasion_norm + 0.25 * temp_norm + 0.20 * length_explicit_norm
```

| Type | Factor | Example source | Weight | Influence |
|------|--------|----------------|--------|-----------|
| Social | Formality (casual → formal) | text / LLM | 0.30 | More formal → longer |
| Social | Occasion (everyday → formal/special) | text / LLM | 0.25 | More formal/special → longer |
| Environmental | Temperature (cold → long) | weather API | 0.25 | Colder → longer |
| Explicit | User says “mini”, “maxi”, etc. | text / LLM | 0.20 | Explicit length preference |

**Variable normalization:**
- `formality_norm` = 0 (casual) → 1 (formal)
- `occasion_norm` = 0 (everyday) → 1 (formal/special)
- `temp_norm` = (Tmax − Tcurrent) / (Tmax − Tmin) → colder = closer to 1
- `length_explicit_norm` = 0 (short) → 1 (long); default 0.5 when unspecified

---

## 8. DressSize / Hem width (Option A)

**Orientation:** 0 = narrow hem (fitted, pencil, sheath), 1 = wide hem (A-line, circle, full skirt)

**Formula:**
```
DressSize = 0.30 * occasion_norm + 0.25 * (1 - activity_norm) + 0.25 * aesthetic_norm + 0.20 * movement_norm
```

| Type | Factor | Example source | Weight | Influence |
|------|--------|----------------|--------|-----------|
| Social | Occasion (casual → formal/ball) | text / LLM | 0.30 | More formal → wider hem |
| Behavioral | Activity (high → narrow) | text / LLM | 0.25 | Higher activity → narrower (1 − activity_norm) |
| Aesthetic | Sleek ↔ dramatic/romantic | text / LLM | 0.25 | Dramatic/romantic → wider |
| Behavioral | Movement (constrained → easy) | text / LLM | 0.20 | Easy movement → can suggest flare |

**Variable normalization:**
- `occasion_norm` = 0 (casual) → 1 (formal/special)
- `activity_norm` = 0 (low) → 1 (high)
- `aesthetic_norm` = 0 (sleek/minimal) → 1 (dramatic/voluminous)
- `movement_norm` = 0 (constrained) → 1 (easy movement)

---

## Summary: data sources per metric

| Metric | API (weather / route) | LLM / text |
|--------|------------------------|------------|
| Fit | temp | activity, comfort_pref, containment, spatial (or route) |
| Mesh | temp | activity, formality, aesthetic |
| Thickness | temp, wind | exposure (or from segment time) |
| Airflow | temp, humidity | activity, outdoor (or route) |
| Support | wind | demand, stability, formality |
| Comfort | — | occasion, self_care, sensory, aesthetic |
| DressLength | temp | formality, occasion, length_explicit |
| DressSize | — | occasion, activity, aesthetic, movement |

---

*Reference: SYSTEMThermalSpec.pdf (Fit–Support); Comfort / DressLength / DressSize Option A specs.*
