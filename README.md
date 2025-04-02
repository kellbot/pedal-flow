**Game Design Document**\
**Title:** Pedal Flow

---

### **Overview**

**Genre:** Turn-Based Puzzle\
**Platform:** TBD (PC, Mobile, or Console)\
**Target Audience:** Casual and fitness-focused gamers\
**Core Mechanic:** Players extend a cycling path using a *Pipe Dream*-style tile placement system while integrating heart rate mechanics for strategic gameplay.

---

### **Gameplay Mechanics**

#### **Core Loop**

1. Players receive a limited selection of road tiles and must place them to extend the cyclist’s path.
2. The cyclist moves forward automatically once a turn is completed.
3. The game continues until the cyclist crashes due to an incomplete path.

#### **Tiles**

- Tiles are randomly generated and must be placed strategically.
- Some tiles allow turns, intersections, or straight paths.
- Incorrect placements can block future pathing options, increasing difficulty.

##### **Description and Properties**

**Tile  Types**
- Straight
- Turn
- Intersection
- Start
- End
- Block

Each tile placed by clicking on a grid space. Tiles always align to the grid.

#### **Heart Rate Integration**

- **Steady Zone Bonus:** Maintaining a target heart rate for multiple turns provides rewards (extra points, better tiles, power-ups).
- **Fluctuation Mechanics:** Some obstacles or paths require the player to intentionally increase or decrease their heart rate to clear them.

#### **Power-Ups (Cooldown-Based, One Active at a Time)**

- **Turbo Precision:** Allows multiple tile placements in one turn.
- **Slow-Mo Mode:** Temporarily slows gameplay for better planning.
- **Path Clearer:** Removes a section of the road ahead.
- **Auto-Path Assist:** Automatically places a few useful tiles.
- **Tile Swap:** Allows swapping of an upcoming tile.
- Power-ups are **earned through combos, heart rate goals, or collected on the course** and have cooldown timers.

#### **Obstacles & Challenges**

- **Blocked Roads:** Some tiles require a certain heart rate range to activate.
- **Obstacles:** Players must reach a heart rate goal to place a replacement tile.
- **Environmental Hazards:** Wind, rough terrain, or detours force creative tile placement.

---

### **Game Modes**

1. **Endless Ride:** Core survival mode where players must continuously extend the road as difficulty increases.
2. **Timed Sprint:** Players race against the clock to score as many points as possible.
3. **Challenge Runs:** Procedurally generated puzzle levels with specific win conditions (e.g., "Survive for 3 minutes").
4. **Event Levels:** Special time-limited challenges with unique gameplay twists.

---

### **Scoring & Leaderboards**

- **Distance-Based Scoring:** Points are awarded based on how far the player extends the cyclist’s path.
- **Heart Rate Bonus:** Extra points for maintaining an optimal heart rate.
- **Combo Multiplier:** Successfully chaining long paths increases the score multiplier.
- **Leaderboards:** Includes global rankings, friend leaderboards, and personal best tracking.

---

### **Tutorial Mode**

- **Interactive and Skippable.**
- Gradually introduces mechanics step-by-step:
  1. Tile placement basics.
  2. Cyclist movement rules.
  3. Heart rate integration and its effects.
  4. Power-ups and cooldowns.
  5. Obstacles and strategic decision-making.

---

### **Scenes**

- **Boot Scene**
- **Main Menu**
  - Mode Selection
    - Endless Ride
    - Timed Sprint
    - Challenge Run
    - Event Levels
- **Tutorial**
- **Gameplay**
      - Rectangular Play Area which consists of a 10 x 7 grid of empty squares
      - Preview area showing the next 5 tiles
      - Score Display
      - Open space to show available boosts and their timeouts
- **Game Over**
- **Pause**


### **Next Steps**

1. Prototype core gameplay loop with tile placement and basic pathing.
2. Implement heart rate integration and balancing.
3. Develop power-ups and cooldown mechanics.
4. Playtest different game modes and refine difficulty scaling.

---