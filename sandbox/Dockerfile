FROM node:22.22-slim

WORKDIR /app

# Libraries available to learner code. Installed at build time because
# containers run with --network=none and cannot download anything.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY harness ./harness

# Mount points for learner code and problem files (created as root,
# before switching user). Files stay owned by root, so the "node" user
# can read the harness but never modify it.
RUN mkdir -p student tests

ENV NODE_ENV=production

# Run as the unprivileged "node" user that ships with the official image
USER node

# Not used by the system (every run passes its own command); handy for manual checks:
#   docker run --rm -v ...:/app/student/app.js:ro -v ...:/app/tests/http-problem.json:ro sslab-runner
CMD ["node", "harness/run-http.js", "student/app.js", "tests/http-problem.json"]