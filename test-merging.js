// Test the merging logic for duplicate database items

// Simulate the scenario from the logs
const testItems = [
  { material: "Solid Plastic", quantity: 3, unit: "KG" },
  { material: "Plastics", quantity: 5, unit: "KG" }
];

// Mock database item (both map to this)
const mockDbItem = {
  _id: "68849c2b6e240988fbe3a616",
  name: "Solid Plasitc", // Note the typo
  price: 18,
  points: 19,
  measurement_unit: 1,
  categoryId: "plastic_cat",
  categoryName: "plastic",
  image: "/solid-plastic.jpg"
};

// Simulate the merging logic
const mergedItems = new Map();

testItems.forEach(item => {
  console.log(`Processing: ${item.material} (${item.quantity} ${item.unit})`);
  
  // Both items would map to the same database item
  const dbItem = mockDbItem;
  
  if (mergedItems.has(dbItem._id)) {
    const existingItem = mergedItems.get(dbItem._id);
    console.log(`🔄 Merging: ${item.material} + ${existingItem.material} (both map to ${dbItem.name})`);
    
    existingItem.quantity += item.quantity;
    console.log(`➕ Updated quantity: ${existingItem.quantity} ${existingItem.unit}`);
  } else {
    console.log(`➕ Adding new item: ${dbItem.name} (${item.quantity} ${item.unit})`);
    mergedItems.set(dbItem._id, {
      material: dbItem.name,
      quantity: item.quantity,
      unit: item.unit,
      _id: dbItem._id,
      price: dbItem.price,
      points: dbItem.points,
      found: true
    });
  }
});

const finalItems = Array.from(mergedItems.values());
console.log("\n=== Final Result ===");
console.log(`Input items: ${testItems.length}`);
console.log(`Output items: ${finalItems.length}`);
console.log("Merged item:", finalItems[0]);
console.log(`Total quantity: ${finalItems[0].quantity} ${finalItems[0].unit}`);
console.log("✅ Should show: 'Solid Plasitc' with 8 KG total (3 + 5)");
