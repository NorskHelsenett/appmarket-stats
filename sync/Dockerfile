# Build stage
FROM golang:1.26-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o main cmd/sync/main.go

# Final stage
FROM alpine:3.24

RUN apk --no-cache add ca-certificates

# Use a more appropriate directory than /root
WORKDIR /app
COPY --from=builder  /app/main /bin/main
RUN chmod +x /bin/main
ENTRYPOINT [ "/bin/main" ]
