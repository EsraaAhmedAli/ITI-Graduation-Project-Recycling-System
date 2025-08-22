import Groq from "groq-sdk";
import * as fuzzball from "fuzzball";
import itemsData from "@/data/items.json";

type ItemInfo = { arname: string; unit: string };
const enToInfo: Record<string, ItemInfo> = {};
for (const [en, info] of Object.entries(itemsData)) {
  enToInfo[en.toLowerCase()] = info;
}
const arToEn: Record<string, string> = {};
const allNames: string[] = [];
for (const [en, info] of Object.entries(enToInfo)) {
  arToEn[info.arname] = en;
  allNames.push(en.toLowerCase(), info.arname);
}

function normalizeUnit(unit: string): "KG" | "piece" {
  const u = unit.trim().toLowerCase();
  if (["kg", "كيلو", "كجم", "kilogram", "kilograms"].includes(u)) return "KG";
  return "piece";
}

function mapToCanonicalMaterial(
  input: string
): { name: string; unit: string } | null {
  const cleaned = input.trim().toLowerCase();
  
  console.log(`🔍 Mapping material: "${input}" -> cleaned: "${cleaned}"`);
  
  // Try exact match first
  if (enToInfo[cleaned]) {
    console.log(`✅ Exact match found: "${cleaned}"`);
    return { name: cleaned, unit: enToInfo[cleaned].unit };
  }
  
  // Try fuzzy matching with higher threshold for better precision
  const matches = fuzzball.extract(cleaned, allNames, {
    scorer: fuzzball.token_set_ratio,
    limit: 5, // Get top 5 matches for debugging
  });
  
  console.log(`🔍 Fuzzy matches for "${cleaned}":`, matches);
  
  const [bestMatch, score] = matches[0] || [null, 0];
  
  // Increase threshold to 85 for better precision and avoid false matches
  if (bestMatch && score >= 85) {
    console.log(`✅ Fuzzy match found: "${cleaned}" -> "${bestMatch}" (score: ${score})`);
    
    if (enToInfo[bestMatch]) {
      return { name: bestMatch, unit: enToInfo[bestMatch].unit };
    }
    if (arToEn[bestMatch]) {
      return { name: arToEn[bestMatch], unit: enToInfo[arToEn[bestMatch]].unit };
    }
  }
  
  console.log(`❌ No suitable match found for: "${cleaned}" (best score: ${score})`);
  return null;
}

const SYSTEM_PROMPT = `
You are a professional AI assistant for a recycling app. Extract a list of materials, their quantities, and units from noisy, possibly misspelled, Arabic or English speech transcriptions.

Rules:
- CRITICAL: Only return valid JSON in this exact format:
{
  "items": [
    {
      "material": "English name here",
      "quantity": float,
      "unit": "KG" | "pieces"
    }
  ]
}
- If you do not follow this, the system will fail.
- Only use materials from the provided list (see below). If a material is not in the list, ignore it.
- If a material appears multiple times with different phrases (e.g., "2 laptop" and "3 motherboard laptop"), treat them as SEPARATE items only if they are genuinely different materials.
- If the same material is mentioned multiple times (e.g., "2 laptop" and "1 laptop"), merge them by summing their quantities.
- For each material, use the canonical English name from the list.
- If the unit is missing or ambiguous, use the default unit for that material from the list.
- Accept both Arabic and English names, and be robust to typos and variants.
- If the quantity is missing, assume 1.
- Accept both singular and plural units ("piece", "pieces", "KG").
- Do not output any explanation, only the JSON array.
- Be precise with material identification - "motherboard laptop" should NOT be treated as "laptop" unless motherboard is not in the materials list.

Material List (English name, Arabic name, unit):
${Object.entries(enToInfo)
  .map(([en, info]) => `- ${en} (${info.arname}) [${info.unit}]`)
  .join("\n")}

Example:
Input: "3 كيلو بلاستيك و 2 كراسي و مكواة"
Output: [
  { "material": "Plastics", "quantity": 3, "unit": "KG" },
  { "material": "Chair", "quantity": 2, "unit": "piece" },
  { "material": "Iron", "quantity": 1, "unit": "piece" }
]

Example with precision:
Input: "2 laptop and 3 motherboard laptop"
Output: [
  { "material": "laptop", "quantity": 2, "unit": "piece" },
  { "material": "motherboard", "quantity": 3, "unit": "piece" }
]
(Only if both "laptop" and "motherboard" exist in the materials list)
`;

export type ExtractedMaterial = {
  material: string;
  quantity: number;
  unit: string;
};

export async function extractMaterialsFromTranscription(
  transcription: string
): Promise<ExtractedMaterial[]> {
  console.log(`🎤 Input transcription: "${transcription}"`);
  
  const client = new Groq({
    apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const chatRes = await client.chat.completions.create({
    model: "llama-3.1-8b-instant",
    temperature: 1,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Input: ${transcription}` },
    ],
  });

  console.log("🤖 AI raw output:", chatRes.choices[0].message.content);

  let parsed: unknown[] = [];
  try {
    const raw = JSON.parse(chatRes.choices[0].message.content || "[]");
    console.log("📋 Parsed JSON structure:", raw);
    
    if (Array.isArray(raw)) {
      parsed = raw;
    } else if (raw && typeof raw === "object") {
      if (Array.isArray(raw.items)) {
        parsed = raw.items;
      } else if (Array.isArray(raw.material)) {
        parsed = raw.material;
      } else {
        parsed = [];
      }
    } else {
      parsed = [];
    }
    console.log("📋 Extracted items array:", parsed);
  } catch (error) {
    console.error("❌ JSON parsing failed:", error);
    parsed = [];
  }

  const result: ExtractedMaterial[] = [];
  const materialMap = new Map<string, ExtractedMaterial>(); // Use Map to merge duplicates
  
  for (const item of parsed as { material?: string; quantity?: number; unit?: string }[]) {
    if (!item.material) continue;
    
    console.log(`🔍 Processing AI extracted item: "${item.material}" (qty: ${item.quantity}, unit: ${item.unit})`);
    
    const mapped = mapToCanonicalMaterial(item.material);
    if (!mapped) {
      console.log(`❌ No mapping found for: "${item.material}"`);
      continue;
    }
    
    console.log(`✅ Mapped "${item.material}" -> "${mapped.name}" (correct unit: ${mapped.unit})`);
    
    const quantity = typeof item.quantity === "number" ? item.quantity : 1;
    // Always use the correct unit from the database mapping, not the AI-suggested unit
    const unit = normalizeUnit(mapped.unit);
    const canonicalName =
      Object.keys(enToInfo).find((k) => k.toLowerCase() === mapped.name) ||
      mapped.name;
    
    // Check if material already exists in map
    const key = canonicalName.toLowerCase();
    if (materialMap.has(key)) {
      // Merge with existing material by adding quantities
      const existing = materialMap.get(key)!;
      existing.quantity += quantity;
      console.log(`🔄 Merged duplicate material: ${canonicalName} (${existing.quantity} total)`);
    } else {
      // Add new material
      materialMap.set(key, {
        material: canonicalName,
        quantity,
        unit,
      });
      console.log(`➕ Added new material: ${canonicalName} (${quantity} ${unit})`);
    }
  }
  
  // Convert map values to array
  result.push(...materialMap.values());
  
  console.log(`📋 Final extracted materials:`, result);
  return result;
}
