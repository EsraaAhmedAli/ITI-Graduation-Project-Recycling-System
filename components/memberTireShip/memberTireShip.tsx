const tiers = [
  { name: "Eco Newbie", min: 0, max: 199 },
  { name: "Eco Warrior", min: 200, max: 499 },
  { name: "Eco Champion", min: 500, max: 999 },
  { name: "Green Guardian", min: 1000, max: Infinity },
];

function getUserTier(points: number) {
  return tiers.find((tier) => points >= tier.min && points <= tier.max);
}

function getNextTier(currentTierName: string) {
  const index = tiers.findIndex((t) => t.name === currentTierName);
  return tiers[index + 1]; // could be undefined if in last tier
}

export default function MembershipTier({ totalPoints }: { totalPoints: number }) {
  const tier = getUserTier(totalPoints);
  const nextTier = tier ? getNextTier(tier.name) : null;

  // progress only if there's a next tier
  const progress =
    nextTier && tier?.max !== Infinity
      ? ((totalPoints - tier.min) / (tier.max - tier.min)) * 100
      : 100;

  return (
    <div  className="bg-green-100 text-green-800 p-4 rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold text-green-700 mb-2">Membership Tier</h3>
      <p className="text-gray-800 text-sm mb-1">
        <span className="font-bold"> {tier?.name}</span>
      </p>
   

    </div>
  );
}
