# tests/imtegration/lab-10-dynamodb.hurl
# Authenticated POST to /v1/fragments

# 1. POST JSON fragment to /v1/fragments
POST http://localhost:8080/v1/fragments

# user1@email.com:password1
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

# We're sending a plain text fragment
Content-Type: application/json

# Body of the request goes in {.....} JSON body
{
  "service": "DynamoDB"
}

# 2. We expect to get back an HTTP 201
HTTP/1.1 201

# Capture the Location URL into a variable named `url`
[Captures]
fragment1_url: header "Location"
fragment1_id: jsonpath "$['fragment'].id"
fragment1_ownerId: jsonpath "$['fragment'].ownerId"

# 3. Try to GET the expanded fragment we just posted by its URL
GET {{fragment1_url}}/info
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
HTTP/1.1 200

[Asserts]
jsonpath "$['fragment'].id" == {{fragment1_id}}
jsonpath "$['fragment'].ownerId" == {{fragment1_ownerId}}
jsonpath "$['fragment'].created" isString
jsonpath "$['fragment'].updated" isString
jsonpath "$['fragment'].size" isInteger
jsonpath "$['fragment'].type" == "application/json"

# 4. Post second fragment as a markdown
POST http://localhost:8080/v1/fragments

# user1@email.com:password1
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

# We're sending a plain text fragment
Content-Type: text/markdown

# Body of the request goes in ```....```  text body
``` DynamoDB is ***great***. ```

# 5. We expect to get back an HTTP 201
HTTP/1.1 201

# Capture the Location URL into a variable named `url`
[Captures]
fragment2_url: header "Location"
fragment2_id: jsonpath "$['fragment'].id"
fragment2_ownerId: jsonpath "$['fragment'].ownerId"

# 6. Try to GET the fragment we just posted by its URL without expanding it
GET {{fragment2_url}}/info
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
HTTP/1.1 200

[Asserts]
jsonpath "$['fragment'].id" == {{fragment2_id}}
jsonpath "$['fragment'].ownerId" == {{fragment2_ownerId}}
jsonpath "$['fragment'].created" isString
jsonpath "$['fragment'].updated" isString
jsonpath "$['fragment'].size" isInteger
jsonpath "$['fragment'].type" == "text/markdown"

# 7. Try to GET all fragments for the same authorized user
GET http://localhost:8080/v1/fragments
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
HTTP/1.1 200

[Asserts]
jsonpath "$['fragments']" isCollection
jsonpath "$['fragments']" includes {{fragment1_id}}
jsonpath "$['fragments']" includes {{fragment2_id}}


# 8. Try to DELETE the first fragment
DELETE {{fragment1_url}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

# 9. We expect to get back an HTTP 200
HTTP/1.1 200

# 10. Try to GET the first fragment we just deleted by its URL
GET {{fragment1_url}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

# 11. We expect to get back an HTTP 404
HTTP/1.1 404

# 12. Try to GET all fragments for the same authorized user
GET http://localhost:8080/v1/fragments
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
HTTP/1.1 200

[Asserts]
jsonpath "$['fragments']" not includes {{fragment1_id}}
jsonpath "$['fragments']" includes {{fragment2_id}}
