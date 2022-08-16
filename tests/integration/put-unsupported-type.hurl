# tests/integration/put-unsupported-type.hurl
# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# user1@email.com:password1
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
# We're sending a plain text fragment
Content-Type: text/plain
# Body of the request goes in ```...``` when it's a string
```This is a fragment!```


# We expect to get back an HTTP 201
HTTP/1.1 201
[Captures]
url: header "Location"

# PUT request with authorization
PUT {{url}} 
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
Content-Type: text/markdown
## I'm the new fragment!

# We expect to get back an HTTP 400
# Cannot change content type once its saved
HTTP/1.1 400


