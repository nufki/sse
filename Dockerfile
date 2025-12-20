# ---- Build stage ---------------------------------------------------------
FROM eclipse-temurin:21-jdk AS builder

WORKDIR /app

# Copy build files and sources
COPY mvnw* pom.xml ./
COPY .mvn .mvn
COPY src src

# Build the JAR (skip tests if you want faster image builds)
RUN ./mvnw -q -DskipTests package

# ---- Runtime stage -------------------------------------------------------
FROM eclipse-temurin:21-jre-jammy

# Create non‑root user
RUN useradd -u 10001 spring

WORKDIR /app

# Copy the fat JAR from the build stage
COPY --from=builder /app/target/*.jar app.jar

# Expose the HTTP port (docu only)
EXPOSE 8099

USER spring

# JVM flags are optional; tune to your needs
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
