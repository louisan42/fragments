# tests/integration/post-fragments-unauthenticated.hurl
# posting a fragment when not authenticated produces a 401 error
POST http://localhost:8080/v1/fragments

# We're sending a plain text fragment
Content-Type: text/plain; charset=utf-8

# Body of the request goes in ```...``` when it's a string
```This is an unauthenticated post!```

# 1. We expect to get back an HTTP 401
HTTP/1.1 401
