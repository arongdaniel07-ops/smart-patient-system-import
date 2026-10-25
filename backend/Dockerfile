# Multi-stage Dockerfile for Smart Patient Spring Boot Backend
# Stage 1: Build
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .

# Download dependencies
RUN chmod +x ./mvnw && ./mvnw dependency:go-offline -B

# Copy source code and build executable JAR
COPY src ./src
RUN ./mvnw clean package -DskipTests -B

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create upload storage directory
RUN mkdir -p /app/storage/uploads

# Copy built JAR from builder
COPY --from=builder /app/target/smart-patient-backend-*.jar app.jar

# Environment defaults
ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:${PORT}/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT} -jar app.jar"]
