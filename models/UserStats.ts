// models/UserStats.ts
const UserStatsSchema = new Schema({
  userId:        { type: String, required: true, unique: true },
  totalSessions: { type: Number, default: 0 },
  totalCharsTyped: { type: Number, default: 0 },
  
  // Per-language breakdown
  languageStats: {
    type: Map,
    of: new Schema({
      sessions:    Number,
      avgWPM:      Number,
      avgAccuracy: Number,
      bestWPM:     Number,
    })
  },
  
  // Error pattern tracking
  errorPatterns: {
    brackets:    { type: Number, default: 0 },
    operators:   { type: Number, default: 0 },
    punctuation: { type: Number, default: 0 },
    keywords:    { type: Number, default: 0 },
    indentation: { type: Number, default: 0 },
  },
  
  // Gamification
  currentStreak:  { type: Number, default: 0 },
  longestStreak:  { type: Number, default: 0 },
  lastPlayedDate: Date,
  badges:         [String],
  
  // Session history (last 100)
  recentSessions: [{
    snippetId:  Schema.Types.ObjectId,
    wpm:        Number,
    accuracy:   Number,
    errorCount: Number,
    playedAt:   Date,
  }]
}, { timestamps: true });
```

---

## Step 4: Seed Database Structure

Instead of one flat JSON, organize your seed data like this:
```
data/
  seeds/
    javascript/
      loops.ts
      arrays.ts
      functions.ts
      async.ts
      closures.ts
    python/
      loops.ts
      comprehensions.ts
      decorators.ts
      classes.ts
    cpp/
      pointers.ts
      stl.ts
      templates.ts
    sql/
      joins.ts
      aggregates.ts
      subqueries.ts
  seed.ts   ← master runner