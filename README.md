# 🏁 F1 World Champions API

A **NestJS API** that provides Formula 1 World Champions data and race results from **2005 to present**.

## **Project Overview**

This API serves as the backend for SPA/Mobile applications displaying F1 World Champions and race data. It implements intelligent caching by checking the database first, then fetching from the Ergast F1 API when needed.

### **Key Features**

- **Season Champions**: Get F1 World Champions by year range
- **Race Results**: Fetch race winners for specific seasons
- ⚡ **Performance Optimized**: Database indexes for sub-millisecond queries
- **Cache-Aside Pattern**: Database-first with Ergast API fallback
- **Docker Ready**: Complete containerized setup
- **Data Integrity**: Foreign key relationships and constraints

## **Architecture Diagram**

```mermaid
graph TB
    Client[📱 Client App<br/>SPA/Mobile] --> API[F1 Champions API<br/>NestJS + TypeScript]

    API --> Cache{Data in DB?}
    Cache -->|Yes| DB[(PostgreSQL<br/>Cache)]
    Cache -->|No| External[Ergast F1 API<br/>External Source]

    External --> Transform[Data Transformation<br/>& Validation]
    Transform --> Save[Save to Database]
    Save --> DB

    subgraph "Database Schema"
        DB --> Seasons[Seasons<br/>year, championDriverId, championConstructorId]
        DB --> Drivers[Drivers<br/>driverId, name, nationality]
        DB --> Constructors[Constructors<br/>constructorId, name, nationality]
        DB --> Races[Races<br/>seasonYear, driverId, circuitName]
    end

    subgraph "Performance Optimizations"
        Indexes[Database Indexes<br/>• seasonYear (races)<br/>• driverId (races)<br/>• Primary Keys]
        Constraints[Foreign Key Constraints<br/>• races → seasons<br/>• races → drivers<br/>• seasons → drivers/constructors]
    end

    DB -.-> Indexes
    DB -.-> Constraints

    classDef api fill:#e1f5fe
    classDef db fill:#f3e5f5
    classDef external fill:#fff3e0
    classDef perf fill:#e8f5e8

    class API api
    class DB,Seasons,Drivers,Constructors,Races db
    class External external
    class Indexes,Constraints perf
```

## **Tech Stack**

| Category             | Technology              |
| -------------------- | ----------------------- |
| **Framework**        | NestJS + TypeScript     |
| **Database**         | PostgreSQL              |
| **ORM**              | TypeORM                 |
| **Containerization** | Docker + Docker Compose |
| **External API**     | Ergast F1 API           |
| **Validation**       | class-validator         |
| **HTTP Client**      | Axios                   |

## **API Endpoints**

### **Season Champions**

```http
GET /api/seasons/champions?fromYear=2020&toYear=2023
```

**Response:**

```json
{
  "data": [
    {
      "season": "2023",
      "points": "575",
      "championDriver": {
        "driverId": "max_verstappen",
        "name": "Max Verstappen"
      },
      "championConstructor": {
        "constructorId": "red_bull",
        "name": "Red Bull"
      }
    }
  ],
  "message": "Success",
  "count": 4
}
```

### **Season Races**

```http
GET /api/races/season/2023
```

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "name": "Bahrain Grand Prix",
      "date": "2023-03-05",
      "circuitName": "Bahrain International Circuit",
      "winnerDriver": {
        "driverId": "max_verstappen",
        "name": "Max Verstappen"
      }
    }
  ]
}
```

## **Quick Start**

### **Prerequisites**

- Docker & Docker Compose
- Node.js 20+ (for local development)

### **Run with Docker (Recommended)**

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd f1-world-champions-api
   ```

2. **Start the complete stack**

   ```bash
   docker-compose up -d --build
   ```

3. **Run database migrations**

   ```bash
   docker-compose exec f1-api npm run migration:run
   ```

4. **Test the API**
   ```bash
   curl "http://localhost:3000/api/seasons/champions?fromYear=2020&toYear=2023"
   ```

### **Local Development**

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Setup environment**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your database credentials
   ```

3. **Start PostgreSQL**

   ```bash
   docker-compose up postgres -d
   ```

4. **Run migrations**

   ```bash
   npm run migration:run
   ```

5. **Start development server**
   ```bash
   npm run start:dev
   ```

## **Database Schema**

### **Tables & Relationships**

```sql
-- Core entities with foreign key relationships
seasons (year) ← races (seasonYear)
drivers (driverId) ← races (driverId)
drivers (driverId) ← seasons (championDriverId)
constructors (constructorId) ← seasons (championConstructorId)
```

### **Performance Indexes**

| Table          | Index           | Purpose                         |
| -------------- | --------------- | ------------------------------- |
| `races`        | `seasonYear`    | **Main query**: races by season |
| `races`        | `driverId`      | Race winner lookups             |
| `drivers`      | `driverId`      | Driver data retrieval           |
| `constructors` | `constructorId` | Constructor data retrieval      |

## ⚡ **Performance Features**

### **Cache-Aside Pattern**

```typescript
// 1. Check database first
const dataFromDB = await repository.findByYear(year);
if (dataFromDB.length > 0) return dataFromDB;

// 2. Fetch from external API if missing
const dataFromAPI = await ergastService.fetchData(year);

// 3. Save to database for future requests
await repository.save(transformedData);
```

### **Query Optimization**

- **Database indexes** on frequently queried columns
- **Foreign key constraints** for data integrity
- **Batched operations** for bulk data processing
- **Chunked processing** (1000 records per chunk)

## **Docker Commands**

### **Management**

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Reset database
docker-compose down -v && docker-compose up -d

# Run migrations
docker-compose exec f1-api npm run migration:run
```

### **Development**

```bash
# Build fresh image
docker-compose build --no-cache

# Access container shell
docker-compose exec f1-api sh

# View database
docker-compose exec postgres psql -U f1_user -d f1_champions
```

## **Data Flow**

1. **Client Request** → API endpoint
2. **Database Check** → Query local cache
3. **Cache Miss** → Fetch from Ergast API
4. **Data Processing** → Transform & validate
5. **Database Save** → Store for future requests
6. **Response** → Return formatted data

## **Environment Variables**

```bash
# Database Configuration
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=

# Application
NODE_ENV=production
PORT=3000
```

## **Monitoring & Health**

- **Health Checks**: Container health monitoring
- **Logging**: Structured logging with context
- **Error Handling**: Graceful error responses
- **Database Monitoring**: Connection health checks
