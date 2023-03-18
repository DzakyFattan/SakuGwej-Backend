## API Documentations

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

- jwt (as bearer token)

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
    "phoneNumber": "{phoneNumber}"
  }
}
```

- 4xx with JSON Payload:

```json
{
  "message": "{Error message}"
}
```

### GET: /api/v1/accounts

#### Required:

- jwt (as bearer token)

#### Response:

- 200 OK with JSON Payload:

```json
{
  "message": "Account",
  "data": {
    "userId": "{userId}",
    "accountName": "{accountName}",
    "accountNumber": "{accountNumber}
  }
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
- accountName
- accountNumber

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
- accountName
- accountNumber

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
