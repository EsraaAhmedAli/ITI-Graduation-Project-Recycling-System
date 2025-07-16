import { encode } from 'gpt-tokenizer';

// Extract the system prompt from UseAI.ts
const systemPrompt = `
You are an intelligent language parser that extracts structured waste material data from Arabic or English speech about recyclable materials.

CRITICAL RULES:
1. Only return valid JSON in this exact format:
{
  "items": [
    {
      "material": "English name here",
      "quantity": float,
      "unit": "KG" | "pieces"
    }
  ]
}

2. Material Mapping Instructions:
- Input may be in Arabic or English (already translated)
- Match names to English names from the provided list
- Use fuzzy matching for slight variations
- For "مكواة" or "iron" use "Iron" (NOT "Iron.")
- For "كرسي" or "chair" use "Chair" 
- For "ورق متقطع" or "shredded paper" use "Shredded paper"
- For "كولمان مياه" or "water tank" use "Coleman Water"
- For "حديد" or "iron metal" use "Iron." (with period)
- For "بلاستيك" or "plastic" use "Plastics"
- For "ستانلس" or "stainless steel" use "Stainless"
- For "جرانيت" or "granite" use "Granite Pot"
- For "مقبض مياه" use "Water knob"
- For "كابل إنترنت" use "Ethernet cable"
- For "مروحة" use "Fan"
- For "سخان غاز 10 لتر" use "Gas Heater 10 Liter"
- For "حلة تيفال" use "Tefal pot"
- For "قاعدة غسالة" use "Washing Machine Base"

3. Unit Normalization:
- "كيلو", "كجم", "kilo", "kilogram" → "KG"
- "قطعة", "قطع", "piece", "pieces" → "pieces"

4. Quantity Parsing:
- Convert numbers to digits: تلاتة/three → 3, نص/half → 0.5, ربع/quarter → 0.25
- If no quantity is explicitly mentioned, assume 1 piece
- Handle implicit quantities: "حلة تيفال" → 1 piece of "Tefal pot"

5. Available Materials (Arabic → English):
[PLACEHOLDER_FOR_MATERIAL_LIST]

6. DO NOT skip any items from the input text
7. If unsure about a material, use the closest match from the list
8. Output only the JSON, no explanations

Example Input: "3 كيلو بلاستيك 2 كراسي 1 مكواة"
Example Output:
{
  "items": [
    {"material": "Plastics", "quantity": 3, "unit": "KG"},
    {"material": "Chair", "quantity": 2, "unit": "pieces"},
    {"material": "Iron", "quantity": 1, "unit": "pieces"}
  ]
}

Example Input: "1 water tank 1 plastic bag 1 stainless steel container 1 granite pot"
Example Output:
{
  "items": [
    {"material": "Coleman Water", "quantity": 1, "unit": "pieces"},
    {"material": "Plastics", "quantity": 1, "unit": "pieces"},
    {"material": "Stainless", "quantity": 1, "unit": "pieces"},
    {"material": "Granite Pot", "quantity": 1, "unit": "pieces"}
  ]
}

Example Input: "3 مقبض مياه 5 كابل إنترنت 2 مروحة 3 مكواة 10 سخان غاز 10 لتر حلة تيفال 2 قاعدة غسالة"
Example Output:
{
  "items": [
    {"material": "Water knob", "quantity": 3, "unit": "pieces"},
    {"material": "Ethernet cable", "quantity": 5, "unit": "pieces"},
    {"material": "Fan", "quantity": 2, "unit": "pieces"},
    {"material": "Iron", "quantity": 3, "unit": "pieces"},
    {"material": "Gas Heater 10 Liter", "quantity": 10, "unit": "pieces"},
    {"material": "Tefal pot", "quantity": 1, "unit": "pieces"},
    {"material": "Washing Machine Base", "quantity": 2, "unit": "pieces"}
  ]
}
`.trim();

// Count tokens in the system prompt
const tokens = encode(systemPrompt);
console.log('🔢 System Prompt Token Analysis:');
console.log('━'.repeat(50));
console.log(`📊 Total tokens: ${tokens.length}`);
console.log(`📄 Character count: ${systemPrompt.length}`);
console.log(`📏 Average chars per token: ${(systemPrompt.length / tokens.length).toFixed(2)}`);
console.log('━'.repeat(50));

// Load items.json to get actual material list size
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const itemsPath = path.join(__dirname, 'data', 'items.json');
const itemsData = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));

// Create the actual material list string
const materialNamesAr = itemsData.items.map(item => item.arname.trim().toLowerCase());
const arabicNamesStr = materialNamesAr.map(name => `- ${name}`).join('\n');

// Replace placeholder with actual material list
const actualSystemPrompt = systemPrompt.replace('[PLACEHOLDER_FOR_MATERIAL_LIST]', arabicNamesStr);
const actualTokens = encode(actualSystemPrompt);

console.log('🔢 Actual System Prompt (with material list):');
console.log('━'.repeat(50));
console.log(`📊 Total tokens: ${actualTokens.length}`);
console.log(`📄 Character count: ${actualSystemPrompt.length}`);
console.log(`📏 Average chars per token: ${(actualSystemPrompt.length / actualTokens.length).toFixed(2)}`);
console.log(`📝 Number of materials: ${materialNamesAr.length}`);
console.log('━'.repeat(50));

// Estimate remaining tokens for user message and response
const maxTokens = 8192; // Common limit for many models
const remainingTokens = maxTokens - actualTokens.length;
console.log('💭 Token Budget Analysis:');
console.log('━'.repeat(50));
console.log(`🏷️  System prompt tokens: ${actualTokens.length}`);
console.log(`🔄 Remaining for user + response: ${remainingTokens}`);
console.log(`⚠️  Percentage used by system: ${((actualTokens.length / maxTokens) * 100).toFixed(1)}%`);

if (actualTokens.length > maxTokens * 0.7) {
  console.log('🚨 WARNING: System prompt uses >70% of token budget!');
} else if (actualTokens.length > maxTokens * 0.5) {
  console.log('⚠️  CAUTION: System prompt uses >50% of token budget');
} else {
  console.log('✅ System prompt token usage is reasonable');
}
