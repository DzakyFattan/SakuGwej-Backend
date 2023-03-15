## API Documentations

### POST: /api/v1/user/register

#### Required (as JSON payload):

- username
- email
- password

#### Response:

- 201 OK
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
