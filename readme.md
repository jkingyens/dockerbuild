Build Client
############

This client pushes a local docker build context to a build server. Configuration via enviornment varaibles. BUILD_HOST and BUILD_PORT point to the build server. set BUILD_AUTH to whatever token you picked on your server.

Usage
#####

This tool is designed to be simple to use. There is only a single command that you invoke on your directory. For example:

    publish jkingyens/myimage

This will bundle all files in the current directory (honoring .gitignore) and ship them over to your build server. The build server will then run the docker build and tag the image with jkingyens/myimage. If the build completes successfully it will push the resulting image to the docker index. You must ensure you are authorized to publish to whatever namespace you provide here.
