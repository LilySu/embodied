export const matchedUser = {
  name: 'Maya Chen',
  avatar: '🧘‍♀️',
  location: 'Downtown Studio District',
  distance: '1.2 miles away',
  bio: 'Yoga practitioner focused on building core strength and balance. Love morning flows and plant-based meals!',
  similarityScore: 87,
  joinedWeeks: 14,
  sessionData: {
    session1: {
      plankHold: 12,
      sidePlankL: 9,
      sidePlankR: 10,
      boatPose: 18,
      deadBugQuality: 5,
      downwardDog: 28,
      chaturangaQuality: 4,
      handFloorConnection: 3,
      singleLegL: 8,
      singleLegR: 7,
      treePoseL: 14,
      treePoseR: 12,
      eyesClosedBalance: 4,
      footPainLevel: 5,
      weightDistribution: 32,
      archEngagement: 4,
      sunSalAConfidence: 5,
      sunSalBConfidence: 3,
      sunSalAFlow: 4,
      sunSalBFlow: 3,
      bodyAwareness: 5,
      movementConfidence: 3,
      energyLevel: 4,
      wellbeing: 4
    },
    session6: {
      plankHold: 16,
      sidePlankL: 12,
      sidePlankR: 12,
      boatPose: 25,
      deadBugQuality: 7,
      downwardDog: 34,
      chaturangaQuality: 6,
      handFloorConnection: 4,
      singleLegL: 11,
      singleLegR: 9,
      treePoseL: 18,
      treePoseR: 15,
      eyesClosedBalance: 8,
      footPainLevel: 4,
      weightDistribution: 38,
      archEngagement: 6,
      sunSalAConfidence: 7,
      sunSalBConfidence: 5,
      sunSalAFlow: 6,
      sunSalBFlow: 5,
      bodyAwareness: 7,
      movementConfidence: 5,
      energyLevel: 6,
      wellbeing: 6
    },
    session12: {
      plankHold: 25,
      sidePlankL: 15,
      sidePlankR: 14,
      boatPose: 32,
      deadBugQuality: 8,
      downwardDog: 38,
      chaturangaQuality: 7,
      handFloorConnection: 5,
      singleLegL: 13,
      singleLegR: 11,
      treePoseL: 20,
      treePoseR: 18,
      eyesClosedBalance: 13,
      footPainLevel: 3,
      weightDistribution: 42,
      archEngagement: 7,
      sunSalAConfidence: 8,
      sunSalBConfidence: 7,
      sunSalAFlow: 8,
      sunSalBFlow: 7,
      bodyAwareness: 8,
      movementConfidence: 7,
      energyLevel: 8,
      wellbeing: 8
    }
  }
};

export const systemMessages = [
  {
    id: 'sys-1',
    type: 'system',
    category: 'class',
    text: '🧘 Suggested Class Meetup: "Gentle Morning Flow" this Saturday at 9am at Sunrise Yoga Studio. Both of you are working on core strength — flowing together could be fun!',
    time: 'Today, 8:00 AM'
  },
  {
    id: 'sys-2',
    type: 'system',
    category: 'meal',
    text: '🥗 Meal Connection: Try a post-practice lunch at Green Roots Café! Their Buddha Bowl is packed with anti-inflammatory ingredients perfect for recovery. Maybe this Thursday?',
    time: 'Today, 8:01 AM'
  },
  {
    id: 'sys-3',
    type: 'system',
    category: 'class',
    text: '💪 Partner Challenge: You both improved your plank hold by over 80%! Try a "Core & Balance" workshop together at the community center next week.',
    time: 'Yesterday, 3:00 PM'
  },
  {
    id: 'sys-4',
    type: 'system',
    category: 'meal',
    text: '🍵 Recovery Ritual: Share a matcha and stretching session at Calm Grounds Tea House. Their outdoor garden is perfect for gentle post-workout mobility work.',
    time: 'Yesterday, 9:00 AM'
  }
];

export const initialChatMessages = [
  {
    id: 'welcome',
    type: 'system',
    text: "✨ You've been matched! You and Maya share an 87% trajectory similarity. Here are some ways to connect:",
    time: 'Today, 7:59 AM'
  },
  ...systemMessages,
  {
    id: 'match-msg-1',
    type: 'match',
    text: "Hi! I saw we got matched — your balance progress is amazing! I'd love to try that Saturday class if you're up for it 😊",
    time: 'Today, 10:15 AM'
  }
];
