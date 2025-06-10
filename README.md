# 🏁 F1 World Champions API

A **NestJS API** that provides Formula 1 World Champions data and race results from **2005 to present**.

## **Project Overview**

This API serves as the backend for SPA/Mobile applications displaying F1 World Champions and race data. It implements intelligent caching by checking the database first, then fetching from the Ergast F1 API when needed.

### **Key Features**

- **Season Champions**: Get F1 World Champions by year range
- **Race Results**: Fetch race winners for specific seasons
- **Performance Optimized**: Database indexes for sub-millisecond queries
- **Cache-Aside Pattern**: Database-first with Ergast API fallback
- **Docker Ready**: Complete containerized setup
- **Data Integrity**: Foreign key relationships and constraints

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
   cp .env
   # Edit .env with required variables
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

### **Query Optimization**

- **Database indexes** on frequently queried columns
- **Foreign key constraints** for data integrity

## **Docker Commands**

## **Data Flow**

1. **Client Request** → API endpoint
2. **Database Check** → Query database
3. **DB Miss** → Fetch from Ergast API
4. **Data Processing** → Transform & validate
5. **Database Save** → Store for future requests
6. **Response** → Return data

## **Environment Variables**

```bash
# app confg
NODE_ENV=***
PORT=***

# docker config
BUILD_TARGET=***
VOLUME_MODE=***

# DB config
DB_HOST=***
DB_PORT=***
DB_USER=***
DB_PASSWORD=***
DB_NAME=***

# pgAdmin confg
PGADMIN_EMAIL=***
PGADMIN_PASSWORD=***
PGADMIN_PORT=***
```
