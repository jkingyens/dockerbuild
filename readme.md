Dockerbuild is a command-line tool written in node.js that enables you to bulid and publish docker images using a remote server that you have access to. This is particularly useful if your developmenet machine is OSX or Windows where Docker does not run natively. Rather than setting up a local VM on your local machine just to build and publish Docker images, you can simply proxy these requests to your Linux server.

While you could get the same functionality using Docker's trusted build + github repo, this is a better work flow when doing development. It doesn't require commiting changes through a github repo, which is useful when you just want to do test deployments. But more importantly, it doesn't overwhelm Docker's servers with your own development build jobs. You should be paying for these builds, not Docker :)

### Usage

  1. Setup [build server](https://github.com/jkingyens/build-server) (see its readme.md)
  2. Install this client on your dev machine: `npm install -g dockerbuild`
  3. Set environment variables to point to your build server and auth credentials:

  	* BUILD_HOST - host of build-server deployment
    * BUILD_PORT - port of build-server deployment
    * BUILD_AUTH - server-side auth token

Now you can publish docker images from local source trees:

    publish <username/repo>

This will tar+gzip your build context, taking into consideration your .gitignore file (so node_modules will not transmit, for instance). It will then run a docker build job on the remote server, and push the resulting image to the docker registry (index.docker.io), tagging it as username/repo.

### Security

Security is pretty basic for right now. Just choose a shared token for your client and server. The token is passed via http authorization headers. Your server-side environment must be setup with proper docker authentication so that you can push to the docker.io image registry. You can push to both public and private repos as long as you have correct authorization to do so.
