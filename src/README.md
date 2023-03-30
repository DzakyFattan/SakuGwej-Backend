# API Documentations

## Authentication & Profile

### POST: /api/v1/user/register

#### Required (as JSON payload):

- username
- email
- password

#### Response:

- 201 CREATED
- 4XX with JSON Payload:

```json
{
  "message": "{Error message}"
}
```

### POST: /api/v1/user/login

#### Required (as JSON payload):

- email
- password

#### Response:

- 200 OK with JSON payload:

```json
{
  "message": "Login successful",
  "token": "{JWT}",
  "theme": "{theme}"
}
```

- 4XX with JSON Payload:

```json
{
  "message": "{Error message}"
}
```

### POST: /api/v1/user/change-profile

#### Required:

- JWT (as bearer token)

#### Optional (as JSON payload):

- newUsername
- newPassword
- newGender ('Perempuan', 'Laki-Laki', 'Lainnya', 'Roti Tawar')
- newBirthDate ('YYYY-MM-DD')
- newEmail
- newPhoneNumber
- newTheme

#### Response:

- 200 OK with JSON payload:

```json
{
  "message": "Profile updated successfully"
}
```

- 4XX with JSON Payload:

```json
{
  "message": "{Error message}"
}
```

### GET: /api/v1/user/profile

#### Required:

- JWT (as bearer token)

#### Response:

- 200 OK with JSON Payload:

```json
{
  "message": "success",
  "data": {
    "username": "{username}",
    "birthDate": "{birthDate}",
    "email": "{email}",
    "gender": "{gender}",
    "phoneNumber": "{phoneNumber}",
    "theme": "{theme}"
  }
}
```

- 4xx with JSON Payload:

```json
{
  "message": "{Error message}"
}
```

### POST: /api/v1/user/change-profile-picture

#### Required:

- JWT (as bearer token)
- a single image file (from form-data, key is not important)

#### Response:

- 200 OK with JSON payload:

```json
{
  "message": "Profile picture updated successfully",
  "profilePicture": "{profilePictureURL}"
}
```

- 4XX with JSON Payload:

```json
{
  "message": "{Error message}"
}
```

## Accounts

### GET: /api/v1/accounts?{query}

#### Query (optional)

```
limit={start}&skip={end}&until={until}
```

#### Required:

- JWT (as bearer token)

#### Response:

- 200 OK with JSON Payload:

```json
{
  "message": "Account found",
  "data": [
    {
      "userId": "{userId}",
      "name": "{accountName}",
      "number": "{accountNumber}",
      "description": "{accountDescription}",
      "amount": "{amount}",
      "priority": "{priority}"
    },
    {
      /* ... */
    }
  ]
}
```

- 4xx with JSON Payload:

```json
{
  "message": "{Error message}"
}
```

### POST: /api/v1/accounts

#### Required (as JSON payload):

- userId
- name
- number
- description
- amount
- priority (optional, default: 0)

#### Response:

- 201 CREATED
- 4XX with JSON Payload:

```json
{
  "message": "{Error message}"
}
```

### PATCH: /api/v1/accounts

#### Required:

- JWT (as bearer token)

#### Optional (as JSON payload):

- userId
- name
- number
- description
- amount
- priority

#### Response:

- 200 OK with JSON payload:

```json
{
  "message": "Account updated successfully"
}
```

- 4XX with JSON Payload:

```json
{
  "message": "{Error message}"
}
```

### DELETE: /api/v1/accounts

#### Required:

- JWT (as bearer token)

#### Response:

- 200 OK with JSON payload:

```json
{
  "message": "Account deleted successfully"
}
```

- 4XX with JSON Payload:

```json
{
  "message": "{Error message}"
}
```

## Transactions

### GET: /api/v1/transactions?{query}

#### Query (optional)

```
limit={start}&skip={end}&until={until}
```

#### Required:

- JWT (as bearer token)

#### Response:

- 200 OK with JSON Payload:

```json
{
  "message": "Account",
  "data": [
    {
      "userId": "{userId}",
      "accountId": "{accountId}",
      "type": "{type}",
      "amount": "{amount}",
      "category": "{category}",
      "description": "{description}",
      "createdAt": "{createdAt}"
    },
    {
      /* ... */
    }
  ]
}
```

### GET: /api/v1/transactions/:interval?{query}

- interval: 'daily', 'weekly', 'monthly', 'yearly'
- query: 'limit={start}&skip={end}&until={until}' (optional)

#### Required:

- JWT (as bearer token)

#### Response:

- 200 OK with JSON Payload:

```json
{
  "message": "Account",
  "data": [
    {
      "createdAt": "{createdAt}",
      "notes": [
        {
          "userId": "{userId}",
          "accountId": "{accountId}",
          "type": "{type}",
          "amount": "{amount}",
          "category": "{category}",
          "description": "{description}",
          "createdAt": "{createdAt}"
        },
        {
          /* ... */
        }
      ]
    },
    {
      /* ... */
    }
    //...
  ]
}
```

- 4xx with JSON Payload:

```json
{
  "message": "{Error message}"
}
```

### POST: /api/v1/transactions

#### Required (as JSON payload):

- userId
- accountId
- type
- amount
- category
- description
- createdAt

#### Response:

- 201 CREATED
- 4XX with JSON Payload:

```json
{
  "message": "{Error message}"
}
```

### PATCH: /api/v1/transactions

#### Required:

- JWT (as bearer token)

#### Optional (as JSON payload):

- userId
- accountId
- type
- amount
- category
- description
- createdAt

#### Response:

- 200 OK with JSON payload:

```json
{
  "message": "Transaction updated successfully"
}
```

- 4XX with JSON Payload:

```json
{
  "message": "{Error message}"
}
```

### DELETE: /api/v1/transactions

#### Required:

- JWT (as bearer token)

#### Response:

- 200 OK with JSON payload:

```json
{
  "message": "Transaction deleted successfully"
}
```

- 4XX with JSON Payload:

```json
{
  "message": "{Error message}"
}
```

## Debts

### GET: /api/v1/debts?{query}

#### Query (optional)

```
limit={start}&skip={end}&until={until}
```

#### Required:

- JWT (as bearer token)

#### Response:

- 200 OK with JSON Payload:

```json
{
  "message": "Account",
  "data": [
    {
      "userId": "{userId}",
      "type": "{type}",
      "amount": "{amount}",
      "name": "{name}",
      "description": "{description}",
      "startDate": "{startDate}",
      "dueDate": "{dueDate}"
    },
    {
      /* ... */
    }
    //...
  ]
}
```

- 4xx with JSON Payload:

```json
{
  "message": "{Error message}"
}
```

### POST: /api/v1/debts

#### Required (as JSON payload):

- userId
- ~~accountId~~
- type
- amount
- name
- description
- startDate
- endDate

#### Response:

- 201 CREATED
- 4XX with JSON Payload:

```json
{
  "message": "{Error message}"
}
```

### PATCH: /api/v1/debts

#### Required:

- JWT (as bearer token)

#### Optional (as JSON payload):

- userId
- ~~accountId~~
- type
- amount
- name
- description
- startDate
- endDate

#### Response:

- 200 OK with JSON payload:

```json
{
  "message": "Debt updated successfully"
}
```

- 4XX with JSON Payload:

```json
{
  "message": "{Error message}"
}
```

### DELETE: /api/v1/debts

#### Required:

- JWT (as bearer token)

#### Response:

- 200 OK with JSON payload:

```json
{
  "message": "Debt deleted successfully"
}
```

- 4XX with JSON Payload:

```json
{
  "message": "{Error message}"
}
```
