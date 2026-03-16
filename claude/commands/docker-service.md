Create or update Docker configuration for: $ARGUMENTS

Follow this approach:

1. **Dockerfile** (if needed):
   - Use specific base image tags (not `latest`)
   - Multi-stage builds to minimize final image size
   - Order layers from least to most frequently changed (for cache efficiency)
   - Use `.dockerignore` to exclude unnecessary files
   - Run as non-root user
   - Use COPY over ADD
   - Combine RUN commands to reduce layers
   - Set proper HEALTHCHECK

2. **Docker Compose**:
   - Use version 3.8+ compose format
   - Define services with clear names
   - Use environment files (`.env`) for configuration
   - Set up proper networking (named networks)
   - Define volumes for persistent data
   - Add depends_on with health checks (condition: service_healthy)
   - Set resource limits (memory, CPU) for production
   - Use profiles for optional services (debug tools, admin panels)

3. **Development Workflow**:
   - Hot-reload via volume mounts for source code
   - Expose debugger ports
   - Include useful dev tools (mailhog, redis-commander, adminer)
   - Fast rebuild with BuildKit (DOCKER_BUILDKIT=1)
   - Use `docker compose watch` for auto-rebuild

4. **Common Service Patterns**:
   - **PHP/Laravel**: php-fpm + nginx, proper opcache config, queue worker as separate service
   - **Node.js**: Multi-stage build, npm ci for reproducible installs
   - **Database**: Named volume for data, initialization scripts in /docker-entrypoint-initdb.d
   - **Redis**: Persistence config, maxmemory policy
   - **Nginx**: Custom config via volume mount, SSL in production

5. **Security**:
   - Don't store secrets in images (use Docker secrets or env vars)
   - Scan images for vulnerabilities
   - Use read-only filesystems where possible
   - Network isolation between services

6. **Production Considerations**:
   - Separate compose files (docker-compose.yml + docker-compose.prod.yml)
   - Logging driver configuration
   - Restart policies (unless-stopped or always)
   - Health checks for all services
