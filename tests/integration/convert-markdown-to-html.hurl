# tests/integration/convert-markdown-to-html.hurl
# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# user1@email.com:password1
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
# We're sending a markdown fragment
Content-Type: text/markdown
```# H1 header```

# We expect to get back an HTTP 201
HTTP/1.1 201
[Captures]
url: header "Location"

# Try to convert that fragment to text
GET {{url}}.html
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

# 200 success response , content-type changed to text/html
# charset added by default from express server, see https://github.com/expressjs/express/issues/2654
HTTP/1.1 200
Content-Type: text/html; charset=utf-8
[Asserts]
body == "<h1>H1 header</h1>\n"
