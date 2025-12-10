export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  category: "basketball" | "swimming" | "fitness" | "social" | "other";
  imageUrl?: string;
  registrationUrl?: string;
}

export const upcomingEvents: Event[] = [
  {
    id: "1",
    title: "Wheelchair Basketball Practice",
    date: "2025-01-15",
    time: "6:00 PM - 8:00 PM",
    location: "Community Recreation Center, Main Gym",
    description:
      "Join us for our weekly wheelchair basketball practice! All skill levels welcome. Equipment provided for newcomers.",
    category: "basketball",
  },
  {
    id: "2",
    title: "Adaptive Swimming Session",
    date: "2025-01-18",
    time: "10:00 AM - 12:00 PM",
    location: "Aquatic Center, Pool A",
    description:
      "A fun and supportive swimming session with trained instructors. Learn new techniques or just enjoy the water!",
    category: "swimming",
  },
  {
    id: "3",
    title: "Wheelchair Basketball Tournament",
    date: "2025-02-08",
    time: "9:00 AM - 5:00 PM",
    location: "Sports Complex Arena",
    description:
      "Our annual wheelchair basketball tournament featuring teams from across the region. Come play or cheer on the athletes!",
    category: "basketball",
  },
  {
    id: "4",
    title: "Adaptive Fitness Workshop",
    date: "2025-01-25",
    time: "2:00 PM - 4:00 PM",
    location: "Wellness Center, Studio B",
    description:
      "Learn adaptive exercise techniques with our certified trainers. Focus on strength, flexibility, and overall wellness.",
    category: "fitness",
  },
  {
    id: "5",
    title: "Community Social Night",
    date: "2025-01-30",
    time: "6:00 PM - 9:00 PM",
    location: "Downtown Community Hall",
    description:
      "An evening of games, food, and connection. Meet other members of our community and make new friends!",
    category: "social",
  },
];

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getCategoryColor(category: Event["category"]): string {
  const colors = {
    basketball: "bg-orange-100 text-orange-800",
    swimming: "bg-blue-100 text-blue-800",
    fitness: "bg-green-100 text-green-800",
    social: "bg-purple-100 text-purple-800",
    other: "bg-gray-100 text-gray-800",
  };
  return colors[category];
}

export function getCategoryLabel(category: Event["category"]): string {
  const labels = {
    basketball: "Basketball",
    swimming: "Swimming",
    fitness: "Fitness",
    social: "Social",
    other: "Other",
  };
  return labels[category];
}
