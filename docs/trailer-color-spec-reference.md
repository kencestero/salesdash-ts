# Diamond Cargo Trailer Color & Spec Reference

## 📋 Exterior Skin Thickness

### `.080` = Polycore Composite
- ✅ High-end finish: sleeker, smoother, no oil-canning ripple
- ✅ Dent-resistant and UV-stable
- ✅ Popular for concession trailers and premium builds
- ❌ More expensive, harder to repair (full panel replacement)

### `.030` = Aluminum
- ✅ Standard build material, affordable
- ✅ Easier to repair, widely available
- ❌ Can ripple slightly over time (oil-canning)
- ✅ Good for budget-conscious customers

> **Rule:** If model code ends in `.080` → Polycore. If `.030` → Aluminum.

[Source: PolyCor vs Aluminum Trailer Comparison](https://www.diamondcargoinc.com/polycor-vs-aluminum-trailer/)

---

## 🎨 Color Code Reference

| Abbreviation | Full Color Name | Notes |
|--------------|----------------|-------|
| `W` | White | Standard white |
| `B` | Black | Blacked-out premium look |
| `R` | Red | |
| `SF` | Silver Frost | Metallic silver |
| `CG` | Charcoal Gray | Dark gray |
| `EB` | Emerald Black | Deep black with green tint |
| `ELG` | Electric Lime Green | High-visibility neon |
| `Y` | Yellow | |
| `AB` | Abyss Blue | Deep blue |
| `BW` | Black/White | 2-tone split |
| `IB` | Indigo Blue | |
| `ORG/B` | Orange/Black | 2-tone with ATP diamond divider |
| `EG` | Emerald Green | |
| `SF.030` | Silver Frost .030 | Aluminum skin |
| `CG.080` | Charcoal .080 | Polycore skin |

> **Multi-color trailers** like `ORG/B` use a two-tone split with ATP diamond divider strip.

---

## 📦 Model Code Format

### Example: `7X16TA2 B.080 R VN 7'`

| Element | Meaning |
|---------|---------|
| `7X16` | 7 feet wide × 16 feet long |
| `TA2` | Tandem Axle, 2 × 3500 lb axles |
| `B.080` | Black Polycore skin |
| `R` | Ramp door |
| `VN` | V-nose |
| `7'` | Interior height (7 feet) |

### Common Abbreviations

| Code | Description |
|------|-------------|
| `SA` | Single Axle |
| `TA` | Tandem Axle |
| `TA2` | Tandem Axle, 2 × 3500 lb |
| `DD` | Double Doors |
| `R` | Ramp Door |
| `VN` | V-Nose |
| `SVN` | Slant V-Nose |
| `SRW` | Screwless Exterior |
| `FF` | Flat Front |
| `TTT` | Triple Tube Tongue |

---

## 🔧 Implementation Notes

### For Inventory Parser:
```typescript
// Parse color from model code
const modelCode = "7X16TA2 B.080 R VN 7'";
const colorMatch = modelCode.match(/\s([A-Z]+)\.0[38]0\s/);
// colorMatch[1] = "B" → Black

// Determine material
const isSkinPolycore = modelCode.includes(".080");
const skinMaterial = isSkinPolycore ? "Polycore" : "Aluminum";
```

### For Color Configurator:
- Store base color codes in database
- Map color abbreviations to full names
- Support 2-tone detection (colors with `/`)
- Tag premium colors (EB, EG, AB) for pricing
- Filter by material type (.080 vs .030)

### For Quote System:
- Premium colors may have upcharge
- Polycore (.080) is higher base price
- 2-tone colors require custom labor charge
- Electric Lime Green (ELG) popular for visibility/safety
