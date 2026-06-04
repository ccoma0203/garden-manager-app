# 🌿 Garden Manager — Your Garden, Digitized

Whether it's a small balcony, a backyard garden, or a full farmland —
plan, buy, and manage any outdoor space in one place.

## 💡 The Idea

Digitize your outdoor space, virtually arrange plants and tools,
and connect directly to purchase — all in one service.
No matter the size or type of your space,
anyone can build and manage their own digital garden.

## 🎯 Core Features

### 1. Digitize Your Space
- Register your space by entering dimensions or uploading a photo
- Works for any outdoor space — no size or type restrictions
- Visualize your space as an interactive digital garden simulation

### 2. Place & Buy Plants and Tools
- Mark existing plants directly on your digital map
- Virtually arrange items from the catalog, then purchase instantly
- Shop for: plants, flowers, fences, watering cans, stones, pesticides, and more

### 3. Personalized Care Alerts
- Care tips based on plant type + local climate data
- Reminders for watering, fertilizing, pruning, and more
- Natural disaster alerts (cold snaps, heatwaves, typhoons, etc.)

### 4. AI Plant Care Agent
- Chat with an in-app AI agent specialized in plant care
- Answers personalized to your garden's actual data

## 🗺️ Development Roadmap

### Phase 1 — Space Digitization
- [x] Space input UI (width, height, shape)
- [ ] Photo upload for space recognition (manual input first)
- [x] Build interactive garden simulation

### Phase 2 — Placement & Commerce
- [x] Build plant and tool catalog
- [x] Drag-and-drop virtual placement feature
- [x] Plant compatibility info (good neighbors vs. bad neighbors)
- [x] Placement → purchase flow (external links first, own commerce later)

## ✅ Currently Built (MVP)
- Interactive garden grid with resizable beds
- Bed types with soil colors: 🥕 Vegetable, 🌸 Flower, 🌳 Tree
- Border styles: 🪵 Wooden Fence, 🧱 Brick Wall, 🪨 Stone Edge
- Plant catalog: vegetables, flowers, trees (20+ plants)
- Tree growth stages: 🌱 Seedling → 🌿 Young → 🌳 Mature
- Custom plant registration with built-in database (50+ plants)
- AI integration stub ready for Claude API
- Real-time weather alerts via Open-Meteo API
- Region setting (Korean cities supported)
- localStorage auto-save

### Phase 3 — Care & Alerts
- [x] Integrate regional climate data API
- [x] Personalized care reminders per plant (watering, fertilizing, etc.)
- [x] Natural disaster preparation alerts

### Phase 4 — AI Agent
- [ ] AI Q&A based on user's garden data
- [ ] Claude API integration

### Phase 5 — Scale Up
- [ ] Mobile app launch
- [ ] Build own commerce platform

## 🛠️ Planned Stack
- Space simulation: Canvas / WebGL
- Climate data: Korea Meteorological Administration API
- AI agent: Claude API
- Commerce: External API → own platform
