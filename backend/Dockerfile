# Usa una imagen oficial de Maven para compilar
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Usa una imagen oficial de Java para correr la app
FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY --from=build /app/target/backend-1.0-SNAPSHOT.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"] 