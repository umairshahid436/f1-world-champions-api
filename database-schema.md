# F1 World Champions Database Schema

## Core Tables (MVP)

### 1. **drivers**

```sql
id: string (PRIMARY KEY) -- Ergast driver ID (e.g., "hamilton")
name: string -- Full name (e.g., "Lewis Hamilton")
nationality: string -- (e.g., "British")
permanent_number: integer -- Racing number (e.g., 44)
date_of_birth: date
created_at: timestamp
updated_at: timestamp
```

### 2. **seasons**

```sql
year: integer (PRIMARY KEY) -- Season year (2005-2025)
champion_driver_id: string (FK -> drivers.id)
total_races: integer -- Number of races in season
created_at: timestamp
updated_at: timestamp
```

### 3. **races**

```sql
id: string (PRIMARY KEY) -- Ergast race ID
season_year: integer (FK -> seasons.year)
round: integer -- Race number in season (1, 2, 3...)
name: string -- Grand Prix name (e.g., "Monaco Grand Prix")
circuit_name: string -- Circuit name (e.g., "Monaco")
country: string -- Race country
date: date -- Race date
winner_driver_id: string (FK -> drivers.id)
created_at: timestamp
updated_at: timestamp

INDEX: (season_year, round)
INDEX: (winner_driver_id)
```

## Data Flow

### 1. Fetch Season Champions:

```
API: GET /ergast/f1/{year}/driverstandings
Filter: position = 1
Store: seasons table
```

### 2. Fetch Race Winners:

```
API: GET /ergast/f1/{year}/results
Filter: position = 1 (for each race)
Store: races table
```

### 3. Highlight Logic:

```sql
-- Race winner is also season champion
SELECT *,
       CASE WHEN r.winner_driver_id = s.champion_driver_id
            THEN true ELSE false END as is_champion
FROM races r
JOIN seasons s ON r.season_year = s.year
```

## Key Benefits:

- ✅ **Simple & focused** - Only what's needed
- ✅ **Fast queries** - Minimal joins
- ✅ **Clear relationships** - Driver champions & race winners
- ✅ **Easy highlighting** - Direct driver comparison
