export const TYPES = ["Cleanup", "Plantation", "Donation", "Food Drive", "Medical Camp"];

export const TYPE_BLURB = {
  Cleanup: "Clear streets, parks and waterways.",
  Plantation: "Plant trees where they are needed.",
  Donation: "Give clothes, books and devices to those who need them.",
  "Food Drive": "Pack and hand out food to families.",
  "Medical Camp": "Support free health checkups.",
};

// The API compares dates as UTC YYYY-MM-DD strings, so the form does too.
export const tomorrow = () => new Date(Date.now() + 864e5).toISOString().slice(0, 10);
