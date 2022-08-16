# tests/integration/convert-with-unsupported-type.hurl
# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# user1@email.com:password1
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
# We're sending a text fragment
Content-Type: text/plain
```I am a text!```

# We expect to get back an HTTP 201
HTTP/1.1 201
[Captures]
url: header "Location"

# Try to convert that fragment to application/pdf
GET {{url}}.pdf
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

# 415 fail response , unsupported conversion
HTTP/1.1 415

