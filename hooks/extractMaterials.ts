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
  if (enToInfo[cleaned]) return { name: cleaned, unit: enToInfo[cleaned].unit };
  const [match, score] = fuzzball.extract(cleaned, allNames, {
    scorer: fuzzball.token_set_ratio,
  })[0] || [null, 0];
  if (match && score >= 80) {
    if (enToInfo[match]) return { name: match, unit: enToInfo[match].unit };
    if (arToEn[match])
      return { name: arToEn[match], unit: enToInfo[arToEn[match]].unit };
  }
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
- If a material appears multiple times, merge them and sum their quantities.
- For each material, use the canonical English name from the list.
- If the unit is missing or ambiguous, use the default unit for that material from the list.
- Accept both Arabic and English names, and be robust to typos and variants.
- If the quantity is missing, assume 1.
- Accept both singular and plural units ("piece", "pieces", "KG").
- Do not output any explanation, only the JSON array.

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
`;

export type ExtractedMaterial = {
  material: string;
  quantity: number;
  unit: string;
};

export async function extractMaterialsFromTranscription(
  transcription: string
): Promise<ExtractedMaterial[]> {
  const client = new Groq({
    apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const chatRes = await client.chat.completions.create({
    model: "llama-3.1-8b-instant",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Input: ${transcription}` },
    ],
  });

  console.log("raw output:", chatRes.choices[0].message.content);

  let parsed: unknown[] = [];
  try {
    const raw = JSON.parse(chatRes.choices[0].message.content || "[]");
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
  } catch {
    parsed = [];
  }

  const result: ExtractedMaterial[] = [];
  for (const item of parsed as any[]) {
    if (!item.material) continue;
    const mapped = mapToCanonicalMaterial(item.material);
    if (!mapped) continue;
    const quantity = typeof item.quantity === "number" ? item.quantity : 1;
    const unit = item.unit
      ? normalizeUnit(item.unit)
      : normalizeUnit(mapped.unit);
    const canonicalName =
      Object.keys(enToInfo).find((k) => k.toLowerCase() === mapped.name) ||
      mapped.name;
    result.push({
      material: canonicalName,
      quantity,
      unit,
    });
  }
  return result;
}
