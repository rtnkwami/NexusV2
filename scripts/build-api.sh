# Root dir
pnpm add -g turbo@2

turbo prune api --docker

# From root -> api-build dir
mkdir ./api-build && cd ./api-build

cp -r ../out/json ./

pnpm install --frozen-lockfile

cp -r ../out/full ./

pnpm turbo build --filter=api

pnpm deploy --filter=api --prod ./api-build/prod

rm -rf ../out
