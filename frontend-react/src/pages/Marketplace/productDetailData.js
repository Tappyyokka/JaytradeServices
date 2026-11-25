import { products } from "./marketplaceData";

const headphones = products[0];
const closeup = headphones.image + "&h=640&crop=entropy";
const sneakers = products[1];
const coffee = products[2];

export const sampleProductDetails = new Map([
  [headphones.name, {
    description: "Wireless over-ear headphones with cushioned ear cups, a padded headband and easy access to playback controls.",
    images: [headphones.image, closeup],
    features: ["Over-ear design with cushioned cups", "Wireless audio and playback controls", "USB-C charging"],
    specifications: [{ name: "Fit", value: "Over-ear" }, { name: "Connection", value: "Bluetooth" }, { name: "Charging port", value: "USB-C" }],
    packageContents: "Headphones, USB-C charging cable and quick start guide.",
    warranty: "One-year limited warranty in this demo listing.",
    returnPolicy: "7-day replacement for eligible defects in this demo listing.",
    delivery: { days: 4, fee: 0, pickup: true },
    sold: 128,
    variantOptions: [
      { id: "onyx-standard", attributes: { Colour: "Onyx", Model: "Standard" }, price: 899, stock: 6, images: [headphones.image, closeup] },
      { id: "onyx-plus", attributes: { Colour: "Onyx", Model: "Plus" }, price: 1099, stock: 4, images: [closeup, headphones.image] },
      { id: "graphite-standard", attributes: { Colour: "Graphite", Model: "Standard" }, price: 949, stock: 3 },
      { id: "graphite-plus", attributes: { Colour: "Graphite", Model: "Plus" }, price: 1199, stock: 0 },
    ],
    reviews: [
      { id: "head-1", author: "Asha", rating: 5, date: "2026-11-17", text: "Comfortable on a long commute, and the controls are easy to find.", demoPurchase: true, helpful: 6, images: [closeup] },
      { id: "head-2", author: "Dev", rating: 4, date: "2026-11-10", text: "Good sound for the price. The ear cups are a little snug.", demoPurchase: true, helpful: 3 },
      { id: "head-3", author: "Meera", rating: 5, date: "2026-11-06", text: "Paired easily with my laptop and phone.", demoPurchase: true, helpful: 4 },
      { id: "head-4", author: "Nikhil", rating: 4, date: "2026-10-28", text: "Light enough for everyday use.", helpful: 2 },
    ],
  }],
  [sneakers.name, {
    specifications: [{ name: "Upper", value: "Cotton" }, { name: "Closure", value: "Lace-up" }],
    variantOptions: [
      { id: "uk6", attributes: { "UK size": "6" }, stock: 4 },
      { id: "uk7", attributes: { "UK size": "7" }, stock: 4 },
      { id: "uk8", attributes: { "UK size": "8" }, stock: 2 },
    ],
  }],
  [coffee.name, {
    description: "Small-batch roasted whole beans for filter coffee or French press.",
    specifications: [{ name: "Form", value: "Whole beans" }, { name: "Roast", value: "Medium" }],
    sold: 76,
    reviews: [
      { id: "coffee-1", author: "Maya", rating: 5, date: "2026-11-15", text: "Balanced roast with a pleasant aroma.", demoPurchase: true, helpful: 2 },
      { id: "coffee-2", author: "Arun", rating: 4, date: "2026-11-08", text: "Worked well in a French press.", helpful: 1 },
      { id: "coffee-3", author: "Riya", rating: 5, date: "2026-10-30", text: "Fresh and easy to brew.", demoPurchase: true, helpful: 3 },
    ],
  }],
]);
