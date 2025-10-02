# Dashboard API Documentation

## Overview

The Dashboard API provides summary statistics and overview data for the loan management system.

## Endpoints

### GET /api/dashboard/overview

Returns an overview of key statistics including application counts, loan amounts, and rates.

#### Response Format

```json
{
  "status": "success",
  "data": {
    "totalApplications": 15420,
    "pendingApplications": 2341,
    "approvedApplications": 8965,
    "rejectedApplications": 3214,
    "disbursedLoans": 7890,
    "totalLoanAmount": 45678900.5,
    "recoveryRate": 22.2,
    "approvalRate": 73.2
  },
  "timestamp": "2025-10-02T10:30:00Z"
}
```

#### Response Fields

- `totalApplications` (number): Total number of loan applications
- `pendingApplications` (number): Applications with status DRAFT, INITIATE_APPROVAL_PROCESS, FORWARDED_FOR_APPROVAL, or IN_PROGRESS
- `approvedApplications` (number): Applications with status APPROVED
- `rejectedApplications` (number): Applications with status REJECTED
- `disbursedLoans` (number): Count of approved loans (simplified - may need business logic adjustment)
- `totalLoanAmount` (number): Sum of all approved loan amounts
- `recoveryRate` (number): Loan recovery rate percentage (placeholder implementation)
- `approvalRate` (number): Approval rate percentage (approved / total \* 100)

#### Status Codes

- `200 OK`: Successful request
- `403 Forbidden`: Authentication required
- `500 Internal Server Error`: Server error

#### Authentication

This endpoint requires authentication. Include a valid Bearer token in the Authorization header.

#### Example Request

```bash
curl -X GET "http://localhost:1337/api/dashboard/overview" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### Notes

- The `disbursedLoans` count currently uses approved applications as a simplified approach
- The `recoveryRate` is a placeholder implementation that should be replaced with actual recovery logic
- Loan status enumeration: DRAFT, INITIATE_APPROVAL_PROCESS, FORWARDED_FOR_APPROVAL, IN_PROGRESS, APPROVED, REJECTED

---

### GET /api/dashboard/charts

Returns chart data for various categories including status distribution, loan types, age groups, and income ranges.

#### Response Format

```json
{
  "status": "success",
  "data": {
    "statusDistribution": {
      "type": "pie",
      "data": [
        { "label": "Approved", "value": 58.2, "count": 8965 },
        { "label": "Rejected", "value": 20.8, "count": 3214 },
        { "label": "Pending", "value": 15.2, "count": 2341 },
        { "label": "Under Review", "value": 5.8, "count": 900 }
      ]
    },
    "loanTypeDistribution": {
      "type": "bar",
      "data": [
        { "category": "Personal Loan", "count": 6540, "percentage": 42.4 },
        { "category": "Home Loan", "count": 4230, "percentage": 27.4 },
        { "category": "Auto Loan", "count": 2890, "percentage": 18.7 },
        { "category": "Business Loan", "count": 1760, "percentage": 11.4 }
      ]
    },
    "ageGroupDistribution": {
      "type": "bar",
      "data": [
        { "ageGroup": "18-25", "count": 2156, "approvalRate": 65.2 },
        { "ageGroup": "26-35", "count": 5847, "approvalRate": 78.9 },
        { "ageGroup": "36-45", "count": 4523, "approvalRate": 82.1 },
        { "ageGroup": "46-55", "count": 2134, "approvalRate": 79.5 },
        { "ageGroup": "55+", "count": 760, "approvalRate": 71.3 }
      ]
    },
    "incomeRangeDistribution": {
      "type": "bar",
      "data": [
        { "range": "0-25k", "count": 1823, "approvalRate": 45.2 },
        { "range": "25k-50k", "count": 4567, "approvalRate": 68.9 },
        { "range": "50k-75k", "count": 3890, "approvalRate": 82.3 },
        { "range": "75k-100k", "count": 2456, "approvalRate": 89.1 },
        { "range": "100k+", "count": 2684, "approvalRate": 92.7 }
      ]
    }
  },
  "timestamp": "2025-10-02T10:30:00Z"
}
```

#### Response Fields

**statusDistribution**

- `type`: Chart type (pie)
- `data`: Array of status distribution data
  - `label`: Status label (Approved, Rejected, Pending, Under Review)
  - `value`: Percentage of total applications
  - `count`: Number of applications in this status

**loanTypeDistribution**

- `type`: Chart type (bar)
- `data`: Array of loan type data
  - `category`: Loan category (Personal Loan, Home Loan, Auto Loan, Business Loan)
  - `count`: Number of applications for this category
  - `percentage`: Percentage of total applications

**ageGroupDistribution**

- `type`: Chart type (bar)
- `data`: Array of age group data
  - `ageGroup`: Age range (18-25, 26-35, 36-45, 46-55, 55+)
  - `count`: Number of applications in this age group
  - `approvalRate`: Approval rate percentage for this age group

**incomeRangeDistribution**

- `type`: Chart type (bar)
- `data`: Array of income range data (based on loan amount requested)
  - `range`: Income/loan amount range (0-25k, 25k-50k, etc.)
  - `count`: Number of applications in this range
  - `approvalRate`: Approval rate percentage for this range

#### Status Codes

- `200 OK`: Successful request
- `403 Forbidden`: Authentication required
- `500 Internal Server Error`: Server error

#### Authentication

This endpoint is public and does not require authentication.

#### Example Request

```bash
curl -X GET "http://localhost:1337/api/dashboard/charts" \
  -H "Content-Type: application/json"
```

#### Notes

- Loan types are categorized based on the `loan_purpose` field
- Age groups use the `age` field from loan applications
- Income ranges are estimated based on `loan_amount_requested` values
- Status categories group related loan statuses together for better visualization

---

### GET /api/dashboard/timeseries

Returns monthly time series data for applications and loan amounts over a specified period.

#### Query Parameters

- `period` (optional): Time period for data retrieval. Default: "12months"
  - Format: `{number}months` (e.g., "6months", "24months")
  - Format: `{number}year` (e.g., "1year", "2year")

#### Response Format

```json
{
  "status": "success",
  "data": {
    "applications": [
      {
        "month": "2024-11",
        "count": 1200,
        "approved": 780,
        "rejected": 320,
        "pending": 100
      },
      {
        "month": "2024-12",
        "count": 1450,
        "approved": 920,
        "rejected": 380,
        "pending": 150
      },
      {
        "month": "2025-01",
        "count": 1350,
        "approved": 850,
        "rejected": 340,
        "pending": 160
      },
      {
        "month": "2025-02",
        "count": 1280,
        "approved": 810,
        "rejected": 310,
        "pending": 160
      },
      {
        "month": "2025-03",
        "count": 1420,
        "approved": 900,
        "rejected": 360,
        "pending": 160
      },
      {
        "month": "2025-04",
        "count": 1380,
        "approved": 880,
        "rejected": 340,
        "pending": 160
      },
      {
        "month": "2025-05",
        "count": 1520,
        "approved": 980,
        "rejected": 380,
        "pending": 160
      },
      {
        "month": "2025-06",
        "count": 1460,
        "approved": 940,
        "rejected": 360,
        "pending": 160
      },
      {
        "month": "2025-07",
        "count": 1390,
        "approved": 900,
        "rejected": 330,
        "pending": 160
      },
      {
        "month": "2025-08",
        "count": 1480,
        "approved": 960,
        "rejected": 360,
        "pending": 160
      },
      {
        "month": "2025-09",
        "count": 1560,
        "approved": 1020,
        "rejected": 380,
        "pending": 160
      },
      {
        "month": "2025-10",
        "count": 567,
        "approved": 234,
        "rejected": 145,
        "pending": 188
      }
    ],
    "loanAmounts": [
      { "month": "2024-11", "totalAmount": 3600000, "averageAmount": 30000 },
      { "month": "2024-12", "totalAmount": 4200000, "averageAmount": 32500 },
      { "month": "2025-01", "totalAmount": 3900000, "averageAmount": 31000 },
      { "month": "2025-02", "totalAmount": 3750000, "averageAmount": 29500 },
      { "month": "2025-03", "totalAmount": 4100000, "averageAmount": 33000 },
      { "month": "2025-04", "totalAmount": 3980000, "averageAmount": 32000 },
      { "month": "2025-05", "totalAmount": 4350000, "averageAmount": 34500 },
      { "month": "2025-06", "totalAmount": 4200000, "averageAmount": 33000 },
      { "month": "2025-07", "totalAmount": 4000000, "averageAmount": 31500 },
      { "month": "2025-08", "totalAmount": 4250000, "averageAmount": 33500 },
      { "month": "2025-09", "totalAmount": 4480000, "averageAmount": 35000 },
      { "month": "2025-10", "totalAmount": 1750000, "averageAmount": 34500 }
    ]
  },
  "timestamp": "2025-10-02T10:30:00Z"
}
```

#### Response Fields

**applications**

- Array of monthly application statistics
- `month` (string): Month in YYYY-MM format
- `count` (number): Total applications for the month
- `approved` (number): Approved applications for the month
- `rejected` (number): Rejected applications for the month
- `pending` (number): Pending applications (DRAFT, INITIATE_APPROVAL_PROCESS, etc.)

**loanAmounts**

- Array of monthly loan amount statistics
- `month` (string): Month in YYYY-MM format
- `totalAmount` (number): Total loan amount approved for the month
- `averageAmount` (number): Average loan amount for approved loans

#### Status Codes

- `200 OK`: Successful request
- `400 Bad Request`: Invalid period parameter
- `500 Internal Server Error`: Server error

#### Authentication

This endpoint is public and does not require authentication.

#### Example Requests

```bash
# Get last 12 months data (default)
curl -X GET "http://localhost:1337/api/dashboard/timeseries" \
  -H "Content-Type: application/json"

# Get last 6 months data
curl -X GET "http://localhost:1337/api/dashboard/timeseries?period=6months" \
  -H "Content-Type: application/json"

# Get last 2 years data
curl -X GET "http://localhost:1337/api/dashboard/timeseries?period=2year" \
  -H "Content-Type: application/json"
```

#### Notes

- Data is filtered by `application_date` field
- Months with no data will show zero values
- Only approved loans are included in loan amount calculations
- Time series data is useful for trend analysis and forecasting
- Data is returned in chronological order (oldest to newest)
