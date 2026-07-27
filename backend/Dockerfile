# ============================================================
# Stage 1: Build the application with Maven
# ============================================================
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

# Copy only the POM first to leverage Docker layer caching for dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Now copy the source and build
COPY src ./src
RUN mvn clean package -DskipTests -B

# ============================================================
# Stage 2: Slim runtime image
# ============================================================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy only the built jar from the build stage (nothing else — no Maven, no source, no build tools)
COPY --from=build /app/target/*.jar app.jar

# Render sets $PORT at runtime; default to 8080 for local docker run
ENV PORT=8080
EXPOSE 8080

# Run as a non-root user for basic security hygiene
RUN addgroup -S spring && adduser -S spring -G spring
USER spring

ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=${PORT}"]
