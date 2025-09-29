# Combined Data API Documentation

## Overview

The Combined Data API provides a unified interface to access data from all loan-related domains in your Strapi application. It uses a **LEFT JOIN approach** where loan applications serve as the primary table, and related data from other domains is automatically included when relationships exist.

**Domains Covered:**

- **Loan Applications** (Primary table)
- Loan Acceptance
- Business Valuation
- Holofnama
- Bail Bond

## Key Features

- **LEFT JOIN Approach**: Loan applications are the primary table; other domain data is joined when available
- **Unified Data Structure**: Combines data from multiple domains into a consistent format
- **Deduplication**: Removes repetitive columns and information
- **Advanced Filtering**: Filter by multiple criteria across domains
- **Pagination**: Efficient data loading with pagination support
- **Export**: CSV export functionality
- **Summary Statistics**: Get overview statistics across all domains

## How It Works

The API works like a **LEFT JOIN** in SQL:

1. **Primary Data Source**: All loan applications are fetched with their complete information
2. **Automatic Relations**: Related data from other domains (business valuation, holofnama, bail bonds, etc.) is automatically included when relationships exist
3. **No Missing Data**: If you have loan applications, they will always appear, even if they don't have related records in other domains
4. **Standalone Records**: When specifically requesting other domains, standalone records (not linked to loan applications) are also included
5. **Smart Deduplication**: The system avoids showing the same information multiple times

## API Endpoints

### 1. Get Combined Data

```
GET /api/combined-data
```

Retrieves paginated combined data from all or specified domains.

#### Query Parameters

| Parameter       | Type         | Description                                                                | Example                                                                       |
| --------------- | ------------ | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `page`          | number       | Page number (default: 1)                                                   | `?page=2`                                                                     |
| `pageSize`      | number       | Items per page (1-100, default: 25)                                        | `?pageSize=50`                                                                |
| `domain`        | string/array | Filter by domain(s)                                                        | `?domain=loan-application` or `?domain[]=loan-application&domain[]=bail-bond` |
| `status`        | string       | Filter by loan status                                                      | `?status=APPROVED`                                                            |
| `programName`   | string       | Filter by program name (partial match)                                     | `?programName=Rural`                                                          |
| `district`      | string       | Filter by district                                                         | `?district=Dhaka`                                                             |
| `applicantName` | string       | Filter by applicant name (partial match)                                   | `?applicantName=John`                                                         |
| `nationalId`    | string       | Filter by exact National ID                                                | `?nationalId=1234567890`                                                      |
| `loanAmountMin` | number       | Minimum loan amount                                                        | `?loanAmountMin=10000`                                                        |
| `loanAmountMax` | number       | Maximum loan amount                                                        | `?loanAmountMax=50000`                                                        |
| `dateFrom`      | string       | Start date (YYYY-MM-DD)                                                    | `?dateFrom=2024-01-01`                                                        |
| `dateTo`        | string       | End date (YYYY-MM-DD)                                                      | `?dateTo=2024-12-31`                                                          |
| `sortBy`        | string       | Sort field (`createdAt`, `applicantName`, `loanAmount`, `applicationDate`) | `?sortBy=loanAmount`                                                          |
| `sortOrder`     | string       | Sort order (`asc`, `desc`)                                                 | `?sortOrder=desc`                                                             |

#### Response Format

```json
{
  "data": [
    {
      "id": 123,
      "domain": "loan-application",
      "applicant": {
        "id": 123,
        "name": "John Doe",
        "nationalId": "1234567890",
        "phone": "+8801234567890",
        "address": "123 Main St, Dhaka",
        "age": 35,
        "gender": "male",
        "educationLevel": "graduate"
      },
      "loan": {
        "id": 123,
        "amount": 50000,
        "status": "APPROVED",
        "purpose": "Business expansion",
        "applicationDate": "2024-01-15"
      },
      "banking": {
        "mobileBankingType": "BKASH",
        "mobileBankingAccNo": "01234567890"
      },
      "program": {
        "programName": "Rural Development Program",
        "district": "Dhaka"
      },
      "relations": {
        "loanApplicationId": 123,
        "businessValuationId": 456
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 4,
      "total": 98
    },
    "summary": {
      "totalByDomain": {
        "loan-application": 45,
        "loan-acceptance": 23,
        "business-valuation": 15,
        "holofnama": 10,
        "bail-bond": 5
      },
      "totalAmount": 2500000,
      "statusDistribution": {
        "APPROVED": 67,
        "PENDING": 23,
        "REJECTED": 8
      }
    }
  }
}
```

### 2. Get Summary Statistics

```
GET /api/combined-data/summary
```

Returns overview statistics across all domains.

#### Response Format

```json
{
  "totalRecords": 150,
  "domainCounts": {
    "loan-application": 75,
    "loan-acceptance": 30,
    "business-valuation": 25,
    "holofnama": 15,
    "bail-bond": 5
  },
  "statusDistribution": {
    "APPROVED": 89,
    "PENDING": 45,
    "REJECTED": 16
  },
  "totalLoanAmount": 5750000,
  "averageLoanAmount": 38333.33,
  "recentApplications": 23
}
```

### 3. Get Specific Record

```
GET /api/combined-data/{domain}/{id}
```

Retrieves a specific record by domain and ID.

#### Parameters

- `domain`: One of `loan-application`, `loan-acceptance`, `business-valuation`, `holofnama`, `bail-bond`
- `id`: The record ID

### 4. Get Records by National ID

```
GET /api/combined-data/by-nid/{nationalId}
```

Retrieves all records for a specific National ID across all domains.

### 5. Get Records by Program

```
GET /api/combined-data/by-program/{programName}
```

Retrieves all records for a specific program.

### 6. Export Data

```
GET /api/combined-data/export
```

Exports filtered data to CSV format. Supports all the same query parameters as the main endpoint.

## Data Structure

### PersonInfo

```typescript
{
  id: number;
  name: string;
  nationalId?: string | number;
  phone?: string;
  address?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  educationLevel?: string;
  photos?: any[];
  signature?: any;
  nidDoc?: any;
}
```

### LoanInfo

```typescript
{
  id: number;
  formNo?: number;
  amount: number;
  status?: string;
  purpose?: string;
  applicationDate?: string;
  businessType?: 'NEW' | 'OLD';
  // ... other loan fields
}
```

## Usage Examples

### Basic Usage

```javascript
// Get first page of all data
fetch("/api/combined-data")
  .then((response) => response.json())
  .then((data) => console.log(data));

// Get approved loans only
fetch("/api/combined-data?status=APPROVED")
  .then((response) => response.json())
  .then((data) => console.log(data));

// Get loan applications with amount between 10k-50k
fetch(
  "/api/combined-data?domain=loan-application&loanAmountMin=10000&loanAmountMax=50000"
)
  .then((response) => response.json())
  .then((data) => console.log(data));
```

### Advanced Filtering

```javascript
// Complex query with multiple filters
const params = new URLSearchParams({
  domain: "loan-application",
  status: "APPROVED",
  district: "Dhaka",
  dateFrom: "2024-01-01",
  dateTo: "2024-12-31",
  sortBy: "loanAmount",
  sortOrder: "desc",
  page: "1",
  pageSize: "50",
});

fetch(`/api/combined-data?${params}`)
  .then((response) => response.json())
  .then((data) => console.log(data));
```

### Export Data

```javascript
// Export filtered data to CSV
const exportParams = new URLSearchParams({
  domain: "loan-application",
  status: "APPROVED",
  dateFrom: "2024-01-01",
});

window.open(`/api/combined-data/export?${exportParams}`);
```

## Best Practices

1. **Use LEFT JOIN Approach**: The API automatically fetches loan applications with their related data - this is the most efficient way to get complete information
2. **Pagination**: Always use pagination for large datasets to avoid loading too much data at once
3. **Filtering**: Apply specific filters to get only the data you need
4. **Error Handling**: Always handle errors appropriately in your client code
5. **Authentication**: Enable authentication in production environments

## Error Handling

The API returns standard HTTP status codes:

- `200`: Success
- `400`: Bad Request (invalid parameters)
- `404`: Not Found
- `500`: Internal Server Error

Error responses include a message explaining the issue:

```json
{
  "error": {
    "status": 400,
    "name": "BadRequestError",
    "message": "Page must be greater than 0"
  }
}
```

## Data Structure Benefits

- **Always Shows Loan Applications**: If you have loan application data, it will always appear
- **Related Data Included**: Business valuations, holofnama, bail bonds are automatically included when they exist
- **No Missing Information**: The LEFT JOIN approach ensures no loan applications are lost
- **Smart Organization**: Related data is properly nested and deduplicated

## Security

- Enable authentication in production
- Validate all input parameters
- Consider rate limiting for public APIs
- Implement proper access controls based on user roles
