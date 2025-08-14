// Test script to verify the improved item matching logic

// Mock database items based on the logs
const mockDatabaseItems = [
  { name: "shredded paper" },
  { name: "Books" },
  { name: "news paper" },
  { name: "lap" },
  { name: "router" },
  { name: "Mobile" },
  { name: "Laptop" },
  { name: "Receiver" },
  { name: "powerbank" },
  { name: "Cooking pan" },
  { name: "hammer" },
  { name: "Tea pot" },
  { name: "ًcar battery" },
  { name: "Acrylic" },
  { name: "Solid Plasitc" }, // Note the typo in database
  { name: "ًwater colman" }, // Note the Arabic diacritics
  { name: "ًPlastic Barrel" },
  { name: "Fan" }
];

// Clean function to remove Arabic diacritics and normalize text
const cleanText = (text) => {
  return text
    .toLowerCase()
    .trim()
    // Remove Arabic diacritics (ً ٌ ٍ َ ُ ِ ّ ْ)
    .replace(/[\u064B-\u0652]/g, '')
    // Remove common prefixes that might cause issues
    .replace(/^ً+/, '')
    .trim();
};

// Helper function to calculate string similarity
const calculateSimilarity = (str1, str2) => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = getEditDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
};

// Helper function to calculate edit distance (Levenshtein distance)
const getEditDistance = (str1, str2) => {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
};

// Improved findMatchingItem function
const findMatchingItem = (itemName, allItems) => {
  const normalizedSearchName = itemName.toLowerCase().trim();
  
  console.log(`🔍 Searching for: "${itemName}" (normalized: "${normalizedSearchName}")`);
  
  const cleanedSearchName = cleanText(normalizedSearchName);
  
  // Try EXACT match first (most reliable) - case insensitive
  let found = allItems.find(item => 
    cleanText(item.name) === cleanedSearchName
  );
  
  if (found) {
    console.log(`✅ Exact match found: ${itemName} -> ${found.name}`);
    return found;
  }
  
  // Try exact match with pluralization (add/remove 's')
  const pluralVariations = [
    cleanedSearchName.replace(/s$/, ''), // Remove plural 's'
    cleanedSearchName + 's', // Add plural 's'
  ];
  
  for (const variation of pluralVariations) {
    if (variation !== cleanedSearchName && variation.length > 2) {
      found = allItems.find(item => 
        cleanText(item.name) === variation
      );
      if (found) {
        console.log(`✅ Exact pluralization match found: ${itemName} -> ${found.name} (via "${variation}")`);
        return found;
      }
    }
  }
  
  // Try common word variations for specific items
  const commonVariations = {
    'newspaper': ['news paper'],
    'news paper': ['newspaper'],
    'powerbank': ['power bank'],
    'power bank': ['powerbank'],
    'solid plastic': ['solid plasitc', 'plastics'], // Handle the typo in database
    'plastic': ['solid plastic', 'solid plasitc'],
    'plastics': ['solid plastic', 'solid plasitc'],
    'water colman': ['water colman'], // Handle Arabic diacritics
    'colman': ['water colman'],
  };
  
  if (commonVariations[cleanedSearchName]) {
    for (const variation of commonVariations[cleanedSearchName]) {
      found = allItems.find(item => 
        cleanText(item.name) === cleanText(variation)
      );
      if (found) {
        console.log(`✅ Common variation match found: ${itemName} -> ${found.name} (via "${variation}")`);
        return found;
      }
    }
  }
  
  // Try fuzzy matching for database typos
  found = allItems.find(item => {
    const cleanItemName = cleanText(item.name);
    const similarity = calculateSimilarity(cleanedSearchName, cleanItemName);
    return similarity > 0.85; // 85% similarity threshold
  });
  
  if (found) {
    console.log(`✅ Fuzzy match found: ${itemName} -> ${found.name} (similarity match)`);
    return found;
  }
  
  console.log(`❌ No match found for: ${itemName}`);
  return null;
};

// Test cases from the user's voice input
const testCases = [
  "plastics",
  "solid plastic", 
  "water colman",
  "books",
  "newspaper"
];

console.log("=== Testing Improved Item Matching ===\n");

testCases.forEach(testCase => {
  console.log(`\n--- Testing: "${testCase}" ---`);
  const result = findMatchingItem(testCase, mockDatabaseItems);
  if (result) {
    console.log(`✅ SUCCESS: "${testCase}" matched to "${result.name}"`);
  } else {
    console.log(`❌ FAILED: "${testCase}" not matched`);
  }
});

console.log("\n=== Test Complete ===");
