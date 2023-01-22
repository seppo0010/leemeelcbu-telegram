FROM node:18.13-bullseye as build

RUN apt-get update && apt-get -y install \
  build-essential\
  libcairo2-dev\
  libpango1.0-dev\
  libjpeg-dev\
  libgif-dev\
  librsvg2-dev\
  && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src
COPY ["package.json", "package-lock.json", "/usr/src/"]
RUN npm ci --loglevel=warn --progress=false --porcelain
COPY ["src", "tsconfig.json", "/usr/src/"]
RUN npm run build

FROM node:18.13-bullseye as runtime
RUN apt-get update && apt-get -y install \
  build-essential\
  libcairo2-dev\
  libpango1.0-dev\
  libjpeg-dev\
  libgif-dev\
  librsvg2-dev\
  && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src
COPY ["package.json", "package-lock.json", "/usr/src/"]
RUN npm ci --loglevel=warn --progress=false --porcelain --omit=dev
COPY --from=build /usr/src/dist /usr/src/dist
CMD node dist/index.js
