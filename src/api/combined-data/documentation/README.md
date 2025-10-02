# Combined Data API Documentation

## Overview

The Combined Data API provides a unified interface to access data from all loan-related domains in your Strapi application. It uses a **LEFT JOIN approach** where loan applications serve as the primary table, and related data from other domains is automatically included when relationships exist.

**Domains Covered:**

- **Loan Applications** (Primary table)
- **Loan Acceptance** (Fully integrated)
- **Business Valuation**
- **Holofnama**
- **Bail Bond**

## Key Features

- **LEFT JOIN Approach**: Loan applications are the primary table; other domain data is joined when available
- **Domain Flags**: Each record includes flags indicating which related domains have data
- **Loan Acceptance Integration**: Fully integrated loan acceptance domain with proper relationships
- **Unified Data Structure**: Combines data from multiple domains into a consistent format
- **Deduplication**: Removes repetitive columns and information
- **Advanced Filtering**: Filter by multiple criteria across domains
- **Pagination**: Efficient data loading with pagination support
- **Export**: CSV export functionality with domain flags
- **Summary Statistics**: Get overview statistics across all domains

## Domain Flags

Each record now includes a `flags` property that indicates which related domains have data:

```typescript
interface DomainFlags {
  hasLoanAcceptance: boolean; // True if loan acceptance record exists
  hasBusinessValuation: boolean; // True if business valuation exists
  hasHolofnama: boolean; // True if holofnama documentation exists
  hasBailBond: boolean; // True if bail bond records exist
}
```

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
      "loan_amount_requested": 50000,
      "national_id": "1234567890",
      "business_name": "Tech Solutions Ltd",
      "applicant_name": "John Doe",
      "loan_status": "APPROVED",
      "loan_program": "Rural Development Program",
      "application_date": "2024-01-15T10:30:00.000Z",

      "flags": {
        "hasLoanAcceptance": true,
        "hasBusinessValuation": true,
        "hasHolofnama": false,
        "hasBailBond": false
      },

      "loan_acceptance": {
        "acceptance_status": "ACCEPTED",
        "acceptance_date": "2024-01-20T14:30:00.000Z",
        "disbursement_amount": 45000
      },

      "business_valuation": {
        "valuation_amount": 75000,
        "valuation_date": "2024-01-18T09:00:00.000Z"
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

Exports filtered data to CSV format with domain flags included as separate columns. Supports all the same query parameters as the main endpoint.

#### CSV Format

The exported CSV includes:

- All loan application fields
- Domain flag columns: "Has Loan Acceptance", "Has Business Valuation", "Has Holofnama", "Has Bail Bond"
- Related domain data when available

**Example CSV Headers:**

```
ID,Loan Amount Requested,National ID,Business Name,Applicant Name,...,Has Loan Acceptance,Has Business Valuation,Has Holofnama,Has Bail Bond
```

#### Usage Examples

```javascript
// Export all data with domain flags
window.open("/api/combined-data/export");

// Export approved loans only
window.open("/api/combined-data/export?status=APPROVED");

// Export loans from specific district
window.open("/api/combined-data/export?district=Dhaka");
```

## Data Structure

### Combined Data Response Format

Each record in the combined data includes a `flags` property that indicates which related domains have data:

```json
{
  "id": 123,
  "loan_amount_requested": 50000,
  "national_id": "1234567890",
  "business_name": "Tech Solutions Ltd",
  "applicant_name": "John Doe",
  "loan_status": "APPROVED",
  "loan_program": "Rural Development Program",
  "application_date": "2024-01-15T10:30:00.000Z",

  "flags": {
    "hasLoanAcceptance": true,
    "hasBusinessValuation": true,
    "hasHolofnama": false,
    "hasBailBond": false
  },

  "loan_acceptance": {
    "acceptance_status": "ACCEPTED",
    "acceptance_date": "2024-01-20T14:30:00.000Z",
    "disbursement_amount": 45000
  },

  "business_valuation": {
    "valuation_amount": 75000,
    "valuation_date": "2024-01-18T09:00:00.000Z"
  }
}
```

### TypeScript Interfaces

```typescript
interface DomainFlags {
  hasLoanAcceptance: boolean;
  hasBusinessValuation: boolean;
  hasHolofnama: boolean;
  hasBailBond: boolean;
}

interface CombinedLoanData {
  id: number;
  loan_amount_requested: number;
  national_id: string;
  business_name: string;
  applicant_name: string;

  // Domain flags (always present)
  flags: DomainFlags;

  // Loan domain data (always present)
  loan_status: string;
  loan_program: string;
  application_date: Date;

  // Related domain data (present when relationships exist)
  loan_acceptance?: {
    acceptance_status: string;
    acceptance_date: Date;
    disbursement_amount: number;
  };

  business_valuation?: {
    valuation_amount: number;
    valuation_date: Date;
  };

  holofnama?: {
    document_number: string;
    issue_date: Date;
  };

  bail_bonds?: Array<{
    bond_amount: number;
    bond_date: Date;
  }>;
}
```

## Usage Examples

### Basic Usage with Domain Flags

```javascript
// Get first page of all data with domain flags
fetch("/api/combined-data")
  .then((response) => response.json())
  .then((data) => {
    data.data.forEach((record) => {
      console.log(`Record ${record.id}:`);
      console.log(`- Has Loan Acceptance: ${record.flags.hasLoanAcceptance}`);
      console.log(
        `- Has Business Valuation: ${record.flags.hasBusinessValuation}`
      );
      console.log(`- Has Holofnama: ${record.flags.hasHolofnama}`);
      console.log(`- Has Bail Bond: ${record.flags.hasBailBond}`);
    });
  });

// Filter records that have loan acceptance
fetch("/api/combined-data")
  .then((response) => response.json())
  .then((data) => {
    const recordsWithAcceptance = data.data.filter(
      (record) => record.flags.hasLoanAcceptance
    );
    console.log("Records with loan acceptance:", recordsWithAcceptance);
  });
```

### Advanced Filtering with Domain Data

```javascript
// Get approved loans with business valuation
fetch("/api/combined-data?status=APPROVED")
  .then((response) => response.json())
  .then((data) => {
    const approvedWithValuation = data.data.filter(
      (record) => record.flags.hasBusinessValuation
    );
    console.log(
      "Approved loans with business valuation:",
      approvedWithValuation
    );
  });

// Get loan applications with amount between 10k-50k
fetch("/api/combined-data?loanAmountMin=10000&loanAmountMax=50000")
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

1. **Use Domain Flags**: Check the `flags` property to determine which related data is available before accessing nested objects
2. **Use LEFT JOIN Approach**: The API automatically fetches loan applications with their related data - this is the most efficient way to get complete information
3. **Pagination**: Always use pagination for large datasets to avoid loading too much data at once
4. **Filtering**: Apply specific filters to get only the data you need
5. **Error Handling**: Always handle errors appropriately in your client code
6. **Authentication**: Enable authentication in production environments

### Working with Domain Flags

```javascript
// Safe way to access related data using flags
function processLoanData(record) {
  console.log(`Processing loan ${record.id}`);

  if (record.flags.hasLoanAcceptance) {
    console.log(
      `Acceptance Status: ${record.loan_acceptance.acceptance_status}`
    );
  }

  if (record.flags.hasBusinessValuation) {
    console.log(
      `Business Value: ${record.business_valuation.valuation_amount}`
    );
  }

  if (record.flags.hasHolofnama) {
    console.log(`Document Number: ${record.holofnama.document_number}`);
  }

  if (record.flags.hasBailBond) {
    console.log(`Bail Bonds Count: ${record.bail_bonds.length}`);
  }
}
```

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

- **Domain Flags**: Quickly determine which related data is available without checking for null/undefined values
- **Always Shows Loan Applications**: If you have loan application data, it will always appear
- **Related Data Included**: Loan acceptance, business valuations, holofnama, bail bonds are automatically included when they exist
- **No Missing Information**: The LEFT JOIN approach ensures no loan applications are lost
- **Smart Organization**: Related data is properly nested and deduplicated
- **Safe Data Access**: Use flags to safely access nested objects without errors
- **CSV Export Ready**: Domain flags are included in CSV exports for easy analysis

## Migration Notes

If you're migrating from the previous API version:

1. **Response Structure Changed**: The new format includes `flags` property and flattened loan data
2. **Domain Flags Added**: Use `record.flags.hasLoanAcceptance` instead of checking `record.loan_acceptance !== null`
3. **Loan Acceptance Integration**: Loan acceptance data is now fully integrated and available in the response
4. **CSV Export Enhanced**: CSV now includes domain flag columns for better data analysis

---

**API Version**: 2.0  
**Last Updated**: January 2025  
**Domain Coverage**: Loan Applications, Loan Acceptance, Business Valuation, Holofnama, Bail Bond

## Security

- Enable authentication in production
- Validate all input parameters
- Consider rate limiting for public APIs
- Implement proper access controls based on user roles
