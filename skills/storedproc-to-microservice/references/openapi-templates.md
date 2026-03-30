# OpenAPI 3.0 Templates for Stored Procedure Extraction

Reference templates for generating OpenAPI 3.0 specifications from extracted stored procedure logic. Use these skeletons as a starting point and customize based on the specific procedure signatures.

## Base Skeleton

```yaml
openapi: "3.0.3"
info:
  title: "{Service Name} API"
  description: "API generated from extracted stored procedure logic"
  version: "1.0.0"
  contact:
    name: "API Support"
servers:
  - url: "http://localhost:8080/api/v1"
    description: "Local development"
  - url: "https://api.example.com/v1"
    description: "Production"
paths: {}
components:
  schemas: {}
  securitySchemes: {}
  responses: {}
```

## Common Response Schemas

### Success Response (Single Item)

```yaml
components:
  schemas:
    SuccessResponse:
      type: object
      required:
        - data
      properties:
        data:
          type: object
          description: "The response payload"
        metadata:
          type: object
          properties:
            timestamp:
              type: string
              format: date-time
            requestId:
              type: string
              format: uuid
```

### Success Response (Collection with Pagination)

```yaml
components:
  schemas:
    PaginatedResponse:
      type: object
      required:
        - data
        - pagination
      properties:
        data:
          type: array
          items:
            type: object
        pagination:
          type: object
          required:
            - page
            - pageSize
            - totalItems
            - totalPages
          properties:
            page:
              type: integer
              minimum: 1
              example: 1
            pageSize:
              type: integer
              minimum: 1
              maximum: 100
              example: 20
            totalItems:
              type: integer
              minimum: 0
              example: 150
            totalPages:
              type: integer
              minimum: 0
              example: 8
            hasNext:
              type: boolean
            hasPrevious:
              type: boolean
```

### Error Response

```yaml
components:
  schemas:
    ErrorResponse:
      type: object
      required:
        - error
      properties:
        error:
          type: object
          required:
            - code
            - message
          properties:
            code:
              type: string
              description: "Machine-readable error code"
              example: "VALIDATION_ERROR"
            message:
              type: string
              description: "Human-readable error message"
              example: "The request body contains invalid fields"
            details:
              type: array
              items:
                type: object
                properties:
                  field:
                    type: string
                    example: "email"
                  reason:
                    type: string
                    example: "must be a valid email address"
            requestId:
              type: string
              format: uuid
  responses:
    BadRequest:
      description: "Invalid request parameters or body"
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/ErrorResponse"
          example:
            error:
              code: "VALIDATION_ERROR"
              message: "Invalid request parameters"
              details:
                - field: "amount"
                  reason: "must be greater than 0"
    NotFound:
      description: "Resource not found"
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/ErrorResponse"
          example:
            error:
              code: "NOT_FOUND"
              message: "The requested resource was not found"
    Conflict:
      description: "Resource conflict (duplicate, state violation)"
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/ErrorResponse"
          example:
            error:
              code: "CONFLICT"
              message: "A resource with this identifier already exists"
    InternalError:
      description: "Unexpected server error"
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/ErrorResponse"
          example:
            error:
              code: "INTERNAL_ERROR"
              message: "An unexpected error occurred"
```

## Authentication and Authorization Patterns

### Bearer Token (JWT)

```yaml
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: "JWT token obtained from the identity provider"

security:
  - bearerAuth: []
```

### API Key

```yaml
components:
  securitySchemes:
    apiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key
      description: "API key for service-to-service communication"

security:
  - apiKeyAuth: []
```

### OAuth 2.0

```yaml
components:
  securitySchemes:
    oauth2:
      type: oauth2
      flows:
        clientCredentials:
          tokenUrl: "https://auth.example.com/oauth/token"
          scopes:
            read:orders: "Read order data"
            write:orders: "Create and modify orders"
            admin:orders: "Full administrative access"
```

## Versioning Strategies

### URL Path Versioning (Recommended for stored proc extraction)

```yaml
servers:
  - url: "https://api.example.com/v1"
    description: "Version 1 — initial extraction from stored procedures"
  - url: "https://api.example.com/v2"
    description: "Version 2 — refactored API with breaking changes"
```

### Header Versioning

```yaml
# Document in the API description; not directly expressible in OpenAPI 3.0
info:
  description: |
    API versioning via the `Accept-Version` header.
    Supported versions: 1.0, 2.0
    Default version: 1.0
```

## CRUD Operation Templates

### GET Collection (from SELECT query procedures)

```yaml
paths:
  /orders:
    get:
      summary: "List orders"
      description: "Extracted from sp_get_orders / usp_list_orders"
      operationId: listOrders
      tags:
        - Orders
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [PENDING, PROCESSING, COMPLETED, CANCELLED]
        - name: customerId
          in: query
          schema:
            type: integer
        - name: page
          in: query
          schema:
            type: integer
            minimum: 1
            default: 1
        - name: pageSize
          in: query
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 20
        - name: sortBy
          in: query
          schema:
            type: string
            enum: [createdAt, total, status]
            default: createdAt
        - name: sortOrder
          in: query
          schema:
            type: string
            enum: [asc, desc]
            default: desc
      responses:
        "200":
          description: "Orders retrieved successfully"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/PaginatedResponse"
        "400":
          $ref: "#/components/responses/BadRequest"
        "500":
          $ref: "#/components/responses/InternalError"
```

### GET Single Item (from SELECT by ID procedures)

```yaml
paths:
  /orders/{orderId}:
    get:
      summary: "Get order by ID"
      description: "Extracted from sp_get_order_by_id"
      operationId: getOrderById
      tags:
        - Orders
      parameters:
        - name: orderId
          in: path
          required: true
          schema:
            type: integer
            format: int64
      responses:
        "200":
          description: "Order found"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/OrderResponse"
        "404":
          $ref: "#/components/responses/NotFound"
        "500":
          $ref: "#/components/responses/InternalError"
```

### POST Create (from INSERT procedures)

```yaml
paths:
  /orders:
    post:
      summary: "Create a new order"
      description: "Extracted from sp_create_order / sp_insert_order"
      operationId: createOrder
      tags:
        - Orders
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/CreateOrderRequest"
            example:
              customerId: 12345
              items:
                - productId: 100
                  quantity: 2
                  unitPrice: 29.99
              shippingAddress:
                street: "123 Main St"
                city: "Springfield"
                state: "IL"
                zip: "62701"
      responses:
        "201":
          description: "Order created successfully"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/OrderResponse"
          headers:
            Location:
              description: "URL of the created resource"
              schema:
                type: string
                format: uri
        "400":
          $ref: "#/components/responses/BadRequest"
        "409":
          $ref: "#/components/responses/Conflict"
        "500":
          $ref: "#/components/responses/InternalError"
```

### PUT/PATCH Update (from UPDATE procedures)

```yaml
paths:
  /orders/{orderId}:
    put:
      summary: "Update an order"
      description: "Extracted from sp_update_order"
      operationId: updateOrder
      tags:
        - Orders
      parameters:
        - name: orderId
          in: path
          required: true
          schema:
            type: integer
            format: int64
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/UpdateOrderRequest"
      responses:
        "200":
          description: "Order updated successfully"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/OrderResponse"
        "400":
          $ref: "#/components/responses/BadRequest"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          $ref: "#/components/responses/Conflict"
        "500":
          $ref: "#/components/responses/InternalError"
```

### DELETE (from DELETE procedures)

```yaml
paths:
  /orders/{orderId}:
    delete:
      summary: "Delete an order"
      description: "Extracted from sp_delete_order"
      operationId: deleteOrder
      tags:
        - Orders
      parameters:
        - name: orderId
          in: path
          required: true
          schema:
            type: integer
            format: int64
      responses:
        "204":
          description: "Order deleted successfully"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          description: "Order cannot be deleted (e.g., already shipped)"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
        "500":
          $ref: "#/components/responses/InternalError"
```

## Complex Operation Templates

### Action Endpoint (from business logic procedures)

Use POST for operations that do not map cleanly to CRUD — for example, procedures that perform multi-step business logic such as order processing, approval workflows, or fund transfers.

```yaml
paths:
  /orders/{orderId}/process:
    post:
      summary: "Process an order"
      description: |
        Extracted from sp_process_order.
        Validates inventory, calculates totals with discounts,
        creates shipment record, and updates order status.
      operationId: processOrder
      tags:
        - Orders
      parameters:
        - name: orderId
          in: path
          required: true
          schema:
            type: integer
            format: int64
      requestBody:
        required: false
        content:
          application/json:
            schema:
              type: object
              properties:
                warehouseId:
                  type: integer
                  description: "Override default warehouse selection"
                priority:
                  type: string
                  enum: [STANDARD, EXPRESS, OVERNIGHT]
                  default: STANDARD
      responses:
        "200":
          description: "Order processed successfully"
          content:
            application/json:
              schema:
                type: object
                properties:
                  orderId:
                    type: integer
                  status:
                    type: string
                    example: "PROCESSED"
                  shipmentId:
                    type: integer
                  estimatedDelivery:
                    type: string
                    format: date
        "400":
          $ref: "#/components/responses/BadRequest"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          description: "Order is in a state that cannot be processed"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
        "500":
          $ref: "#/components/responses/InternalError"
```

### Report Endpoint (from aggregate query procedures)

```yaml
paths:
  /orders/reports/sales-summary:
    get:
      summary: "Sales summary report"
      description: |
        Extracted from sp_sales_summary_report.
        Aggregates sales data by region and time period.
      operationId: getSalesSummary
      tags:
        - Reports
      parameters:
        - name: startDate
          in: query
          required: true
          schema:
            type: string
            format: date
        - name: endDate
          in: query
          required: true
          schema:
            type: string
            format: date
        - name: region
          in: query
          schema:
            type: string
        - name: groupBy
          in: query
          schema:
            type: string
            enum: [day, week, month, quarter]
            default: month
      responses:
        "200":
          description: "Report generated successfully"
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      type: object
                      properties:
                        period:
                          type: string
                        region:
                          type: string
                        totalSales:
                          type: number
                          format: double
                        orderCount:
                          type: integer
                        averageOrderValue:
                          type: number
                          format: double
                  summary:
                    type: object
                    properties:
                      grandTotal:
                        type: number
                        format: double
                      totalOrders:
                        type: integer
        "400":
          $ref: "#/components/responses/BadRequest"
        "500":
          $ref: "#/components/responses/InternalError"
```

### Batch Operation Endpoint (from bulk processing procedures)

```yaml
paths:
  /orders/batch/status-update:
    post:
      summary: "Batch update order statuses"
      description: |
        Extracted from sp_batch_update_status.
        Updates multiple orders in a single transactional operation.
      operationId: batchUpdateStatus
      tags:
        - Orders
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - updates
              properties:
                updates:
                  type: array
                  minItems: 1
                  maxItems: 500
                  items:
                    type: object
                    required:
                      - orderId
                      - newStatus
                    properties:
                      orderId:
                        type: integer
                      newStatus:
                        type: string
                        enum: [PROCESSING, SHIPPED, DELIVERED, CANCELLED]
                      reason:
                        type: string
      responses:
        "200":
          description: "Batch update completed"
          content:
            application/json:
              schema:
                type: object
                properties:
                  totalProcessed:
                    type: integer
                  succeeded:
                    type: integer
                  failed:
                    type: integer
                  errors:
                    type: array
                    items:
                      type: object
                      properties:
                        orderId:
                          type: integer
                        reason:
                          type: string
        "400":
          $ref: "#/components/responses/BadRequest"
        "500":
          $ref: "#/components/responses/InternalError"
```

## Stored Procedure Parameter to Schema Mapping

Use this table when translating stored procedure parameters into OpenAPI schema properties:

| SQL Type | OpenAPI Type | Format | Notes |
|----------|-------------|--------|-------|
| INT / INTEGER | integer | int32 | |
| BIGINT | integer | int64 | |
| SMALLINT / TINYINT | integer | int32 | Add minimum/maximum constraints |
| DECIMAL(p,s) / NUMERIC | number | double | Use string for financial precision |
| FLOAT / REAL | number | float | |
| VARCHAR(n) / NVARCHAR(n) | string | | Add maxLength: n |
| CHAR(n) / NCHAR(n) | string | | Add minLength: n, maxLength: n |
| TEXT / NTEXT / CLOB | string | | |
| DATE | string | date | ISO 8601 (YYYY-MM-DD) |
| DATETIME / TIMESTAMP | string | date-time | ISO 8601 |
| BIT / BOOLEAN | boolean | | |
| UNIQUEIDENTIFIER / UUID | string | uuid | |
| VARBINARY / BLOB | string | byte | Base64 encoded |
| XML | string | | Consider converting to JSON |
| TABLE type (T-SQL) | array | | Array of objects in request body |
| REF CURSOR (PL/SQL) | array | | Array of objects in response |
| OUT parameter | - | - | Map to response body property |
| RETURN value | - | - | Map to response body or HTTP status |
