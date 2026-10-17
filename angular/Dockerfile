# Angular 21 needs Node ^20.19 || ^22.12 || >=24
FROM node:22

# signatures.
WORKDIR /app
COPY package.json ./
RUN npm install -g "$(node -p 'require("./package.json").packageManager')"

# Install dependencies first, from the manifests and the lockfile only, so this
# layer is cached and the install is reproducible. pnpm-workspace.yaml carries the
# approved build scripts (cypress, esbuild, ...) that pnpm would otherwise block.
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Copy the application source. node_modules/dist are excluded via .dockerignore.
COPY . .

EXPOSE 4200

# ng comes from the local devDependency, so no global install is needed.
CMD ["pnpm", "exec", "ng", "serve", "--host", "0.0.0.0", "--port", "4200"]
