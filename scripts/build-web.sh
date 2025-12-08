# Root dir
pnpm add -g turbo@2

turbo prune web --docker

# From root -> web-build dir
mkdir ./web-build && cd ./web-build

cp -r ../out/json ./

pnpm install --frozen-lockfile

cp -r ../out/full ./

pnpm turbo build --filter=web

pnpm deploy --filter=web --prod ./web-build/prod

rm -rf ../out