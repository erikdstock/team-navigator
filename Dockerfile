FROM node:boron

# Create app directory
ENV INSTALL_PATH /usr/src/app
RUN mkdir -p $INSTALL_PATH
WORKDIR $INSTALL_PATH 
RUN apt-get update && apt-get install -qq -y apt-transport-https && \
    curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
    apt-get update && \
    apt-get install -qq -y build-essential apt-transport-https yarn --fix-missing --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

COPY package.json yarn.lock ./

# See https://github.com/yarnpkg/yarn/issues/2828
RUN yarn global add node-gyp && yarn install
COPY . ./
CMD ["yarn", "start"]

